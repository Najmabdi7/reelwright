import React from "react";

interface MacWindowProps {
  title?: string;
  url?: string;
  width?: number | string;
  height?: number | string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const MacWindow: React.FC<MacWindowProps> = ({
  title,
  url,
  width = 1200,
  height = 700,
  children,
  style,
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 16,
        backgroundColor: "rgba(15, 23, 42, 0.88)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow:
          "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(14, 165, 233, 0.15)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: 48,
          backgroundColor: "rgba(30, 41, 59, 0.7)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          position: "relative",
        }}
      >
        {/* macOS traffic light dots */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#FF5F56",
              boxShadow: "0 0 6px rgba(255, 95, 86, 0.5)",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#FFBD2E",
              boxShadow: "0 0 6px rgba(255, 189, 46, 0.5)",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#27C93F",
              boxShadow: "0 0 6px rgba(39, 201, 63, 0.5)",
            }}
          />
        </div>

        {/* Center title or URL bar */}
        {url ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 8,
              padding: "4px 24px",
              color: "#94A3B8",
              fontSize: 14,
              fontFamily: "monospace",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ color: "#38BDF8" }}>🔒</span>
            <span>https://{url}</span>
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              color: "#E2E8F0",
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {title}
          </div>
        )}
      </div>

      {/* Body content */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
};
