import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ImageResponse } from "next/og";
import React from "react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, "../public/icons");

type IconSpec = {
  filename: string;
  size: number;
  borderRadius: number;
  compact: boolean;
};

const icons: IconSpec[] = [
  { filename: "icon-192.png", size: 192, borderRadius: 42, compact: true },
  { filename: "icon-512.png", size: 512, borderRadius: 112, compact: false },
  {
    filename: "icon-maskable-512.png",
    size: 512,
    borderRadius: 0,
    compact: false,
  },
];

function IconGraphic({
  borderRadius,
  compact,
}: {
  borderRadius: number;
  compact: boolean;
}) {
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
        borderRadius,
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

async function generateIcon({
  filename,
  size,
  borderRadius,
  compact,
}: IconSpec): Promise<void> {
  const response = new ImageResponse(
    <IconGraphic borderRadius={borderRadius} compact={compact} />,
    {
      width: size,
      height: size,
    },
  );

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(path.join(iconsDir, filename), buffer);
}

async function main(): Promise<void> {
  await mkdir(iconsDir, { recursive: true });

  for (const icon of icons) {
    await generateIcon(icon);
  }

  console.log("Generated PWA icons in public/icons/");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
