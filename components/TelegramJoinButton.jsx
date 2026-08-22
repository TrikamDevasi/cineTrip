"use client";

import React from "react";

export default function TelegramJoinButton() {
  return (
    <>
      <a
        href="https://t.me/movies_request_group3"
        target="_blank"
        rel="noopener noreferrer"
        className="telegram-float-btn"
        aria-label="Request Movie / Series"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.036 9.589c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.899.632z"/>
        </svg>
        <span className="btn-text">Request Movie / Series</span>
      </a>

      <style jsx>{`
        .telegram-float-btn {
          position: fixed;
          bottom: 24px;
          left: 24px;
          background: #2CA5E0;
          color: white;
          border-radius: 50px;
          padding: 8px 16px;
          font-weight: 600;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(44, 165, 224, 0.35);
          z-index: 999;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          text-decoration: none;
        }

        .telegram-float-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(44, 165, 224, 0.5);
          color: white;
        }

        @media (max-width: 640px) {
          .btn-text {
            display: none;
          }
          .telegram-float-btn {
            padding: 10px;
            border-radius: 50%;
          }
        }
      `}</style>
    </>
  );
}
