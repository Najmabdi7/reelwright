import React from "react";
import {
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Background";
import { SubtitleTrack } from "../components/SubtitleTrack";
import { SceneData, VideoData } from "../types";
import { useFonts } from "../useFonts";

const PAD = 72;
const CARD_W = 936;
const ACCENT = "#38BDF8";
const VIOLET = "#A855F7";
const LIME = "#4ADE80";
const YELLOW = "#FACC15";

const nf = (n: number) => n.toLocaleString("fr-FR");

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ------------------------------------------------------------------ primitives */

const Badge: React.FC<{ text?: string; color?: string; delay?: number }> = ({
  text,
  color = ACCENT,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!text) return null;
  const s = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 130 } });
  return (
    <div
      style={{
        alignSelf: "flex-start",
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 26px",
        borderRadius: 999,
        border: `2px solid ${color}66`,
        backgroundColor: `${color}1A`,
        transform: `scale(${s})`,
        opacity: interpolate(frame - delay, [0, 10], [0, 1], clamp),
      }}
    >
      <div style={{ width: 12, height: 12, borderRadius: 99, backgroundColor: color }} />
      <span
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: 27,
          fontWeight: 800,
          letterSpacing: 2.4,
          color,
        }}
      >
        {text.toUpperCase()}
      </span>
    </div>
  );
};

const Counter: React.FC<{ value: number; label: string; color: string; size?: number; delay?: number }> = ({
  value,
  label,
  color,
  size = 104,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 46], [0, 1], clamp);
  const eased = 1 - Math.pow(1 - p, 3);
  const shown = Math.round(value * eased);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: size,
          fontWeight: 900,
          letterSpacing: -4,
          lineHeight: 1,
          color,
          fontVariantNumeric: "tabular-nums",
          textShadow: `0 0 40px ${color}44`,
        }}
      >
        {nf(shown)}
      </span>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 28,
          fontWeight: 600,
          color: "#94A3B8",
          letterSpacing: -0.4,
        }}
      >
        {label}
      </span>
    </div>
  );
};

const Chip: React.FC<{ text: string; color?: string; delay?: number }> = ({
  text,
  color = "#E2E8F0",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 120 } });
  return (
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: 26,
        fontWeight: 700,
        color,
        padding: "12px 22px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.14)",
        backgroundColor: "rgba(15,23,42,0.72)",
        transform: `translateY(${(1 - s) * 18}px)`,
        opacity: s,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
};

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: `0 ${PAD}px`,
      gap: 34,
    }}
  >
    {children}
  </div>
);

/* ---------------------------------------------------------------------- scènes */

