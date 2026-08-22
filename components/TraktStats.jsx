"use client";
import { Eye, Users, Star, BookmarkPlus } from "lucide-react";

export default function TraktStats({ ratings, stats }) {
  if (!ratings && !stats) return null;

  const dist = ratings?.distribution ?? {};
  const maxVotes = Math.max(...Object.values(dist), 1);

  const statItems = [
    { icon: <Eye size={16} />,          label: "Watched",    value: stats?.watchers?.toLocaleString()     ?? "—" },
    { icon: <Users size={16} />,         label: "Collected",  value: stats?.collectors?.toLocaleString()   ?? "—" },
    { icon: <BookmarkPlus size={16} />,  label: "Watchlisted",value: stats?.lists?.toLocaleString()        ?? "—" },
    { icon: <Star size={16} />,          label: "Trakt Score",value: ratings?.rating ? `${ratings.rating.toFixed(1)} / 10` : "—" },
  ];

  return (
    <div className="trakt-stats-block">
      <h3 className="trakt-stats-title">Trakt Community Stats</h3>

      {/* 4 stat pills */}
      <div className="trakt-stat-grid">
        {statItems.map(({ icon, label, value }) => (
          <div key={label} className="trakt-stat-card">
            <span className="stat-icon">{icon}</span>
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Rating distribution bar chart */}
      {Object.keys(dist).length > 0 && (
        <div className="rating-dist">
          <p className="dist-label">Rating Distribution ({ratings.votes.toLocaleString()} votes)</p>
          <div className="dist-bars">
            {[1,2,3,4,5,6,7,8,9,10].map((n) => (
              <div key={n} className="dist-bar-col">
                <div
                  className="dist-bar-fill"
                  style={{ height: `${((dist[n] ?? 0) / maxVotes) * 60}px` }}
                />
                <span className="dist-bar-label">{n}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
