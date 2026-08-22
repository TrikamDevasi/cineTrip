"use client";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function MovieError({ error, reset }) {
  console.error("[MovieError boundary]", error?.message);

  return (
    <div className="error-page">
      <AlertCircle size={48} className="error-icon" />
      <h2>Something went wrong</h2>
      <p>{error?.message ?? "Could not load movie details."}</p>
      <div className="error-actions">
        <button onClick={() => reset()} className="btn-ghost">Try Again</button>
        <Link href="/" className="btn-primary">Back to Home</Link>
      </div>
    </div>
  );
}
