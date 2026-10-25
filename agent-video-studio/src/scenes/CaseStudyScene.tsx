import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Flame, Lock, CheckCircle2, Zap, Sparkles, DollarSign } from "lucide-react";

interface CaseStudySceneProps {
  badge: string;
  title: string;
  desc: string;
}

export const CaseStudyScene: React.FC<CaseStudySceneProps> = ({
  badge,
  title,
  desc,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  // 3 Phases for the right-side alternatives:
  // Phase 0 (0-95 frames): Photopea (Photoshop clone)
  // Phase 1 (95-185 frames): GIMP & Krita (Open-source raster engines)
  // Phase 2 (185-281 frames): Penpot (Illustrator / Figma alternative)
  const currentTab = frame < 95 ? 0 : frame < 185 ? 1 : 2;

  const tabs = [
    {
      name: "Photopea.com",
      tool: "Clone Photoshop Web",
      img: "assets/photopea_web.png",
      badge: "PHOTOPEA : CLONE COMPLET 100% WEB",
      accent: "#38BDF8",
      features: ["Moteur WebGL / Wasm", "Ouverture PSD native", "0 € / Zéro installation"],
    },
    {
      name: "GIMP & Krita",
      tool: "Moteurs Libres Dédiés",
      img: frame % 60 < 30 ? "assets/gimp_web.png" : "assets/krita_web.png",
      badge: "GIMP & KRITA : SUITES CRÉATIVES LIBRES",
      accent: "#4ADE80",
      features: ["Moteur GEGL 32-bit float", "Brosses & Peinture pro", "Licence GPL Souveraine"],
    },
    {
      name: "Penpot.app",
      tool: "Alternative Illustrator & Figma",
      img: "assets/penpot_web.png",
      badge: "PENPOT : LE STANDARD OPEN SOURCE",
      accent: "#F43F5E",
      features: ["Format SVG natif standard", "Collaboration temps réel", "Auto-hébergeable en local"],
    },
  ];

  const activeTab = tabs[currentTab];

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
        padding: "0 60px",
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
          transform: `scale(${entrance})`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            borderRadius: 9999,
            padding: "6px 20px",
            color: "#F87171",
            fontSize: 16,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          <Flame size={18} color="#F87171" />
          <span>{badge}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "rgba(74, 222, 128, 0.15)",
            border: "1px solid rgba(74, 222, 128, 0.4)",
            borderRadius: 9999,
            padding: "6px 20px",
            color: "#4ADE80",
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: "1px",
          }}
        >
          <Sparkles size={18} color="#4ADE80" />
          <span>VRAIES ALTERNATIVES TESTÉES</span>
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <h2
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 46,
          fontWeight: 900,
          color: "#FFFFFF",
          margin: "0 0 8px 0",
          textAlign: "center",
          letterSpacing: "-1px",
        }}
      >
        Adobe Propriétaire vs Suites Alternatives Libres
      </h2>
      <p
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 21,
          color: "#94A3B8",
          margin: "0 0 28px 0",
          textAlign: "center",
        }}
      >
        Comment REA et l'écosystème open source réimplémentent chaque brique logicielle
      </p>

      {/* Split Comparison Showcase */}
      <div
        style={{
          display: "flex",
          gap: 32,
          width: "100%",
          maxWidth: 1720,
          height: 640,
          alignItems: "stretch",
          transform: `scale(${entrance})`,
        }}
      >
        {/* Left: Proprietary Adobe Creative Cloud */}
        <div
          style={{
            flex: "0 0 40%",
            display: "flex",
            flexDirection: "column",
            borderRadius: 20,
            overflow: "hidden",
            border: "2px solid rgba(239, 68, 68, 0.4)",
            backgroundColor: "rgba(15, 23, 42, 0.92)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(239, 68, 68, 0.15)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 20px",
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              borderBottom: "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#EF4444" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#EAB308" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#22C55E" }} />
              <span style={{ marginLeft: 12, fontSize: 13, color: "#F87171", fontFamily: "monospace", fontWeight: 700 }}>
                adobe.com/creativecloud/plans
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "rgba(239, 68, 68, 0.25)",
                padding: "3px 10px",
                borderRadius: 6,
                color: "#FCA5A5",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              <Lock size={13} />
              <span>MODÈLE CAPTIF</span>
            </div>
          </div>

          {/* Real Website Image */}
          <div style={{ position: "relative", height: 290, overflow: "hidden", backgroundColor: "#000" }}>
            <Img
              src={staticFile("assets/adobe_pricing_web.png")}
              style={{
                width: "100%",
                height: "auto",
                transform: `scale(${interpolate(frame, [0, 281], [1, 1.1])})`,
                filter: "brightness(0.92) contrast(1.05)",
              }}
            />
            {/* Price Overlay Badge */}
            <div
              style={{
                position: "absolute",
                bottom: 16,
                left: 16,
                right: 16,
                backgroundColor: "rgba(0, 0, 0, 0.85)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                borderRadius: 12,
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#F87171", fontWeight: 900, fontSize: 18 }}>
                <DollarSign size={20} />
                <span>779,88 € / an</span>
              </div>
              <span style={{ fontSize: 13, color: "#EF4444", fontWeight: 700 }}>Abonnement récurrent obligatoire</span>
            </div>
          </div>

          {/* Bullet points */}
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12, flex: 1, justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#FCA5A5", fontSize: 16, fontWeight: 600 }}>
              <span style={{ color: "#EF4444", fontWeight: 900 }}>✕</span>
              <span>Code source opaque & formats PSD propriétaires fermés</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#FCA5A5", fontSize: 16, fontWeight: 600 }}>
              <span style={{ color: "#EF4444", fontWeight: 900 }}>✕</span>
              <span>Télémétrie cloud permanente & DRM verrouillant les créations</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#FCA5A5", fontSize: 16, fontWeight: 600 }}>
              <span style={{ color: "#EF4444", fontWeight: 900 }}>✕</span>
              <span>Perte d'accès instantanée aux fichiers dès l'arrêt du paiement</span>
            </div>
          </div>
        </div>

        {/* Right: The Real Alternatives (Photopea, GIMP, Krita, Penpot) */}
        <div
          style={{
            flex: "0 0 58%",
            display: "flex",
            flexDirection: "column",
            borderRadius: 20,
            overflow: "hidden",
            border: "2px solid rgba(56, 189, 248, 0.4)",
            backgroundColor: "rgba(15, 23, 42, 0.92)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.7), 0 0 35px rgba(56, 189, 248, 0.2)",
          }}
        >
          {/* Multi-Tab Navigation Bar */}
          <div
            style={{
              padding: "10px 18px",
              backgroundColor: "rgba(15, 23, 42, 0.98)",
              borderBottom: "1px solid rgba(56, 189, 248, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Tabs */}
            <div style={{ display: "flex", gap: 10 }}>
              {tabs.map((tab, idx) => {
                const isActive = idx === currentTab;
                return (
                  <div
                    key={tab.name}
                    style={{
                      padding: "6px 16px",
                      borderRadius: 8,
                      backgroundColor: isActive ? "rgba(56, 189, 248, 0.25)" : "rgba(30, 41, 59, 0.6)",
                      border: `1px solid ${isActive ? "rgba(56, 189, 248, 0.6)" : "transparent"}`,
                      color: isActive ? "#FFFFFF" : "#64748B",
                      fontSize: 14,
                      fontWeight: isActive ? 800 : 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: isActive ? "#38BDF8" : "#475569",
                      }}
                    />
                    <span>{tab.name}</span>
                  </div>
                );
              })}
            </div>

            {/* Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "rgba(74, 222, 128, 0.2)",
                padding: "4px 12px",
                borderRadius: 6,
                color: "#4ADE80",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              <CheckCircle2 size={15} />
              <span>100% SOUVERAIN (0 €)</span>
            </div>
          </div>

          {/* Real Alternative Website Screenshot */}
          <div style={{ position: "relative", height: 350, overflow: "hidden", backgroundColor: "#080B11" }}>
            <Img
              src={staticFile(activeTab.img)}
              style={{
                width: "100%",
                height: "auto",
                transform: `scale(${interpolate(frame % 95, [0, 95], [1, 1.06])})`,
              }}
            />
            {/* Floating Info Overlay on Alternative Screenshot */}
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 16,
                backgroundColor: "rgba(10, 15, 29, 0.9)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${activeTab.accent}`,
                borderRadius: 10,
                padding: "8px 16px",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: 14,
                boxShadow: `0 0 20px ${activeTab.accent}44`,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Zap size={16} color={activeTab.accent} />
              <span>{activeTab.badge}</span>
            </div>
          </div>

          {/* Bottom Telemetry Bar & Features */}
          <div
            style={{
              padding: "16px 24px",
              backgroundColor: "rgba(15, 23, 42, 0.98)",
              borderTop: "1px solid rgba(56, 189, 248, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flex: 1,
            }}
          >
            {activeTab.features.map((feat, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#E2E8F0",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={18} color="#4ADE80" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* REA Reverse Engineering Ticker */}
          <div
            style={{
              backgroundColor: "rgba(56, 189, 248, 0.12)",
              padding: "8px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 13,
              fontFamily: "monospace",
              color: "#38BDF8",
              borderTop: "1px solid rgba(56, 189, 248, 0.25)",
            }}
          >
            <span>[REA PARITY LEDGER] 27 GLSL Shaders Reconstructed</span>
            <span>PARSER PSD : 100% COMPATIBLE</span>
            <span>MOTEUR : WEBASSEMBLY + RUST</span>
          </div>
        </div>
      </div>
    </div>
  );
};
