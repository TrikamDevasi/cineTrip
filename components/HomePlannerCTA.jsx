"use client";

import Link from "next/link";
import { CalendarDays, Users, Ticket, Sparkles, ArrowRight, Film } from "lucide-react";

export default function HomePlannerCTA() {
  return (
    <div className="home-planner-banner">
      <div className="banner-glow-backdrop" />
      <div className="banner-content">
        <div className="banner-badge">
          <CalendarDays size={15} />
          <span>NEW FEATURE</span>
        </div>
        <h2 className="banner-title">
          Ready for a <span className="text-gradient">CineTrip</span> with Friends?
        </h2>
        <p className="banner-desc">
          Schedule cinema showtimes, pick IMAX/Dolby auditoriums, add squad members, and generate digital boarding passes to share instantly.
        </p>

        <div className="banner-features-row">
          <div className="feature-item">
            <Ticket size={16} className="feature-icon" />
            <span>Smart Showtime Slots</span>
          </div>
          <div className="feature-item">
            <Users size={16} className="feature-icon" />
            <span>Squad RSVP & Invites</span>
          </div>
          <div className="feature-item">
            <Sparkles size={16} className="feature-icon" />
            <span>Digital Boarding Passes</span>
          </div>
        </div>

        <div className="banner-action-row">
          <Link href="/planner" className="btn-primary banner-cta-btn">
            <CalendarDays size={18} />
            <span>Launch Trip Planner</span>
            <ArrowRight size={16} />
          </Link>
          <Link href="/discover" className="btn-secondary banner-secondary-btn">
            <Film size={18} />
            <span>Explore Movies</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
