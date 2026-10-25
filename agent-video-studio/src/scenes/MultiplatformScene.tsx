import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Layers, CheckCircle2 } from "lucide-react";

interface CardItem {
  icon: string;
  title: string;
  desc: string;
}

interface MultiplatformSceneProps {
  badge: string;
  cards: CardItem[];
}

export const MultiplatformScene: React.FC<MultiplatformSceneProps> = ({
  badge,
  cards,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const platformData = [
    {
      tag: "ELECTRON & WEB",
      siteName: "electronjs.org",
      img: "assets/electron_web.png",
      tech: "Dépaquetage ASAR & Source Maps",
      details: ["Archive .asar décompressée", "Extraction Vite / Webpack", "Restitution code TypeScript pur"],
      border: "rgba(56, 189, 248, 0.4)",
      accent: "#38BDF8",
    },
    {
      tag: "ANDROID & KMP",
      siteName: "github.com/skylot/jadx",
      img: "assets/jadx_web.png",
      tech: "Décompilateur DEX vers Java / Kotlin",
      details: ["Décompilation JADX en direct", "Parsing ressources AndroidManifest", "Reconstruction UseCases & ViewModel"],
      border: "rgba(168, 85, 247, 0.4)",
      accent: "#C084FC",
    },
    {
      tag: "RUNTIME DYNAMIQUE",
      siteName: "frida.re",
      img: "assets/frida_web.png",
      tech: "Injection de scripts & Interception API",
      details: ["Interception IPC en mémoire", "Traçage temps réel des arguments", "Validation parité comportementale"],
      border: "rgba(245, 158, 11, 0.4)",
      accent: "#FBBF24",
    },
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
        padding: "0 50px",
      }}
    >
      {/* Top Header Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          backgroundColor: "rgba(56, 189, 248, 0.15)",
          border: "1px solid rgba(56, 189, 248, 0.4)",
          borderRadius: 9999,
          padding: "8px 24px",
          color: "#38BDF8",
          fontSize: 17,
          fontWeight: 800,
          marginBottom: 32,
          opacity: interpolate(frame, [0, 15], [0, 1]),
        }}
      >
        <Layers size={20} color="#38BDF8" />
        <span>{badge}</span>
      </div>

      {/* 3 Rich Multiplatform Cards */}
      <div
        style={{
          display: "flex",
          gap: 32,
          maxWidth: 1720,
          width: "100%",
          justifyContent: "center",
          alignItems: "stretch",
        }}
      >
        {platformData.map((plat, idx) => {
          const delay = idx * 12;
          const cardSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 13, stiffness: 95 },
          });

          return (
            <div
              key={idx}
              style={{
                flex: 1,
                maxWidth: 540,
                backgroundColor: "rgba(15, 23, 42, 0.92)",
                backdropFilter: "blur(20px)",
                border: `2px solid ${plat.border}`,
                borderRadius: 22,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: `0 20px 45px rgba(0, 0, 0, 0.6), 0 0 35px ${plat.accent}22`,
                transform: `scale(${cardSpring})`,
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  padding: "16px 20px",
                  backgroundColor: "rgba(30, 41, 59, 0.6)",
                  borderBottom: `1px solid ${plat.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#EF4444" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#EAB308" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#22C55E" }} />
                  <span style={{ marginLeft: 10, fontSize: 13, color: plat.accent, fontFamily: "monospace", fontWeight: 700 }}>
                    {plat.siteName}
                  </span>
                </div>
                <span
                  style={{
                    backgroundColor: `${plat.accent}22`,
                    border: `1px solid ${plat.accent}66`,
                    color: plat.accent,
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: 6,
                  }}
                >
                  {plat.tag}
                </span>
              </div>

              {/* Real Website Screenshot */}
              <div style={{ position: "relative", height: 250, overflow: "hidden", backgroundColor: "#000" }}>
                <Img
                  src={staticFile(plat.img)}
                  style={{
                    width: "100%",
                    height: "auto",
                    transform: `scale(${interpolate(frame, [0, 364], [1, 1.1])})`,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 12,
                    left: 12,
                    right: 12,
                    backgroundColor: "rgba(15, 23, 42, 0.88)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    border: `1px solid ${plat.border}`,
                  }}
                >
                  {plat.tech}
                </div>
              </div>

              {/* Technical Bullet Points */}
              <div
                style={{
                  padding: "24px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  flex: 1,
                  justifyContent: "center",
                  backgroundColor: "rgba(15, 23, 42, 0.98)",
                }}
              >
                {plat.details.map((detail, dIdx) => (
                  <div
                    key={dIdx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      color: "#E2E8F0",
                      fontSize: 15,
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle2 size={18} color={plat.accent} />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
