import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  const glow1X = interpolate(frame, [0, 800], [20, 80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glow2Y = interpolate(frame, [0, 800], [80, 20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#080B11",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {/* Dynamic radial glow 1 (Cyan/Blue) */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: `${glow1X}%`,
          transform: "translate(-50%, -50%)",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(14, 165, 233, 0.07) 40%, rgba(14, 165, 233, 0) 72%)",
        }}
      />

      {/* Dynamic radial glow 2 (Purple/Violet) */}
      <div
        style={{
          position: "absolute",
          top: `${glow2Y}%`,
          right: "10%",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(168, 85, 247, 0.05) 40%, rgba(168, 85, 247, 0) 74%)",
        }}
      />

      {/* Subtle grid pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Dark vignette border */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          boxShadow: "inset 0 0 150px rgba(0,0,0,0.85)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
