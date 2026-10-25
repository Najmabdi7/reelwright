# 🎬 Agent Video Studio — pipeline vidéo pilotée par le contenu

> Génère une vidéo tech (short vertical 1080×1920 @60 ou format long 1920×1080 @30)
> à partir d'un simple fichier JSON : captures web réelles, voix française avec
> timings mot-à-mot mesurés, motion design Remotion, mixage normé et vérification
> automatique du fichier final.

```bash
git clone https://github.com/Najmabdi7/agent-video-pipeline.git
cd agent-video-pipeline
./setup.sh
source .venv/bin/activate
python3 generate_video_agent.py --content content/rea_short.json --format short
```

Sortie : `output/<slug>-short.mp4`, puis un rapport de vérification (durée,
résolution, LUFS, crête, transcription et dérive de synchro).

---

## Ce que fait la pipeline

```
content/<sujet>.json
        │
        ├─ 1. captures      Playwright (pages) + téléchargement d'assets, cache par nom
        ├─ 2. voix          ElevenLabs with-timestamps (ou edge-tts WordBoundary)
        │                   → un fichier + des timings RÉELS par segment
        ├─ 3. sous-titres    lignes de 2-4 mots, jamais à cheval sur une ponctuation
        ├─ 4. mixage         ffmpeg : ducking sidechain, SFX sur les coupes, -14 LUFS
        ├─ 5. données        video_data.json (scènes dérivées des segments)
        ├─ 6. rendu          Remotion → MP4 H.264/AAC
        └─ 7. vérification   ffprobe + loudnorm + Whisper (transcription et dérive)
```

Points importants :

- **Aucun contenu dans le code.** Script, scènes, textes, captations : tout vient
  de `content/*.json`. Un nouveau sujet = un nouveau JSON.
- **Les sous-titres ne sont pas estimés.** Les timings viennent des timestamps
  renvoyés par la synthèse vocale. La dérive mesurée par Whisper est reportée
  dans le rapport ; au-delà de 0,15 s la pipeline sort en erreur.
- **Les bornes de scènes suivent la voix.** Une scène démarre au premier mot de
  son segment ; aucun index de phrase codé en dur.
- **Les SFX suivent les coupes.** Whoosh et pop sont placés sur les `startFrame`
  réels des scènes, plus sur une liste de frames figée.
- **Le mixage est fait une fois, en ffmpeg**, et non par des volumes statiques
  dans React : la musique est compressée en sidechain par la voix, le master
  sort à −14 LUFS / −1,5 dBTP.

---

## Formats

| `--format` | Taille | Cadence | Composition | Usage |
|---|---|---|---|---|
| `short` (défaut) | 1080×1920 | 60 fps | `Short` | YouTube Shorts, TikTok, Reels |
| `long` | 1920×1080 | 30 fps | `VideoEssay` | vidéo longue 16:9 |

---

## Écrire un contenu

`content/<sujet>.json` :

```jsonc
{
  "slug": "rea",
  "title": "REA : l'IA qui lit les logiciels",
  "captures": [
    { "name": "repo", "url": "https://github.com/morluto/rea", "wait_ms": 3500 },
    { "name": "logo", "kind": "asset", "url": "https://…/logo.png" }
  ],
  "segments": [
    { "id": "hook",
      "speech":  "Texte prononcé.",
      "display": "Texte affiché." }
  ],
  "scenes": [
    { "id": "s1", "type": "hook", "segments": [0], "badge": "…", "title": "…" }
  ]
}
```

- `segments[]` : une phrase par entrée. `speech` peut différer de `display`
  (prononciation d'un sigle) ; dans ce cas les timings du segment retombent sur
  une répartition proportionnelle — à éviter quand c'est possible.
- `scenes[].segments` : les index de segments couverts par la scène. C'est ce
  qui fixe sa durée.
- Types de scènes disponibles en `short` : `hook`, `stats`, `how`, `proof`,
  `flow`, `outro`.
- Types disponibles en `long` : `hook`, `browser`, `native_hopper`,
  `multiplatform`, `terminal`, `casestudy`, `ethics`, `outro`.

---

## Options

```
--content PATH         fichier de contenu (défaut : content/rea_short.json)
--format short|long    format de sortie (défaut : short)
--output PATH          fichier de sortie
--tts elevenlabs|edge  voix (défaut : elevenlabs, repli automatique sur edge-tts
                       si ELEVENLABS_API_KEY est absent)
--concurrency N        workers Remotion (défaut : 3)
```

`ELEVENLABS_API_KEY` est lu depuis l'environnement, sinon depuis `.env` à la
racine du dépôt, sinon depuis `~/.hermes/.env`.

---

## Prérequis

- Node.js 22+ et npm
- Python 3.10+
- `ffmpeg` et `ffprobe` dans le `PATH`
- Chromium Playwright (`setup.sh` s'en occupe)

`setup.sh` crée `.venv`, installe les dépendances Python, le Chromium de
Playwright et les paquets npm du studio.

---

## Structure

```
agent-video-pipeline/
├── generate_video_agent.py      # orchestrateur (7 étapes)
├── content/                     # les sujets, en JSON
├── agent-video-studio/
│   ├── public/assets/           # captures + mix audio générés
│   ├── public/sfx/              # whoosh, pop, click, musique
│   └── src/
│       ├── Root.tsx             # compositions `Short` et `VideoEssay`
│       ├── short/ShortEssay.tsx # scènes verticales 9:16
│       ├── scenes/              # scènes 16:9 (format long)
│       ├── components/          # Background, MacWindow, SubtitleTrack
│       └── video_data.json      # généré — ne pas éditer à la main
└── legacy/                      # v1 conservée pour référence
```

---

## Licence

MIT — voir [LICENSE](LICENSE). © [Najmabdi7](https://github.com/Najmabdi7)
