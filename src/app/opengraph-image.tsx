import { ImageResponse } from "next/og";

export const alt = "Simply Code — Web Development Agency";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#15130f",
          color: "#f7f4ee",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              background: "#f0a500",
              color: "#15130f",
              fontSize: "30px",
              fontWeight: 800,
            }}
          >
            {"</>"}
          </div>
          <div style={{ display: "flex", fontSize: "34px", fontWeight: 800, letterSpacing: "-1px" }}>
            SIMPLY <span style={{ color: "#f0a500", marginLeft: "10px" }}>CODE</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              fontSize: "72px",
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: "-3px",
              textTransform: "uppercase",
              maxWidth: "960px",
            }}
          >
            We build high-performance web solutions
          </div>
          <div style={{ display: "flex", fontSize: "26px", color: "rgba(247,244,238,0.55)" }}>
            UX design · Next.js platforms · Custom WordPress
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(247,244,238,0.15)",
            paddingTop: "24px",
            fontSize: "20px",
            color: "rgba(247,244,238,0.45)",
          }}
        >
          <span>simplycode.io</span>
          <span>Since 2016</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