const HookScene: React.FC<SceneData> = ({ badge, title, sub, chips }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = (title ?? "").split("\n");

  return (
    <Frame>
      <Badge text={badge} color={YELLOW} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
        {lines.map((line, i) => {
          const s = spring({ frame: frame - 6 - i * 7, fps, config: { damping: 15, stiffness: 90 } });
          return (
            <div
              key={line}
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 96,
                fontWeight: 900,
                lineHeight: 1.02,
                letterSpacing: -3.4,
                color: i === lines.length - 1 ? ACCENT : "#FFFFFF",
                textShadow: "0 18px 44px rgba(0,0,0,0.9)",
                transform: `translateY(${(1 - s) * 56}px)`,
                opacity: interpolate(frame - 6 - i * 7, [0, 12], [0, 1], clamp),
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 38,
          fontWeight: 600,
          color: "#94A3B8",
          opacity: interpolate(frame, [26, 40], [0, 1], clamp),
          transform: `translateY(${interpolate(frame, [26, 40], [24, 0], clamp)}px)`,
        }}
      >
        {sub}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
        {(chips ?? []).map((c, i) => (
          <Chip key={c} text={c} delay={40 + i * 5} />
        ))}
      </div>
    </Frame>
  );
};

const StatsScene: React.FC<SceneData> = ({ badge, title, subtitle, counters, facts, imageSrc }) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 620], [1, 1.07], clamp);

  return (
    <Frame>
      <Badge text={badge} color={LIME} />
      {imageSrc ? (
        <div
          style={{
            width: CARD_W,
            height: 620,
            borderRadius: 22,
            overflow: "hidden",
            border: "2px solid rgba(255,255,255,0.14)",
            boxShadow: "0 30px 70px rgba(0,0,0,0.8), 0 0 40px rgba(56,189,248,0.12)",
            backgroundColor: "#0F172A",
            position: "relative",
          }}
        >
          <Img
            src={staticFile(imageSrc)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
              transform: `scale(${zoom})`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(8,11,17,0) 55%, rgba(8,11,17,0.95) 100%)",
            }}
          />
        </div>
      ) : null}

      <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 6 }}>
        <span
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 82,
            fontWeight: 900,
            letterSpacing: -3,
            color: "#FFFFFF",
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 26,
            fontWeight: 600,
            color: "#94A3B8",
          }}
        >
          {subtitle}
        </span>
      </div>

      <div style={{ display: "flex", gap: 64 }}>
        {(counters ?? []).map((c, i) => (
          <Counter
            key={c.label}
            value={c.value}
            label={c.label}
            color={c.accent ?? ACCENT}
            size={Math.max(74, 104 - i * 22)}
            delay={18 + i * 10}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {(facts ?? []).map((f, i) => (
          <Chip key={f} text={f} delay={46 + i * 6} />
        ))}
      </div>
    </Frame>
  );
};

const HowScene: React.FC<SceneData> = ({ badge, title, sub, tools, targets }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lineGrow = interpolate(frame, [10, 34], [0, 1], clamp);
  const mcpIn = spring({ frame: frame - 18, fps, config: { damping: 13, stiffness: 110 } });
  const toolsIn = spring({ frame: frame - 40, fps, config: { damping: 15, stiffness: 100 } });
  const targetsIn = spring({ frame: frame - 80, fps, config: { damping: 16, stiffness: 110 } });

  return (
    <Frame>
      <Badge text={badge} color={VIOLET} />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 76,
            fontWeight: 900,
            letterSpacing: -2.6,
            color: "#FFFFFF",
          }}
        >
          {title}
        </span>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 28, color: "#94A3B8", fontWeight: 600 }}>
          {sub}
        </span>
      </div>

      {/* agent */}
      <div
        style={{
          alignSelf: "center",
          width: 520,
          padding: "26px 30px",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.14)",
          backgroundColor: "rgba(15,23,42,0.85)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 30, fontWeight: 800, color: "#E2E8F0" }}>
          TON AGENT
        </span>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 20, color: "#64748B" }}>
          Claude Code · Codex · Cursor
        </span>
      </div>

      {/* connecteur */}
      <div style={{ alignSelf: "center", width: 3, height: 54, backgroundColor: "rgba(255,255,255,0.12)", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: `${lineGrow * 100}%`,
            background: `linear-gradient(to bottom, ${ACCENT}, ${VIOLET})`,
          }}
        />
      </div>

      {/* MCP */}
      <div
        style={{
          alignSelf: "center",
          transform: `scale(${mcpIn})`,
          opacity: mcpIn,
          padding: "24px 42px",
          borderRadius: 18,
          border: `2px solid ${ACCENT}`,
          backgroundColor: "rgba(56,189,248,0.12)",
          boxShadow: `0 0 48px ${ACCENT}55`,
        }}
      >
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 40,
            fontWeight: 700,
            color: ACCENT,
            letterSpacing: 2,
          }}
        >
          MCP SERVER
        </span>
      </div>

      {/* outils */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          transform: `translateY(${(1 - toolsIn) * 24}px)`,
          opacity: toolsIn,
        }}
      >
        {(tools ?? []).map((t) => (
          <div
            key={t}
            style={{
              padding: "22px 26px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "rgba(15,23,42,0.8)",
              fontFamily: "Inter, sans-serif",
              fontSize: 32,
              fontWeight: 700,
              color: "#E2E8F0",
              textAlign: "center",
            }}
          >
            {t}
          </div>
        ))}
      </div>

      {/* cibles */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "center",
          transform: `translateY(${(1 - targetsIn) * 20}px)`,
          opacity: targetsIn,
        }}
      >
        {(targets ?? []).map((t) => (
          <span
            key={t}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 24,
              fontWeight: 700,
              color: "#CBD5E1",
              padding: "10px 18px",
              borderRadius: 10,
              backgroundColor: "rgba(168,85,247,0.14)",
              border: "1px solid rgba(168,85,247,0.4)",
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </Frame>
  );
};

const ProofScene: React.FC<SceneData> = ({ badge, counters, imageSrc, footnote }) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 560], [1.02, 1.12], clamp);

  return (
    <Frame>
      <Badge text={badge} color={YELLOW} />
      {imageSrc ? (
        <div
          style={{
            width: CARD_W,
            height: 540,
            borderRadius: 20,
            overflow: "hidden",
            border: "2px solid rgba(255,255,255,0.12)",
            boxShadow: "0 28px 64px rgba(0,0,0,0.8)",
            backgroundColor: "#0B1220",
          }}
        >
          <Img
            src={staticFile(imageSrc)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              transform: `scale(${zoom})`,
            }}
          />
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 8 }}>
        {(counters ?? []).map((c, i) => (
          <Counter
            key={c.label}
            value={c.value}
            label={c.label}
            color={c.accent ?? LIME}
            size={112}
            delay={24 + i * 34}
          />
        ))}
      </div>

      {footnote ? (
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 21,
            color: "#64748B",
            opacity: interpolate(frame, [60, 80], [0, 1], clamp),
          }}
        >
          {footnote}
        </span>
      ) : null}
    </Frame>
  );
};

