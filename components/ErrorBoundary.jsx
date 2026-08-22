"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Reusable React class error boundary.
 * Wraps individual page sections so one failed fetch doesn't blank the whole page.
 *
 * Usage:
 *   <ErrorBoundary label="Hero Banner">
 *     <HeroBanner ... />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error(`[ErrorBoundary: ${this.props.label || "section"}]`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "2rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            textAlign: "center",
            margin: "1rem 0",
            minHeight: "120px",
          }}
        >
          <AlertTriangle
            size={28}
            style={{ color: "var(--color-text-muted)", opacity: 0.6 }}
          />
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-muted)",
              margin: 0,
            }}
          >
            {this.props.label
              ? `Couldn't load ${this.props.label}.`
              : "Something went wrong loading this section."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              fontSize: "0.75rem",
              fontWeight: 600,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-2)",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              minHeight: "auto",
              minWidth: "auto",
            }}
          >
            <RefreshCw size={12} />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
