import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Scale, Wrench, AlertTriangle, HelpCircle } from "lucide-react";

interface PointItem {
  title: string;
  desc: string;
}

interface EthicsSceneProps {
  badge: string;
  points: PointItem[];
}

export const EthicsScene: React.FC<EthicsSceneProps> = ({ badge, points }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const iconMap: Record<number, React.ReactNode> = {
    0: <Scale size={42} color="#38BDF8" />,
    1: <Wrench size={42} color="#F59E0B" />,
    2: <AlertTriangle size={42} color="#F43F5E" />,
  };

  const accentColors = [
    { border: "rgba(56, 189, 248, 0.4)", bg: "rgba(56, 189, 248, 0.08)", glow: "rgba(56, 189, 248, 0.2)" },
    { border: "rgba(245, 158, 11, 0.4)", bg: "rgba(245, 158, 11, 0.08)", glow: "rgba(245, 158, 11, 0.2)" },
    { border: "rgba(244, 63, 94, 0.4)", bg: "rgba(244, 63, 94, 0.08)", glow: "rgba(244, 63, 94, 0.2)" },
  ];

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
      {/* Top Header Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "rgba(245, 158, 11, 0.15)",
          border: "1px solid rgba(245, 158, 11, 0.4)",
          borderRadius: 9999,
          padding: "8px 24px",
          color: "#FBBF24",
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 48,
          opacity: interpolate(frame, [0, 15], [0, 1]),
        }}
      >
        <HelpCircle size={20} color="#FBBF24" />
        <span>{badge}</span>
      </div>

      {/* 3 Grid Cards */}
      <div
        style={{
          display: "flex",
          gap: 36,
          maxWidth: 1440,
          width: "100%",
          justifyContent: "center",
        }}
      >
        {points.map((point, idx) => {
          const delay = idx * 14;
          const cardSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 13, stiffness: 95 },
          });

          const color = accentColors[idx % accentColors.length];

          return (
            <div
              key={idx}
              style={{
                flex: 1,
                maxWidth: 440,
                backgroundColor: "rgba(15, 23, 42, 0.88)",
                backdropFilter: "blur(20px)",
                border: `2px solid ${color.border}`,
                borderRadius: 24,
                padding: "44px 36px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                boxShadow: `0 20px 40px rgba(0, 0, 0, 0.6), 0 0 35px ${color.glow}`,
                transform: `scale(${cardSpring}) translateY(${interpolate(
                  frame - delay,
                  [0, 20],
                  [50, 0],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                )}px)`,
                opacity: interpolate(frame - delay, [0, 15], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {/* Icon Container */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  backgroundColor: color.bg,
                  border: `1px solid ${color.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                }}
              >
                {iconMap[idx]}
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#F8FAFC",
                  margin: "0 0 14px 0",
                  lineHeight: 1.25,
                }}
              >
                {point.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: 18,
                  lineHeight: 1.55,
                  color: "#94A3B8",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {point.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
