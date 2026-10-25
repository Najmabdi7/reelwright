import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Sparkles, Terminal, Code2, ShieldAlert } from "lucide-react";

interface HookSceneProps {
  title: string;
  subtitle: string;
  badge: string;
}

export const HookScene: React.FC<HookSceneProps> = ({
  title,
  subtitle,
  badge,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const badgeOpacity = interpolate(frame, [0, 15], [0, 1]);
  const textY = interpolate(frame, [0, 20], [40, 0]);

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
      }}
    >
      {/* Floating Badge */}
      <div
        style={{
          opacity: badgeOpacity,
          transform: `scale(${scale})`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          border: "1px solid rgba(239, 68, 68, 0.5)",
          borderRadius: 9999,
          padding: "8px 24px",
          color: "#F87171",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          boxShadow: "0 0 25px rgba(239, 68, 68, 0.3)",
          marginBottom: 32,
        }}
      >
        <Sparkles size={20} color="#F87171" />
        <span>{badge}</span>
      </div>

      {/* Main Title */}
      <h1
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 84,
          fontWeight: 900,
          lineHeight: 1.1,
          textAlign: "center",
          maxWidth: 1300,
          margin: 0,
          transform: `translateY(${textY}px) scale(${scale})`,
          background: "linear-gradient(135deg, #FFFFFF 30%, #38BDF8 70%, #818CF8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.8))",
          letterSpacing: "-2px",
        }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 32,
          fontWeight: 500,
          color: "#94A3B8",
          marginTop: 24,
          transform: `translateY(${textY * 1.2}px)`,
          opacity: interpolate(frame, [10, 30], [0, 1]),
          letterSpacing: "-0.5px",
        }}
      >
        {subtitle}
      </p>

      {/* Tech accents */}
      <div
        style={{
          display: "flex",
          gap: 40,
          marginTop: 50,
          opacity: interpolate(frame, [25, 45], [0, 1]),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#38BDF8", fontSize: 20, fontWeight: 600 }}>
          <Terminal size={24} /> <span>Reverse Engineering</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#A855F7", fontSize: 20, fontWeight: 600 }}>
          <Code2 size={24} /> <span>Reconstruction IA</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#F59E0B", fontSize: 20, fontWeight: 600 }}>
          <ShieldAlert size={24} /> <span>Open Source</span>
        </div>
      </div>
    </div>
  );
};
