import { ImageResponse } from "next/og";

/**
 * Favicon, drawn per environment so prod / pre-prod / local are tellable apart
 * in browser tabs and on vercel.com. The mark is the app's ornament motif —
 * a rotated square — on a solid ground whose colour is the environment:
 *   production → amber (the birthday accent)
 *   preview (pre-prod) → dusk blue (the yahrzeit accent)
 *   development → neutral grey
 */

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

type Env = "production" | "preview" | "development";

function currentEnv(): Env {
  const v = process.env.VERCEL_ENV;
  if (v === "production" || v === "preview" || v === "development") return v;
  return "development";
}

const GROUND: Record<Env, string> = {
  production: "#B4602A",
  preview: "#3D6E7A",
  development: "#5B5B5B",
};

export default function Icon() {
  const ground = GROUND[currentEnv()];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: ground,
        }}
      >
        <div
          style={{
            width: 15,
            height: 15,
            background: "#F6F0E4",
            transform: "rotate(45deg)",
          }}
        />
      </div>
    ),
    size,
  );
}
