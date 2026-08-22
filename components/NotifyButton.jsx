"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";

export default function NotifyButton({ movieId }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("notify_movies") || "[]"
    );
    setEnabled(stored.includes(movieId));
  }, [movieId]);

  function toggleNotify() {
    const stored = JSON.parse(
      localStorage.getItem("notify_movies") || "[]"
    );

    let updated;

    if (stored.includes(movieId)) {
      updated = stored.filter((id) => id !== movieId);
      setEnabled(false);
    } else {
      updated = [...stored, movieId];
      setEnabled(true);
    }

    localStorage.setItem("notify_movies", JSON.stringify(updated));
  }

  return (
    <button
      onClick={toggleNotify}
      className={enabled ? "notify-btn enabled" : "notify-btn"}
    >
      {enabled ? <BellOff size={16} /> : <Bell size={16} />}
      <span>{enabled ? "Cancel Reminder" : "Remind Me on Release"}</span>

      <style jsx>{`
        .notify-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          background: var(--color-surface-2);
          color: var(--color-text-secondary);
          transition: var(--transition);
          margin-top: 24px;
        }
        .notify-btn:hover {
          background: var(--color-surface);
          border-color: var(--color-text-muted);
          color: white;
        }
        .notify-btn.enabled {
          background: rgba(22, 163, 74, 0.1);
          border-color: rgba(22, 163, 74, 0.3);
          color: #16a34a;
        }
        .notify-btn.enabled:hover {
          background: rgba(22, 163, 74, 0.2);
          border-color: #16a34a;
        }
      `}</style>
    </button>
  );
}
