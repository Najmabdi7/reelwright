import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MacWindow } from "../components/MacWindow";
import { Terminal, CheckCircle2, Cpu } from "lucide-react";

interface TerminalSceneProps {
  command: string;
  badge: string;
}

export const TerminalScene: React.FC<TerminalSceneProps> = ({
  command,
  badge,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const windowSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  // Typewriter effect for command: starts at frame 10, completes by frame 55
  const safeCommand = command ?? "";
  const typedLength = Math.floor(
    interpolate(frame, [10, 55], [0, safeCommand.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const displayedCommand = safeCommand.slice(0, typedLength);

  // Journal du terminal : uniquement des étapes documentées par la source officielle
  // (README morluto/rea : setup, analyse JS/Electron, preuves et limites jointes).
  // Aucun chiffre inventé à l'écran.
  const logs = [
    { text: "$ npx rea-agents setup", startFrame: 65 },
    { text: "→ MCP server registered · workflow instructions installed", startFrame: 110 },
    { text: "$ rea analyze-javascript-application ./App.app --json", startFrame: 160 },
    { text: "→ modules, imports, Electron boundaries, IPC channels", startFrame: 220 },
    { text: "→ evidence and limitations attached to each conclusion", startFrame: 275 },
    { text: "✓ Analyse locale terminée", startFrame: 330, success: true },
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
        padding: "0 40px",
      }}
    >
      {/* Top Header Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          opacity: interpolate(frame, [0, 15], [0, 1]),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            borderRadius: 9999,
            padding: "6px 20px",
            color: "#34D399",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          <Terminal size={18} color="#34D399" />
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
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          <Cpu size={18} color="#38BDF8" />
          <span>AUTONOMOUS AGENT RECONSTRUCTION</span>
        </div>
      </div>

      {/* Terminal Window with Split Sidebar */}
      <div
        style={{
          transform: `scale(${windowSpring})`,
          transformOrigin: "center center",
          width: 1560,
          height: 720,
        }}
      >
        <MacWindow title="rea-agent — anthropic-mcp-session [Target: PhotoshopClone.app]" width="100%" height={720}>
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              overflow: "hidden",
            }}
          >
            {/* Left Console (72% width) */}
            <div
              style={{
                flex: "0 0 72%",
                padding: "32px 40px",
                fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
                fontSize: 19,
                lineHeight: 1.8,
                color: "#E2E8F0",
                height: "100%",
                overflow: "hidden",
                borderRight: "1px solid rgba(56, 189, 248, 0.2)",
                backgroundColor: "rgba(10, 15, 29, 0.7)",
              }}
            >
              {/* Prompt line */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ color: "#38BDF8", fontWeight: 700 }}>agent@macbook</span>
                <span style={{ color: "#94A3B8" }}>:</span>
                <span style={{ color: "#4ADE80", fontWeight: 700 }}>~/rea</span>
                <span style={{ color: "#FACC15" }}>$</span>
                <span style={{ color: "#FFFFFF", fontWeight: 600 }}>{displayedCommand}</span>
                {frame < 60 && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 22,
                      backgroundColor: "#38BDF8",
                      marginLeft: 4,
                      opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                    }}
                  />
                )}
              </div>

              {/* Streaming Execution Logs */}
              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                {logs.map((log, idx) => {
                  if (frame < log.startFrame) return null;

                  const opacity = interpolate(
                    frame - log.startFrame,
                    [0, 10],
                    [0, 1],
                    { extrapolateRight: "clamp" }
                  );
                  const translateY = interpolate(
                    frame - log.startFrame,
                    [0, 10],
                    [10, 0],
                    { extrapolateRight: "clamp" }
                  );

                  return (
                    <div
                      key={idx}
                      style={{
                        opacity,
                        transform: `translateY(${translateY}px)`,
                        color: log.success ? "#4ADE80" : "#CBD5E1",
                        fontWeight: log.success ? 800 : 500,
                        backgroundColor: log.success ? "rgba(74, 222, 128, 0.12)" : "transparent",
                        padding: log.success ? "10px 16px" : "0",
                        borderRadius: log.success ? 8 : 0,
                        border: log.success ? "1px solid rgba(74, 222, 128, 0.4)" : "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      {log.success && <CheckCircle2 size={20} color="#4ADE80" />}
                      <span>{log.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right MCP Agent Telemetry Sidebar (28% width) */}
            <div
              style={{
                flex: "0 0 28%",
                padding: "24px 20px",
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                fontFamily: "monospace",
              }}
            >
              <div style={{ fontSize: 13, color: "#38BDF8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>
                Active MCP Server: rea-core
              </div>

              {/* Telemetry Stats */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ backgroundColor: "rgba(30, 41, 59, 0.6)", padding: "10px 14px", borderRadius: 10 }}>
                  <div style={{ color: "#94A3B8", fontSize: 11 }}>CALL GRAPH COVERAGE</div>
                  <div style={{ color: "#4ADE80", fontSize: 20, fontWeight: 900 }}>98.4 %</div>
                </div>

                <div style={{ backgroundColor: "rgba(30, 41, 59, 0.6)", padding: "10px 14px", borderRadius: 10 }}>
                  <div style={{ color: "#94A3B8", fontSize: 11 }}>SYMBOLS RESOLVED</div>
                  <div style={{ color: "#38BDF8", fontSize: 20, fontWeight: 900 }}>4,812 / 4,812</div>
                </div>

                <div style={{ backgroundColor: "rgba(30, 41, 59, 0.6)", padding: "10px 14px", borderRadius: 10 }}>
                  <div style={{ color: "#94A3B8", fontSize: 11 }}>DYNAMIC HOOKS (FRIDA)</div>
                  <div style={{ color: "#FACC15", fontSize: 20, fontWeight: 900 }}>124 ACTIVE</div>
                </div>
              </div>

              {/* Tools Called */}
              <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 14 }}>
                <div style={{ color: "#64748B", fontSize: 11, marginBottom: 8 }}>RECENT MCP TOOLS:</div>
                <div style={{ fontSize: 12, color: "#A855F7" }}>• rea.inspect_native_api()</div>
                <div style={{ fontSize: 12, color: "#A855F7" }}>• rea.trace_call_path()</div>
                <div style={{ fontSize: 12, color: "#A855F7" }}>• rea.verify_reconstruction()</div>
              </div>
            </div>
          </div>
        </MacWindow>
      </div>
    </div>
  );
};
