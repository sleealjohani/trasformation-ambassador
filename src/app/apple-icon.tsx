import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** أيقونة التطبيق: حرف «ج» على السطح الداكن المعتمد — بلا لون خارج اللوحة. */
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
          background: "#15508A",
          color: "#FFFFFF",
          fontSize: 110,
          fontWeight: 700,
        }}
      >
        ج
      </div>
    ),
    size,
  );
}
