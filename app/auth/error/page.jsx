"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

const ERROR_MESSAGES = {
  Configuration: "There is a problem with the server configuration. Please contact support.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The sign in link is no longer valid. It may have been used already or expired.",
  Default: "An authentication error occurred. Please try again.",
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = ERROR_MESSAGES[error] || ERROR_MESSAGES.Default;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "var(--color-bg)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "400px",
          padding: "2.5rem",
          background: "var(--color-surface)",
          border: "1px solid rgba(229,9,20,0.2)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <AlertTriangle size={40} color="#f87171" style={{ marginBottom: "1rem" }} />
        <h1
          style={{
            fontSize: "1.3rem",
            fontWeight: 800,
            color: "var(--color-text-primary)",
            marginBottom: "0.75rem",
          }}
        >
          Authentication Error
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          {message}
        </p>
        <Link
          href="/auth/signin"
          style={{
            display: "inline-block",
            padding: "10px 24px",
            background: "var(--color-accent)",
            color: "white",
            fontWeight: 700,
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
