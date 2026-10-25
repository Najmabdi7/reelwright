#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Video Studio — pipeline autonome pilotée par un fichier de contenu.

v2 (corrections apportées à la v1) :
  * le contenu (script, scènes, captures) vient d'un JSON, plus du code ;
  * timings de sous-titres MESURÉS (ElevenLabs `with-timestamps`, ou WordBoundary
    d'edge-tts en repli) — plus d'estimation au prorata des lettres ;
  * bornes de scènes dérivées des segments réellement prononcés (plus d'index de
    phrases codés en dur) ;
  * mixage en ffmpeg : ducking sidechain réel, SFX calculés sur les coupes,
    master loudnorm -14 LUFS / -1.5 dBTP en deux passes ;
  * format paramétrable (short 1080x1920@60 ou long 1920x1080@30) ;
  * captures nommées par slug, cache clé sur l'URL, échec explicite si un visuel
    manque (plus de rendu silencieux avec une image absente) ;
  * étape de vérification : durée, résolution, loudness, relecture Whisper et
    mesure de la dérive de synchro — la pipeline ne dit « ok » qu'après.

Usage :
  python3 generate_video_agent.py --content content/rea_short.json --format short
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import re
import subprocess
import sys
import urllib.request
import wave
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
STUDIO_DIR = BASE_DIR / "agent-video-studio"
PUBLIC = STUDIO_DIR / "public"
ASSETS = PUBLIC / "assets"
SFX = PUBLIC / "sfx"
TMP = STUDIO_DIR / ".work"

VOICE_ID = "BUJMBsQ3Oq4cEeWSb48y"  # Sébastien (FR)
MODEL_ID = "eleven_multilingual_v2"
VOICE_SETTINGS = {"stability": 0.5, "similarity_boost": 0.9, "style": 0.12}
EDGE_VOICE = "fr-FR-RemyMultilingualNeural"

FORMATS = {
    "short": {"width": 1080, "height": 1920, "fps": 60, "composition": "Short"},
    "long": {"width": 1920, "height": 1080, "fps": 30, "composition": "VideoEssay"},
}

SR = 48000
GAP = 0.30
LEAD = 0.25
TAIL = 0.70
MUSIC_LEVEL = 0.20


def log(step: str, msg: str) -> None:
    print(f"[{step}] {msg}", flush=True)


def sh(cmd: list[str], **kw) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True, check=False, **kw)


def must(cmd: list[str], what: str) -> subprocess.CompletedProcess:
    res = sh(cmd)
    if res.returncode != 0:
        raise RuntimeError(f"{what} a échoué:\n{res.stderr[-2500:]}")
    return res


def ffprobe_duration(path: Path) -> float:
    res = sh(["ffprobe", "-v", "error", "-show_entries", "format=duration",
              "-of", "default=noprint_wrappers=1:nokey=1", str(path)])
    return float(res.stdout.strip())


def read_env_key(name: str) -> str | None:
    if os.environ.get(name):
        return os.environ[name]
    for candidate in (Path.home() / ".hermes" / ".env", BASE_DIR / ".env"):
        if candidate.exists():
            for line in candidate.read_text().splitlines():
                if line.startswith("#") or "=" not in line:
                    continue
                k, v = line.strip().split("=", 1)
                if k == name:
                    return v.strip().strip('"').strip("'")
    return None


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:48]


