import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FlyMole — Compare Flights. No Tricks.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 60%, #38bdf8 100%)",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        <div style={{ fontSize: 110, marginBottom: 24 }}>✈️</div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: "white",
            letterSpacing: "-2px",
            marginBottom: 16,
          }}
        >
          FlyMole
        </div>
        <div
          style={{
            fontSize: 30,
            color: "rgba(255,255,255,0.88)",
            textAlign: "center",
            maxWidth: 680,
          }}
        >
          Compare flights from top airlines. No tricks.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 48,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(255,255,255,0.18)",
            borderRadius: 99,
            padding: "10px 28px",
            color: "rgba(255,255,255,0.92)",
            fontSize: 20,
          }}
        >
          By BurrowSoft · flymole.com
        </div>
      </div>
    ),
    size
  );
}