const FlowScene: React.FC<SceneData> = ({ badge, title, steps }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const list = steps ?? [];
  const active = Math.min(list.length - 1, Math.floor(frame / (fps * 0.95)));

  return (
    <Frame>
      <Badge text={badge} color={VIOLET} />
      <span
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: 68,
          fontWeight: 900,
          letterSpacing: -2.2,
          color: "#FFFFFF",
          lineHeight: 1.05,
        }}
      >
        {title}
      </span>

      <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 14 }}>
        {list.map((step, i) => {
          const s = spring({ frame: frame - 12 - i * 8, fps, config: { damping: 15, stiffness: 115 } });
          const isActive = i === active;
          const isDone = i < active;
          return (
            <React.Fragment key={step}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "24px 28px",
                  borderRadius: 18,
                  border: `2px solid ${isActive ? ACCENT : "rgba(255,255,255,0.1)"}`,
                  backgroundColor: isActive ? "rgba(56,189,248,0.12)" : "rgba(15,23,42,0.78)",
                  boxShadow: isActive ? `0 0 42px ${ACCENT}44` : "none",
                  transform: `translateX(${(1 - s) * 40}px) scale(${isActive ? 1.02 : 1})`,
                  opacity: s,
                }}
              >
                <span
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 99,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isDone ? LIME : isActive ? ACCENT : "rgba(255,255,255,0.08)",
                    color: isDone || isActive ? "#06121F" : "#94A3B8",
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 24,
                    fontWeight: 800,
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 34,
                    fontWeight: 600,
                    color: isActive ? "#FFFFFF" : isDone ? "#CBD5E1" : "#94A3B8",
                  }}
                >
                  {step}
                </span>
              </div>
              {i < list.length - 1 ? (
                <div
                  style={{
                    marginLeft: 50,
                    width: 2,
                    height: 40,
                    backgroundColor: i < active ? LIME : "rgba(255,255,255,0.12)",
                  }}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </Frame>
  );
};

const OutroScene: React.FC<SceneData> = ({ badge, question, cta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14, stiffness: 90 } });
  const pulse = 1 + Math.sin(frame / 9) * 0.014;
  const lines = (question ?? "").split("\n");

  return (
    <Frame>
      <Badge text={badge} color={YELLOW} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        {lines.map((l, i) => (
          <span
            key={l}
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: 84,
              fontWeight: 900,
              lineHeight: 1.06,
              letterSpacing: -2.8,
              color: i === 0 ? "#FFFFFF" : ACCENT,
              transform: `translateY(${(1 - s) * 40}px)`,
              opacity: interpolate(frame - i * 8, [0, 14], [0, 1], clamp),
            }}
          >
            {l}
          </span>
        ))}
      </div>

      <div
        style={{
          alignSelf: "flex-start",
          marginTop: 18,
          padding: "24px 40px",
          borderRadius: 999,
          border: `2px solid ${YELLOW}`,
          backgroundColor: "rgba(250,204,21,0.12)",
          boxShadow: `0 0 46px ${YELLOW}44`,
          transform: `scale(${pulse * s})`,
        }}
      >
        <span
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 34,
            fontWeight: 800,
            color: YELLOW,
            letterSpacing: 0.4,
          }}
        >
          {cta}
        </span>
      </div>

      <span
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 26,
          color: "#7C8AA0",
          marginTop: 10,
        }}
      >
        @RadarIA-t2m
      </span>
    </Frame>
  );
};

/* ----------------------------------------------------------------------- master */

const REGISTRY: Record<string, React.FC<SceneData>> = {
  hook: HookScene,
  stats: StatsScene,
  how: HowScene,
  proof: ProofScene,
  flow: FlowScene,
  outro: OutroScene,
};

export const ShortEssay: React.FC<{ data: VideoData }> = ({ data }) => {
  useFonts(["Montserrat", "Inter", "JetBrains Mono"]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", backgroundColor: "#080B11", overflow: "hidden" }}>
      <Background />
      <Audio src={staticFile(data.audioSrc)} volume={1} />

      {data.scenes.map((scene) => {
        const Component = REGISTRY[scene.type];
        if (!Component) {
          throw new Error(`type de scène inconnu pour le format short : ${scene.type}`);
        }
        return (
          <Sequence key={scene.id} from={scene.startFrame} durationInFrames={scene.durationInFrames}>
            <Component {...scene} />
          </Sequence>
        );
      })}

      <SubtitleTrack lines={data.lines} fontSize={46} bottom={268} maxWidth={900} />
    </div>
  );
};
