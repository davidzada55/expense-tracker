import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

function IconGraphic() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1c1917",
        borderRadius: 40,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
        }}
      >
        {[42, 68, 54].map((height) => (
          <div
            key={height}
            style={{
              width: 18,
              height,
              marginBottom: 34,
              borderRadius: 8,
              background: "#fafaf9",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function AppleIcon() {
  return new ImageResponse(<IconGraphic />, {
    ...size,
  });
}
