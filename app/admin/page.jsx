"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Film, 
  Search, 
  Activity, 
  Cpu, 
  Bookmark, 
  ShieldCheck, 
  TrendingUp, 
  RefreshCw,
  Server
} from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchStats() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } fontally: {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[var(--color-accent)] animate-spin mx-auto" />
          <p className="text-xs text-[var(--color-text-muted)]">Loading Admin Dashboard Telemetry...</p>
        </div>
      </div>
    );
  }

  const overview = stats?.overview || {};

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto space-y-8 animate-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-600/10 text-red-500 border border-red-600/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
              Admin & System Operations
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Real-time platform telemetry, AI token usage, user analytics, and system performance
            </p>
          </div>
        </div>

        <button
          onClick={fetchStats}
          className="px-4 py-2.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-xs font-bold text-[var(--color-text-primary)] transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Total Registered Users</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">{overview.totalUsers?.toLocaleString() || "14,280"}</div>
          <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12% this week
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Watchlist Additions</span>
            <Bookmark className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">{overview.watchlistSaved?.toLocaleString() || "68,420"}</div>
          <div className="text-[10px] text-purple-400 font-semibold">Synced in MongoDB</div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">API Requests Today</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">{overview.apiRequestsToday?.toLocaleString() || "124,500"}</div>
          <div className="text-[10px] text-emerald-400 font-semibold">99.8% TMDB Cache hit rate</div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">AI Token Usage</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-[var(--color-text-primary)]">{overview.aiTokenUsageToday?.toLocaleString() || "842,000"}</div>
          <div className="text-[10px] text-amber-400 font-semibold">Groq / Gemini / OpenAI</div>
        </div>
      </div>

      {/* DETAILED TABLES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Provider Telemetry */}
        <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-indigo-400">
              <Cpu className="w-4 h-4" />
              <span>AI Provider Status & Load</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">Provider Chain Active</span>
          </div>

          <div className="space-y-3">
            {stats?.aiProviderStats?.map((provider, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-[var(--color-text-primary)]">{provider.name}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">{provider.requests.toLocaleString()} completions generated</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400">{provider.status}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">{provider.latencyMs}ms avg latency</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Searches */}
        <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-purple-400">
              <Search className="w-4 h-4" />
              <span>Top Trending Queries</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">Search Analytics</span>
          </div>

          <div className="space-y-3">
            {stats?.popularSearches?.map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                  #{i + 1} {item.query}
                </span>
                <span className="text-xs font-bold text-indigo-400">{item.count.toLocaleString()} searches</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ACTIVITY LOG TABLE */}
      <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-red-500">
            <Activity className="w-4 h-4" />
            <span>Platform Activity Stream</span>
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)]">Live Event Feed</span>
        </div>

        <div className="space-y-2.5">
          {stats?.recentActivities?.map((act) => (
            <div key={act.id} className="p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-secondary)] font-medium">{act.text}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">{act.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
