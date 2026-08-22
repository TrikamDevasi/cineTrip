"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        textAlign: "center"
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "16px" }}>Oops! Something went wrong.</h1>
      <p style={{ opacity: 0.6, marginBottom: "32px", maxWidth: "500px" }}>
        We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
      </p>
      <div style={{ display: "flex", gap: "16px" }}>
        <button
          onClick={() => reset()}
          style={{
            background: "var(--accent)",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            fontWeight: 600,
            border: "none",
            cursor: "pointer"
          }}
        >
          Try Again
        </button>
        <a
          href="/"
          style={{
            background: "rgba(255,255,255,0.1)",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            fontWeight: 600,
            textDecoration: "none"
          }}
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
