import { ImageResponse } from "next/og";
import {
  PROFESSIONAL_HEADLINE,
  SITE_INTRODUCTION,
  SITE_NAME,
} from "@/modules/public/editorial-taxonomy";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#f7f8f4",
          color: "#172019",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Arial, Helvetica, sans-serif",
          height: "100%",
          justifyContent: "space-between",
          padding: "68px 76px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
          <div
            style={{
              color: "#286140",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 0,
              textTransform: "uppercase",
            }}
          >
            {PROFESSIONAL_HEADLINE}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: 0,
              lineHeight: 1.02,
              maxWidth: 980,
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              color: "#455348",
              display: "flex",
              fontSize: 34,
              lineHeight: 1.24,
              maxWidth: 980,
            }}
          >
            {SITE_INTRODUCTION}
          </div>
        </div>
        <div
          style={{
            borderTop: "3px solid #286140",
            color: "#455348",
            display: "flex",
            fontSize: 26,
            justifyContent: "space-between",
            paddingTop: 28,
            width: "100%",
          }}
        >
          <span>Enterprise AI Platforms</span>
          <span>Cloud Architecture</span>
          <span>Engineering Leadership</span>
        </div>
      </div>
    ),
    size
  );
}
