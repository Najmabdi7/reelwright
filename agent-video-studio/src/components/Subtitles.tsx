import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { WordTiming } from "../types";

interface SubtitlesProps {
  words: WordTiming[];
}

export const Subtitles: React.FC<SubtitlesProps> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Find the currently active word index
  const activeIndex = words.findIndex(
    (w) => currentTime >= w.start && currentTime <= w.end
  );

  // If no word is currently speaking, find the closest upcoming or recent word within 0.5s
  let targetIndex = activeIndex;
  if (targetIndex === -1) {
    targetIndex = words.findIndex((w) => w.start > currentTime);
    if (targetIndex === -1 && words.length > 0 && currentTime <= words[words.length - 1].end + 0.6) {
      targetIndex = words.length - 1;
    }
  }

  if (targetIndex === -1) {
    return null;
  }

  // Group words into short phrases (4 words window around current word)
  const windowSize = 4;
  const chunkStart = Math.floor(targetIndex / windowSize) * windowSize;
  const currentChunk = words.slice(chunkStart, chunkStart + windowSize);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 50,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          backgroundColor: "rgba(10, 15, 26, 0.85)",
          backdropFilter: "blur(12px)",
          border: "2px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 24,
          padding: "14px 28px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0,0,0,0.5)",
        }}
      >
        {currentChunk.map((item, idx) => {
          const globalIdx = chunkStart + idx;
          const isActive = globalIdx === targetIndex && activeIndex !== -1;
          const isPast = currentTime > item.end;

          return (
            <span
              key={`${item.word}-${globalIdx}`}
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "-0.5px",
                textTransform: "uppercase",
                color: isActive
                  ? "#FACC15" // Vibrant Neon Yellow
                  : isPast
                  ? "#FFFFFF"
                  : "#94A3B8",
                textShadow: isActive
                  ? "0 0 20px rgba(250, 204, 21, 0.6), 0 2px 4px rgba(0,0,0,0.8)"
                  : "0 2px 4px rgba(0,0,0,0.8)",
                transform: isActive ? "scale(1.12)" : "scale(1)",
                transition: "transform 0.1s ease",
                display: "inline-block",
              }}
            >
              {item.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
