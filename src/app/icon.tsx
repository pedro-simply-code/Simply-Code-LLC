import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Brand mark: yellow square + rotated `</>` (default orange palette bright). */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0a500",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#15130f",
            fontSize: 13,
            fontWeight: 800,
            fontFamily: "ui-monospace, monospace",
            letterSpacing: "-0.08em",
            transform: "rotate(-45deg)",
          }}
        >
          {"</>"}
        </div>
      </div>
    ),
    { ...size },
  );
}
