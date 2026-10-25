import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { MacWindow } from "../components/MacWindow";
import { Star, Flame, GitFork, Eye, Globe } from "lucide-react";

interface BrowserSceneProps {
  url: string;
  imageSrc: string;
  title: string;
  stars: string;
  badge: string;
}

export const BrowserScene: React.FC<BrowserSceneProps> = ({
  url,
  imageSrc,
  title,
  stars,
  badge,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animation
  const windowSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  // Ken Burns zoom effect into the screenshot
  const imageScale = interpolate(frame, [0, 389], [1, 1.15], {
    extrapolateRight: "clamp",
  });
  const imageTranslateY = interpolate(frame, [0, 389], [0, -40], {
    extrapolateRight: "clamp",
  });

  // Floating website preview entrance
  const pipSpring = spring({
    frame: frame - 40,
    fps,
    config: { damping: 13, stiffness: 95 },
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "0 40px",
      }}
    >
      {/* Top Header Badges */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          marginBottom: 16,
          opacity: interpolate(frame, [0, 15], [0, 1]),
          transform: `translateY(${interpolate(frame, [0, 15], [-20, 0])}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "rgba(56, 189, 248, 0.15)",
            border: "1px solid rgba(56, 189, 248, 0.4)",
            borderRadius: 9999,
            padding: "6px 20px",
            color: "#38BDF8",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          <Flame size={18} color="#38BDF8" />
          <span>{badge}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: "rgba(234, 179, 8, 0.15)",
            border: "1px solid rgba(234, 179, 8, 0.4)",
            borderRadius: 9999,
            padding: "6px 20px",
            color: "#FACC15",
            fontSize: 16,
            fontWeight: 800,
          }}
        >
          <Star size={18} fill="#FACC15" color="#FACC15" />
          <span>{stars} ÉTOILES SUR GITHUB</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: "rgba(168, 85, 247, 0.15)",
            border: "1px solid rgba(168, 85, 247, 0.4)",
            borderRadius: 9999,
            padding: "6px 20px",
            color: "#C084FC",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          <GitFork size={18} color="#C084FC" />
          <span>25 400 FORKS</span>
        </div>
      </div>

      {/* Main Browser Window with GitHub */}
      <div
        style={{
          transform: `scale(${windowSpring})`,
          transformOrigin: "center center",
          position: "relative",
          width: 1480,
          height: 720,
        }}
      >
        <MacWindow url={url} title={title} width="100%" height={720}>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              overflow: "hidden",
              backgroundColor: "#0d1117",
            }}
          >
            <Img
              src={staticFile(imageSrc)}
              style={{
                width: "100%",
                height: "auto",
                transform: `scale(${imageScale}) translateY(${imageTranslateY}px)`,
                transformOrigin: "top center",
              }}
            />
          </div>
        </MacWindow>

        {/* Floating Picture-in-Picture: Real rea.tools Official Site */}
        <div
          style={{
            position: "absolute",
            bottom: -20,
            right: -20,
            width: 480,
            borderRadius: 16,
            overflow: "hidden",
            border: "2px solid rgba(56, 189, 248, 0.5)",
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(56, 189, 248, 0.25)",
            transform: `scale(${pipSpring})`,
            zIndex: 10,
          }}
        >
          <div
            style={{
              padding: "8px 14px",
              backgroundColor: "rgba(30, 41, 59, 0.8)",
              borderBottom: "1px solid rgba(56, 189, 248, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Globe size={14} color="#38BDF8" />
              <span style={{ fontSize: 12, color: "#38BDF8", fontFamily: "monospace", fontWeight: 700 }}>
                rea.tools — Site Officiel
              </span>
            </div>
            <span style={{ fontSize: 11, color: "#4ADE80", fontWeight: 700 }}>LIVE</span>
          </div>
          <div style={{ position: "relative", height: 230, overflow: "hidden" }}>
            <Img
              src={staticFile("assets/rea_website.png")}
              style={{
                width: "100%",
                height: "auto",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