# ------------------------------------------------------------------ 1. captures
def capture_assets(content: dict) -> dict[str, Path]:
    log("1/7", "captures web")
    slug = slugify(content.get("slug") or "video")
    out: dict[str, Path] = {}
    caps = content.get("captures", [])
    assets = [c for c in caps if c.get("kind") == "asset"]
    shots = [c for c in caps if c.get("kind") != "asset"]

    for a in assets:
        dest = ASSETS / f"{slug}-{a['name']}.png"
        if not dest.exists() or dest.stat().st_size < 5000:
            req = urllib.request.Request(a["url"], headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=90) as r:
                dest.write_bytes(r.read())
        if dest.stat().st_size < 5000:
            raise RuntimeError(f"visuel distant invalide : {dest}")
        out[a["name"]] = dest
        log("1/7", f"  {a['name']:<9s} <- {a['url']}")

    if shots:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
            ctx = browser.new_context(
                viewport={"width": 1280, "height": 1500},
                device_scale_factor=1.25,
                locale="fr-FR",
                user_agent=("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"),
            )
            for shot in shots:
                dest = ASSETS / f"{slug}-{shot['name']}.png"
                if dest.exists() and dest.stat().st_size > 12000:
                    log("1/7", f"  {shot['name']:<9s} (cache)")
                    out[shot["name"]] = dest
                    continue
                page = ctx.new_page()
                try:
                    page.goto(shot["url"], timeout=45000, wait_until="domcontentloaded")
                    page.wait_for_timeout(shot.get("wait_ms", 2500))
                    page.add_style_tag(content="""
                        [id*="cookie" i],[class*="cookie" i],[id*="consent" i],
                        [class*="consent" i],[aria-label*="cookie" i]{display:none !important}
                    """)
                    page.wait_for_timeout(400)
                    page.screenshot(path=str(dest))
                    log("1/7", f"  {shot['name']:<9s} <- {shot['url']}")
                except Exception as exc:  # noqa: BLE001
                    raise RuntimeError(f"capture impossible pour {shot['url']} : {exc}") from exc
                finally:
                    page.close()
                out[shot["name"]] = dest
            browser.close()

    for name, path in out.items():
        if not path.exists() or path.stat().st_size < 5000:
            raise RuntimeError(f"visuel manquant ou vide : {name} ({path})")
    return out


# ---------------------------------------------------------------------- 2. voix
def tts_elevenlabs(text: str, api_key: str, dest_wav: Path) -> tuple[list[dict], float]:
    body = json.dumps({"text": text, "model_id": MODEL_ID,
                       "voice_settings": VOICE_SETTINGS}).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/with-timestamps",
        data=body, headers={"xi-api-key": api_key, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=180) as resp:
        payload = json.load(resp)

    mp3 = dest_wav.with_suffix(".mp3")
    mp3.write_bytes(base64.b64decode(payload["audio_base64"]))
    must(["ffmpeg", "-v", "error", "-y", "-i", str(mp3), "-ar", str(SR), "-ac", "1",
          "-c:a", "pcm_s16le", str(dest_wav)], "décodage audio ElevenLabs")

    al = payload["alignment"]
    chars = al["characters"]
    starts = al["character_start_times_seconds"]
    ends = al["character_end_times_seconds"]
    words, i = [], 0
    while i < len(chars):
        if chars[i].isspace():
            i += 1
            continue
        j = i
        while j < len(chars) and not chars[j].isspace():
            j += 1
        words.append({"word": "".join(chars[i:j]),
                      "start": round(starts[i], 3),
                      "end": round(ends[j - 1], 3)})
        i = j
    return words, ffprobe_duration(dest_wav)


