import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

function IconGraphic({ compact = false }: { compact?: boolean }) {
  const barWidth = compact ? 18 : 52;
  const gap = compact ? 8 : 22;
  const heights = compact ? [42, 68, 54] : [120, 196, 156];
  const baseBottom = compact ? 34 : 96;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1c1917",
        borderRadius: compact ? 40 : 112,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap,
        }}
      >
        {heights.map((height) => (
          <div
            key={height}
            style={{
              width: barWidth,
              height,
              marginBottom: baseBottom,
              borderRadius: compact ? 8 : 18,
              background: "#fafaf9",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Icon() {
  return new ImageResponse(<IconGraphic />, {
    ...size,
  });
}
