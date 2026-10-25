import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SubtitleLine } from "../types";

interface SubtitleTrackProps {
  lines: SubtitleLine[];
  /** taille de police de base (px) */
  fontSize?: number;
  /** distance au bas du cadre (px) */
  bottom?: number;
  maxWidth?: number;
}

/**
 * Sous-titres mot-à-mot pilotés par des timings réels (fournis par la TTS).
 * Les lignes sont découpées côté pipeline (jamais à cheval sur une ponctuation),
 * donc plus de groupe de 4 mots arbitraire.
 */
export const SubtitleTrack: React.FC<SubtitleTrackProps> = ({
  lines,
  fontSize = 46,
  bottom = 138,
  maxWidth = 900,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // ligne courante : celle qui contient t ; sinon la précédente reste 0.15 s
  let idx = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (t >= lines[i].start - 0.02 && t <= lines[i].end + 0.15) {
      idx = i;
      break;
    }
  }
  if (idx === -1) return null;

  const line = lines[idx];
  const activeWord = line.words.findIndex((w) => t >= w.start && t <= w.end);

  return (
    <div
      style={{
        position: "absolute",
        bottom,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        zIndex: 60,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: `${Math.round(fontSize * 0.22)}px ${Math.round(fontSize * 0.3)}px`,
          backgroundColor: "rgba(8, 11, 17, 0.82)",
          border: "2px solid rgba(255,255,255,0.14)",
          borderRadius: 26,
          padding: `${Math.round(fontSize * 0.3)}px ${Math.round(fontSize * 0.55)}px`,
          boxShadow: "0 12px 34px rgba(0,0,0,0.75)",
        }}
      >
        {line.words.map((w, i) => {
          const isActive = i === activeWord;
          const isPast = t > w.end;
          const pop = isActive ? 1.08 : 1;
          return (
            <span
              key={`${idx}-${i}`}
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize,
                fontWeight: 800,
                letterSpacing: "-0.6px",
                lineHeight: 1.12,
                color: isActive ? "#FACC15" : isPast ? "#FFFFFF" : "#8FA1B8",
                textShadow: isActive ? "0 0 22px rgba(250,204,21,0.55)" : "0 2px 6px rgba(0,0,0,0.9)",
                transform: `scale(${pop})`,
                display: "inline-block",
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