def tts_edge(text: str, dest_wav: Path) -> tuple[list[dict], float]:
    """Repli gratuit : edge-tts expose de vrais WordBoundary, pas une estimation."""
    import asyncio
    import edge_tts

    mp3 = dest_wav.with_suffix(".mp3")
    words: list[dict] = []

    async def run() -> None:
        comm = edge_tts.Communicate(text, EDGE_VOICE, rate="+5%")
        with open(mp3, "wb") as fh:
            async for chunk in comm.stream():
                if chunk["type"] == "audio":
                    fh.write(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    start = chunk["offset"] / 1e7
                    words.append({"word": chunk["text"], "start": round(start, 3),
                                  "end": round(start + chunk["duration"] / 1e7, 3)})

    asyncio.run(run())
    must(["ffmpeg", "-v", "error", "-y", "-i", str(mp3), "-ar", str(SR), "-ac", "1",
          "-c:a", "pcm_s16le", str(dest_wav)], "décodage audio edge-tts")
    return words, ffprobe_duration(dest_wav)


def proportional_fallback(display: str, start: float, end: float) -> list[dict]:
    """Filet de sécurité uniquement (segment dont l'affichage diffère de la voix)."""
    tokens = display.split()
    total = sum(len(t) for t in tokens) or 1
    words, cur = [], start
    for t in tokens:
        dur = (len(t) / total) * (end - start)
        words.append({"word": t, "start": round(cur, 3), "end": round(cur + dur, 3)})
        cur += dur
    return words


def build_narration(content: dict, engine: str, api_key: str | None):
    log("2/7", f"voix ({engine}) + timings réels")
    TMP.mkdir(parents=True, exist_ok=True)

    # cache : un rendu qui casse après la TTS ne doit pas re-payer la synthèse
    import hashlib
    key = hashlib.sha1(
        (engine + "|" + "|".join(s["speech"] for s in content["segments"])).encode()
    ).hexdigest()
    cache = TMP / "narration.json"
    voice_raw = TMP / "voice_raw.wav"
    if cache.exists() and voice_raw.exists():
        blob = json.loads(cache.read_text())
        if blob.get("key") == key:
            log("2/7", "  cache narration réutilisé")
            return voice_raw, blob["words"], blob["timeline"], blob["duration"]

    silence = TMP / "silence.wav"
    with wave.open(str(silence), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"\x00\x00" * int(SR * GAP))

    parts: list[Path] = []
    timeline: list[dict] = []
    all_words: list[dict] = []
    cursor = LEAD

    for idx, seg in enumerate(content["segments"]):
        wav = TMP / f"seg{idx:02d}.wav"
        if engine == "elevenlabs":
            assert api_key
            words, dur = tts_elevenlabs(seg["speech"], api_key, wav)
        else:
            words, dur = tts_edge(seg["speech"], wav)

        if seg.get("speech") != seg.get("display") and words:
            words = proportional_fallback(seg["display"], words[0]["start"], words[-1]["end"])

        offset = cursor - (words[0]["start"] if words else 0.0)
        shifted = [{"word": w["word"], "start": round(w["start"] + offset, 3),
                    "end": round(w["end"] + offset, 3)} for w in words]
        all_words.extend(shifted)
        timeline.append({"id": seg["id"], "start": round(cursor, 3),
                         "end": round(cursor + dur, 3), "duration": round(dur, 3)})
        log("2/7", f"  {seg['id']:<9s} {dur:6.2f}s  {len(shifted):2d} mots")
        parts.append(wav)
        cursor += dur + GAP

    concat_list = TMP / "concat.txt"
    lines: list[str] = []
    for part in parts:
        lines.append(f"file '{part.name}'")
        lines.append(f"file '{silence.name}'")
    concat_list.write_text("\n".join(lines) + "\n")

    voice_raw = TMP / "voice_raw.wav"
    must(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i",
          str(concat_list), "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le",
          str(voice_raw)], "concaténation de la voix")

    duration = ffprobe_duration(voice_raw)
    for w in all_words:
        if w["end"] > duration:
            w["end"] = round(duration, 3)
    cache.write_text(json.dumps({"key": key, "words": all_words, "timeline": timeline,
                                 "duration": duration}, ensure_ascii=False))
    return voice_raw, all_words, timeline, duration


def build_subtitle_lines(words: list[dict], timeline: list[dict]) -> list[dict]:
    """Lignes de 2 à 4 mots, jamais à cheval sur une ponctuation ou un segment."""
    lines: list[dict] = []
    for seg in timeline:
        chunk: list[dict] = []
        for w in words:
            if not (seg["start"] - 0.01 <= w["start"] <= seg["end"] + 0.01):
                continue
            chunk.append(w)
            if (len(chunk) >= 3 and re.search(r"[.,;:!?]$", w["word"])) or len(chunk) >= 4:
                lines.append({"words": chunk, "start": chunk[0]["start"],
                              "end": round(chunk[-1]["end"] + 0.05, 3)})
                chunk = []
        if chunk:
            lines.append({"words": chunk, "start": chunk[0]["start"],
                          "end": round(chunk[-1]["end"] + 0.05, 3)})
    return lines


