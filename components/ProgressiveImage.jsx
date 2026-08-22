"use client";

import { useState } from "react";

export default function ProgressiveImage({ src, alt, lowSrc }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <img
        src={lowSrc}
        alt={alt}
        style={{
          filter: "blur(10px)",
          opacity: loaded ? 0 : 1,
          transition: "opacity 0.5s ease",
          position: loaded ? "absolute" : "relative",
        }}
      />

      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      />
    </div>
  );
}
