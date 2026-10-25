import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MessageSquare, ThumbsUp, Bell, Sparkles } from "lucide-react";

interface OutroSceneProps {
  badge: string;
  question: string;
  cta: string;
}

export const OutroScene: React.FC<OutroSceneProps> = ({
  badge,
  question,
  cta,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 100 },
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 36,
          maxWidth: 1250,
          width: "100%",
          padding: "0 40px",
        }}
      >
        {/* Top Header Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "rgba(244, 63, 94, 0.15)",
            border: "1px solid rgba(244, 63, 94, 0.4)",
            borderRadius: 9999,
            padding: "8px 24px",
            color: "#FB7185",
            fontSize: 18,
            fontWeight: 700,
            opacity: interpolate(frame, [0, 15], [0, 1]),
            transform: `scale(${scale})`,
          }}
        >
          <Sparkles size={20} color="#FB7185" />
          <span>{badge}</span>
        </div>

        {/* Main Question */}
        <h2
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 44,
            fontWeight: 900,
            textAlign: "center",
            lineHeight: 1.35,
            margin: 0,
            background: "linear-gradient(135deg, #FFFFFF 40%, #FB7185 80%, #F43F5E 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.8))",
            opacity: interpolate(frame, [5, 20], [0, 1]),
          }}
        >
          {question}
        </h2>

        {/* CTA Box */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(16px)",
            border: "2px solid rgba(255, 255, 255, 0.15)",
            borderRadius: 20,
            padding: "18px 36px",
            color: "#F8FAFC",
            fontSize: 24,
            fontWeight: 700,
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
            opacity: interpolate(frame, [15, 30], [0, 1]),
          }}
        >
          <MessageSquare size={28} color="#38BDF8" />
          <span>{cta}</span>
        </div>

        {/* YouTube Action Badges (Like & Subscribe) */}
        <div
          style={{
            display: "flex",
            gap: 24,
            opacity: interpolate(frame, [30, 45], [0, 1]),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              backgroundColor: "#DC2626",
              padding: "12px 28px",
              borderRadius: 12,
              color: "#FFFFFF",
              fontSize: 20,
              fontWeight: 800,
              boxShadow: "0 10px 25px rgba(220, 38, 38, 0.4)",
            }}
          >
            <Bell size={24} fill="#FFFFFF" />
            <span>S’ABONNER</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              padding: "12px 28px",
              borderRadius: 12,
              color: "#FFFFFF",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            <ThumbsUp size={24} />
            <span>LIKE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