# --------------------------------------------------------------------- 3. audio
def loudnorm_2pass(src: Path, dest: Path, i_target=-14.0, tp=-1.5, lra=11.0,
                   channels: int = 2) -> dict:
    """Master en boucle fermée : gain + limiteur, mesuré puis corrigé.

    (La normalisation `loudnorm` en mode linéaire plafonne son gain pour tenir la
    crête : une voix à -22 LUFS / -2.5 dBTP ne peut pas l'atteindre. On applique
    donc un gain borné par la crête, avec limiteur, et on re-mesure.)
    """
    def measure(path: Path) -> tuple[float, float]:
        probe = sh(["ffmpeg", "-hide_banner", "-i", str(path), "-af",
                    f"loudnorm=I={i_target}:TP={tp}:LRA={lra}:print_format=json",
                    "-f", "null", "-"])
        tail = probe.stderr[probe.stderr.rfind("{"):]
        m = json.loads(tail[:tail.rfind("}") + 1])
        return float(m["input_i"]), float(m["input_tp"])

    limiter = 10 ** (tp / 20)
    current = src
    for _ in range(3):
        integ, peak = measure(current)
        gain = i_target - integ
        gain = min(gain, tp - peak)          # ne pas dépasser la crête cible
        if abs(gain) < 0.15:
            break
        must(["ffmpeg", "-v", "error", "-y", "-i", str(current), "-af",
              f"volume={gain:.2f}dB,alimiter=limit={limiter:.4f}:level=false",
              "-ar", str(SR), "-ac", str(channels), "-c:a", "pcm_s16le", str(dest)],
             "application du gain de mastering")
        current = dest
    if current is not dest:
        must(["ffmpeg", "-v", "error", "-y", "-i", str(current), "-ar", str(SR),
              "-ac", str(channels), "-c:a", "pcm_s16le", str(dest)], "conversion du master")
    integ, peak = measure(dest)
    return {"input_i": round(integ, 2), "input_tp": round(peak, 2)}


def build_mix(voice_raw: Path, duration: float, scene_starts: list[float],
              music: Path, out: Path) -> None:
    log("3/7", "mixage (ducking sidechain + SFX sur les coupes + master -14 LUFS)")
    voice_norm = TMP / "voice_norm.wav"
    measure = loudnorm_2pass(voice_raw, voice_norm, channels=1)

    cuts = [t for t in scene_starts[1:] if t > 0.4]
    n_wh = min(len(cuts), 8)
    n_pop = min(len(cuts), 6)

    inputs = ["-i", str(voice_norm), "-stream_loop", "-1", "-i", str(music)]
    filters = [
        (f"[1:a]atrim=0:{duration:.3f},asetpts=N/SR/TB,volume={MUSIC_LEVEL},"
         f"afade=t=out:st={max(duration - 1.4, 0):.3f}:d=1.4,"
         f"aformat=sample_fmts=fltp:sample_rates={SR}:channel_layouts=mono[mus]"),
        "[mus][0:a]sidechaincompress=threshold=0.025:ratio=8:attack=12:release=320[bed]",
    ]

    sfx_labels: list[str] = []
    next_idx = 2
    if n_wh:
        inputs += ["-i", str(SFX / "whoosh.wav")]
        filters.append("[" + str(next_idx) + ":a]asplit=" + str(n_wh) + "".join(
            f"[w{i}]" for i in range(n_wh)))
        for i, t in enumerate(cuts[:n_wh]):
            ms = int(t * 1000)
            filters.append(f"[w{i}]adelay={ms}|{ms},volume=0.22,"
                           f"aformat=sample_fmts=fltp:sample_rates={SR}:channel_layouts=mono[w{i}o]")
            sfx_labels.append(f"[w{i}o]")
        next_idx += 1
    if n_pop:
        inputs += ["-i", str(SFX / "pop.wav")]
        filters.append("[" + str(next_idx) + ":a]asplit=" + str(n_pop) + "".join(
            f"[p{i}]" for i in range(n_pop)))
        for i, t in enumerate(cuts[:n_pop]):
            ms = int((t + 0.18) * 1000)
            filters.append(f"[p{i}]adelay={ms}|{ms},volume=0.18,"
                           f"aformat=sample_fmts=fltp:sample_rates={SR}:channel_layouts=mono[p{i}o]")
            sfx_labels.append(f"[p{i}o]")

    if sfx_labels:
        filters.append("".join(sfx_labels) + f"amix=inputs={len(sfx_labels)}:normalize=0[sfx]")
        filters.append("[0:a][bed][sfx]amix=inputs=3:normalize=0:duration=first[mixraw]")
    else:
        filters.append("[0:a][bed]amix=inputs=2:normalize=0:duration=first[mixraw]")
    filters.append("[mixraw]alimiter=limit=0.94[out]")

    premix = TMP / "premix.wav"
    script = TMP / "mix.filter"
    script.write_text(";\n".join(filters))
    must(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex_script", str(script),
          "-map", "[out]", "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le", str(premix)],
         "mixage audio")

    loudnorm_2pass(premix, out)
    log("3/7", f"  voix {measure['input_i']} LUFS -> master -14 LUFS, {duration:.2f}s")


