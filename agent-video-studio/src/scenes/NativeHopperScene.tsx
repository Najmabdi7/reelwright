import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { MacWindow } from "../components/MacWindow";
import { Cpu, Binary, ShieldCheck, Activity, Terminal } from "lucide-react";

interface NativeHopperSceneProps {
  imageSrc: string;
  title: string;
  badge: string;
}

export const NativeHopperScene: React.FC<NativeHopperSceneProps> = ({
  imageSrc,
  title,
  badge,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const windowSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  // Smooth zoom pan across the assembly listing in Hopper
  const scale = interpolate(frame, [0, 324], [1, 1.18], {
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [0, 324], [0, -50], {
    extrapolateRight: "clamp",
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
            backgroundColor: "rgba(168, 85, 247, 0.15)",
            border: "1px solid rgba(168, 85, 247, 0.4)",
            borderRadius: 9999,
            padding: "6px 20px",
            color: "#C084FC",
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          <Binary size={18} color="#C084FC" />
          <span>{badge}</span>
        </div>

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
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          <Cpu size={18} color="#38BDF8" />
          <span>MOTEURS NATIVE : HOPPER + NSA GHIDRA</span>
        </div>
      </div>

      {/* Main Container: Split Disassembly View + Real Tool Ecosystem */}
      <div
        style={{
          display: "flex",
          gap: 24,
          width: "100%",
          maxWidth: 1720,
          height: 720,
          alignItems: "stretch",
          transform: `scale(${windowSpring})`,
        }}
      >
        {/* Left: Main Hopper Disassembler Analysis Window (66% width) */}
        <div style={{ flex: "0 0 66%", height: "100%" }}>
          <MacWindow
            title="Hopper Disassembler v5 — Native Mach-O / ARM64 Analysis"
            width="100%"
            height={720}
          >
            <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", backgroundColor: "#1e1e1e" }}>
              <Img
                src={staticFile(imageSrc)}
                style={{
                  width: "100%",
                  height: "auto",
                  transform: `scale(${scale}) translateY(${translateY}px)`,
                  transformOrigin: "top center",
                }}
              />

              {/* Live Memory Overlay HUD */}
              <div
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  right: 16,
                  backgroundColor: "rgba(15, 23, 42, 0.88)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(168, 85, 247, 0.4)",
                  borderRadius: 12,
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontFamily: "monospace",
                  fontSize: 13,
                  color: "#E2E8F0",
                }}
              >
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <span style={{ color: "#38BDF8" }}>PC: 0x10003A4B0</span>
                  <span style={{ color: "#4ADE80" }}>X0: 0x104A8B000</span>
                  <span style={{ color: "#FACC15" }}>SP: 0x7FFEEFBFC600</span>
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <span style={{ color: "#C084FC" }}>CFG BLOCKS: 2 481</span>
                  <span style={{ color: "#34D399", fontWeight: 700 }}>✓ PSEUDO-C GÉNÉRÉ</span>
                </div>
              </div>
            </div>
          </MacWindow>
        </div>

        {/* Right: Real Tools Websites & MCP Protocol Bridge (34% width) */}
        <div
          style={{
            flex: "0 0 32%",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            height: "100%",
          }}
        >
          {/* Top: Real Hopper App Official Site */}
          <div
            style={{
              flex: 1,
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                padding: "8px 14px",
                backgroundColor: "rgba(168, 85, 247, 0.15)",
                borderBottom: "1px solid rgba(168, 85, 247, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 12, fontFamily: "monospace", color: "#C084FC", fontWeight: 700 }}>
                hopperapp.com — Disassembler macOS
              </span>
              <span style={{ fontSize: 11, color: "#94A3B8" }}>v5.14 ARM64</span>
            </div>
            <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
              <Img
                src={staticFile("assets/hopper_web.png")}
                style={{
                  width: "100%",
                  height: "auto",
                  transform: `scale(${interpolate(frame, [0, 324], [1, 1.08])})`,
                }}
              />
            </div>
          </div>

          {/* Bottom: Real NSA Ghidra SRE Suite */}
          <div
            style={{
              flex: 1,
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              backgroundColor: "rgba(15, 23, 42, 0.9)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                padding: "8px 14px",
                backgroundColor: "rgba(56, 189, 248, 0.15)",
                borderBottom: "1px solid rgba(56, 189, 248, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 12, fontFamily: "monospace", color: "#38BDF8", fontWeight: 700 }}>
                ghidra-sre.org — NSA Software Reverse Engineering
              </span>
              <span style={{ fontSize: 11, color: "#94A3B8" }}>SRE Suite</span>
            </div>
            <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
              <Img
                src={staticFile("assets/ghidra_web.png")}
                style={{
                  width: "100%",
                  height: "auto",
                  transform: `scale(${interpolate(frame, [0, 324], [1, 1.08])})`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
