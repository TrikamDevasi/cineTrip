"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, ThumbsUp, Send, CheckCircle2, UserCheck } from "lucide-react";

export default function ReviewsSection({ mediaId, mediaType = "movie" }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(9);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true);
        const res = await fetch(`/api/reviews?mediaId=${mediaId}&mediaType=${mediaType}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (mediaId) fetchReviews();
  }, [mediaId, mediaType]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId,
          mediaType,
          userName: userName.trim() || "Cinephile Critic",
          rating,
          content: content.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.review) {
        setReviews([data.review, ...reviews]);
        setContent("");
        setSubmittedMessage(true);
        setTimeout(() => setSubmittedMessage(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 md:p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-500">
            <Star className="w-5 h-5 fill-yellow-500" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--color-text-primary)]">
              Audience Reviews & Community Ratings
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Real reviews and ratings from film enthusiasts
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
          {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
        </span>
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Write a Review
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Your name or alias (optional)..."
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
          />
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <span className="text-xs text-[var(--color-text-muted)] font-medium">Your Score:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-0.5 transition-transform ${star <= rating ? "text-yellow-400 scale-110" : "text-[var(--color-text-muted)]"}`}
                >
                  <Star className={`w-3.5 h-3.5 ${star <= rating ? "fill-yellow-400" : ""}`} />
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs font-bold text-[var(--color-gold)]">{rating}/10</span>
          </div>
        </div>

        <textarea
          rows={3}
          placeholder="Share your thoughts on the cinematography, plot, characters, or direction..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] resize-none"
        />

        <div className="flex items-center justify-between pt-1">
          {submittedMessage ? (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Review submitted successfully!
            </span>
          ) : (
            <span className="text-[11px] text-[var(--color-text-muted)]">Be respectful & refrain from unannounced spoilers.</span>
          )}

          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="px-5 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? "Posting..." : "Post Review"}</span>
          </button>
        </div>
      </form>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-xs text-[var(--color-text-muted)] animate-pulse">
            Loading audience reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-xs text-[var(--color-text-muted)]">
            No community reviews yet. Be the first to share your rating!
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev._id || rev.createdAt}
              className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
                    {rev.userName?.[0]?.toUpperCase() || "C"}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[var(--color-text-primary)]">
                      {rev.userName}
                    </h5>
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  <span>{rev.rating}/10</span>
                </div>
              </div>

              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed pl-1">
                {rev.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