# ------------------------------------------------------------------- 4. données
def build_video_data(content: dict, images: dict[str, Path], timeline: list[dict],
                     words: list[dict], lines: list[dict], fmt: dict,
                     duration: float, audio_rel: str) -> dict:
    fps = fmt["fps"]
    scene_starts = [max(0.0, timeline[sc["segments"][0]]["start"] - 0.12)
                    for sc in content["scenes"]]

    scenes = []
    for i, sc in enumerate(content["scenes"]):
        start = scene_starts[i]
        end = scene_starts[i + 1] if i + 1 < len(scene_starts) else duration + TAIL
        payload = {k: v for k, v in sc.items() if k not in ("segments", "image")}
        if "image" in sc:
            payload["imageSrc"] = f"assets/{images[sc['image']].name}"
        payload["startFrame"] = int(round(start * fps))
        payload["durationInFrames"] = max(2, int(round((end - start) * fps)))
        scenes.append(payload)

    return {
        "title": content["title"],
        "fps": fps,
        "width": fmt["width"],
        "height": fmt["height"],
        "totalFrames": int(round((duration + TAIL) * fps)),
        "durationSeconds": round(duration, 3),
        "audioSrc": audio_rel,
        "scenes": scenes,
        "words": words,
        "lines": lines,
        "sceneStartsSeconds": [round(s, 3) for s in scene_starts],
    }


# --------------------------------------------------------------------- 5. rendu
def render(composition: str, out_path: Path, concurrency: int) -> None:
    log("5/7", f"rendu Remotion ({composition}, concurrence {concurrency})")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    rel = os.path.relpath(out_path, STUDIO_DIR)
    # cwd = STUDIO_DIR : sinon npx ne trouve pas le binaire remotion (bug v1)
    res = sh(["npx", "remotion", "render", composition, rel,
              f"--concurrency={concurrency}"], cwd=str(STUDIO_DIR))
    if res.returncode != 0:
        raise RuntimeError(f"rendu Remotion a échoué:\n{res.stderr[-2500:]}\n{res.stdout[-1500:]}")


# ---------------------------------------------------------------- 6. vérifier
def normalize(text: str) -> str:
    text = text.lower().replace("'", "'").replace("’", "'")
    return re.sub(r"[^a-zà-ÿ0-9']", "", text)


