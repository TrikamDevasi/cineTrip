"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp } from "lucide-react";

export default function FinancialChart({ budget = 0, revenue = 0 }) {
  // Animate bars from 0 → target width on mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Tick after first paint so CSS transition actually fires
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const formattedBudget = budget > 0 ? `$${(budget / 1e6).toFixed(1)}M` : "N/A";
  const formattedRevenue = revenue > 0 ? `$${(revenue / 1e6).toFixed(1)}M` : "N/A";

  const profit = revenue > 0 && budget > 0 ? revenue - budget : null;
  const roi = budget > 0 && revenue > 0 ? (((revenue - budget) / budget) * 100).toFixed(0) : null;
  const isProfitable = profit !== null && profit >= 0;

  // Max scale for visual comparison
  const maxVal = Math.max(budget, revenue, 1);
  const budgetWidth = Math.min(100, Math.max(8, (budget / maxVal) * 100));
  const revenueWidth = Math.min(100, Math.max(8, (revenue / maxVal) * 100));

  return (
    <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-500">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--color-text-primary)]">
              Box Office &amp; Financial Performance
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Production budget vs global theatrical revenue
            </p>
          </div>
        </div>

        {roi && (
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              isProfitable
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>ROI: {isProfitable ? `+${roi}%` : `${roi}%`}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Budget Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-[var(--color-text-secondary)]">
            <span>Budget</span>
            <span className="font-bold text-[var(--color-text-primary)]">{formattedBudget}</span>
          </div>
          <div className="h-3.5 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden p-0.5 border border-[var(--color-border)]">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              style={{
                width: mounted ? `${budgetWidth}%` : "0%",
                transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>
        </div>

        {/* Revenue Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-[var(--color-text-secondary)]">
            <span>Worldwide Revenue</span>
            <span className="font-bold text-[var(--color-text-primary)]">{formattedRevenue}</span>
          </div>
          <div className="h-3.5 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden p-0.5 border border-[var(--color-border)]">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              style={{
                width: mounted ? `${revenueWidth}%` : "0%",
                transition: "width 1.1s cubic-bezier(0.4, 0, 0.2, 1) 0.1s",
              }}
            />
          </div>
        </div>
      </div>

      {profit !== null && (
        <div className="p-3.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-between text-xs">
          <span className="text-[var(--color-text-muted)] font-medium">Net Profit Margin</span>
          <span className={`font-bold ${isProfitable ? "text-emerald-400" : "text-red-400"}`}>
            {isProfitable
              ? `+$${(profit / 1e6).toFixed(1)}M`
              : `-$${(Math.abs(profit) / 1e6).toFixed(1)}M`}
          </span>
        </div>
      )}
    </div>
  );
}