def verify(video: Path, data: dict) -> dict:
    log("6/7", "vérification (métadonnées, loudness, Whisper, synchro)")
    probe = sh(["ffprobe", "-v", "error", "-show_entries",
                "stream=codec_name,width,height,r_frame_rate,nb_frames",
                "-show_entries", "format=duration,size", "-of", "json", str(video)])
    meta = json.loads(probe.stdout)
    stream = next(s for s in meta["streams"] if s["codec_name"] == "h264")
    loud = sh(["ffmpeg", "-hide_banner", "-i", str(video), "-af",
               "loudnorm=print_format=json", "-f", "null", "-"]).stderr

    report = {
        "file": str(video),
        "size_mb": round(int(meta["format"]["size"]) / 1e6, 2),
        "duration": round(float(meta["format"]["duration"]), 2),
        "resolution": f"{stream['width']}x{stream['height']}",
        "fps": stream["r_frame_rate"],
        "frames": stream.get("nb_frames"),
        "integrated_lufs": round(float(json.loads(loud[loud.rfind("{"):loud.rfind("}") + 1])["input_i"]), 1),
        "true_peak": round(float(json.loads(loud[loud.rfind("{"):loud.rfind("}") + 1])["input_tp"]), 1),
    }

    try:
        import numpy as np
        from faster_whisper import WhisperModel

        wav = TMP / "verify.wav"
        must(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-ar", "16000", "-ac", "1",
              "-c:a", "pcm_s16le", str(wav)], "extraction audio de vérification")
        with wave.open(str(wav)) as wf:
            audio = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
        model = WhisperModel("small", device="cpu", compute_type="int8")
        segs, _ = model.transcribe(audio, language="fr", word_timestamps=True)
        heard = [{"word": w.word.strip(), "start": w.start} for s in segs for w in s.words]
        report["transcript"] = " ".join(h["word"] for h in heard)[:300]

        # appariement texte + fenêtre temporelle : mesure la vraie dérive
        ref = [w for w in data["words"] if w["end"] < data["durationSeconds"] - 0.2]
        pairs = []
        for r in ref:
            best = None
            for h in heard:
                if abs(h["start"] - r["start"]) > 1.5 or not normalize(h["word"]):
                    continue
                if normalize(h["word"]) == normalize(r["word"]):
                    if best is None or abs(h["start"] - r["start"]) < abs(best["start"] - r["start"]):
                        best = h
            if best is not None:
                pairs.append(abs(best["start"] - r["start"]))
        if pairs:
            pairs.sort()
            report["sync_pairs"] = f"{len(pairs)}/{len(ref)}"
            report["sync_median_s"] = round(pairs[len(pairs) // 2], 3)
            report["sync_max_s"] = round(pairs[-1], 3)
            report["sync_ok"] = pairs[-1] <= 0.15
    except Exception as exc:  # noqa: BLE001
        report["transcript_error"] = f"{type(exc).__name__}: {exc}"

    frames_dir = BASE_DIR / "output" / f"{video.stem}-frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    for i in range(6):
        t = data["durationSeconds"] * (i + 0.5) / 6
        must(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", str(video),
              "-frames:v", "1", str(frames_dir / f"f{i}.jpg")], "extraction de frame")
    report["frames"] = str(frames_dir)
    return report


# ------------------------------------------------------------------------ main
def main() -> None:
    ap = argparse.ArgumentParser(description="Agent Video Studio — pipeline pilotée par contenu")
    ap.add_argument("--content", default="content/rea_short.json")
    ap.add_argument("--format", default="short", choices=sorted(FORMATS))
    ap.add_argument("--output", default=None)
    ap.add_argument("--tts", default="elevenlabs", choices=["elevenlabs", "edge"])
    ap.add_argument("--concurrency", type=int, default=3)
    args = ap.parse_args()

    fmt = FORMATS[args.format]
    content = json.loads(Path(args.content).read_text(encoding="utf-8"))
    out_path = (Path(args.output).expanduser().resolve() if args.output
                else BASE_DIR / "output" / f"{content['slug']}-{args.format}.mp4")

    print("=" * 72)
    print(f"🎬 {content['title']}")
    print(f"📐 {args.format} · {fmt['width']}x{fmt['height']}@{fmt['fps']}")
    print(f"🎯 {out_path}")
    print("=" * 72)

    TMP.mkdir(parents=True, exist_ok=True)
    images = capture_assets(content)

    api_key = read_env_key("ELEVENLABS_API_KEY")
    engine = args.tts
    if engine == "elevenlabs" and not api_key:
        log("2/7", "pas de clé ElevenLabs -> repli edge-tts (gratuit)")
        engine = "edge"

    voice_raw, words, timeline, duration = build_narration(content, engine, api_key)
    lines = build_subtitle_lines(words, timeline)
    log("3/7", f"{len(words)} mots, {len(lines)} lignes de sous-titres, {duration:.2f}s")

    audio_final = ASSETS / f"{slugify(content['slug'])}-mix.wav"
    scene_starts = [max(0.0, timeline[sc["segments"][0]]["start"] - 0.12)
                    for sc in content["scenes"]]
    build_mix(voice_raw, duration, scene_starts, SFX / "ambient_bgm.wav", audio_final)

    data = build_video_data(content, images, timeline, words, lines, fmt, duration,
                            f"assets/{audio_final.name}")
    (STUDIO_DIR / "src" / "video_data.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    render(fmt["composition"], out_path, args.concurrency)
    report = verify(out_path, data)

    print("=" * 72)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    print("=" * 72)
    problems = []
    if not report.get("sync_ok", False):
        problems.append(f"synchro max {report.get('sync_max_s')} s (> 0.15)")
    if abs(report["integrated_lufs"] + 14) > 1.5:
        problems.append(f"{report['integrated_lufs']} LUFS au lieu de -14")
    if report["true_peak"] > -1.0:
        problems.append(f"true peak {report['true_peak']} dBTP")
    if problems:
        print("⚠️  " + " · ".join(problems))
        sys.exit(1)
    print("✅ Vidéo produite et vérifiée.")


if __name__ == "__main__":
    main()
