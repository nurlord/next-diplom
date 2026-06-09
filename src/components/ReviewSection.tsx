"use client";

import { useState } from "react";
import { Star, MessageSquare, Send } from "lucide-react";
import { usePublicReviews, useSubmitReview, useMySubscriptions } from "@/api/hooks";
import { useAuthContext } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { Avatar } from "@/components/ui/Avatar";

interface ReviewSectionProps {
  chatId: number;
}

export default function ReviewSection({ chatId }: ReviewSectionProps) {
  const { isAuthenticated } = useAuthContext();
  const { data: reviewsRes, isLoading, refetch } = usePublicReviews(chatId, { limit: 10 });
  const { mutateAsync: submitReview, isPending: isSubmitting } = useSubmitReview();
  const { data: subscriptionsRes, isLoading: subsLoading } = useMySubscriptions(
    {},
    { enabled: isAuthenticated }
  );
  const isSubscribed = (subscriptionsRes?.data?.items || []).some(
    sub => sub.chat_id === chatId && sub.status === "active"
  );

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const reviews = reviewsRes?.data?.items || [];
  const summary = reviewsRes?.data?.summary;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { setError("Sign in from Telegram to leave a review."); return; }
    try {
      await submitReview({ chatId, data: { rating, review_text: reviewText } });
      setReviewText(""); setRating(5); setShowForm(false); setError(null);
      toast.success("Review submitted!");
      refetch();
    } catch (err) {
      toast.handleError(err);
    }
  };

  if (isLoading || (isAuthenticated && subsLoading)) {
    return (
      <div className="px-5 space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "var(--bg-muted)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="px-5 space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-base flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          Reviews
          {summary?.count ? (
            <span
              className="text-xs font-normal px-2 py-0.5 rounded-full"
              style={{ background: "var(--bg-muted)", color: "var(--text-muted)" }}
            >
              {summary.count}
            </span>
          ) : null}
        </h2>
        {isAuthenticated && isSubscribed && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-medium transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)")}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)")}
          >
            Leave a review
          </button>
        )}
      </div>

      {/* Rating summary */}
      {summary?.count ? (
        <div
          className="p-3 rounded-xl border flex items-center gap-5"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="text-center pr-5 border-r" style={{ borderColor: "var(--border)" }}>
            <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {summary.average_rating?.toFixed(1)}
            </div>
            <StarRow rating={Math.round(summary.average_rating || 0)} size={11} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Community rating</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Based on {summary.count} reviews
            </p>
          </div>
        </div>
      ) : null}

      {/* Review form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-xl border space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Your rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => setRating(s)}>
                  <Star
                    size={22}
                    className={s <= rating ? "fill-yellow-400 text-yellow-400" : ""}
                    style={{ color: s <= rating ? undefined : "var(--border)" }}
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder="What do you think about this channel?"
            rows={3}
            className="w-full rounded-lg px-3 py-2.5 text-sm border resize-none focus:outline-none transition-colors"
            style={{
              background: "var(--bg-subtle)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />

          {error && <p className="text-xs" style={{ color: "#dc2626" }}>{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 text-sm font-medium rounded-lg border transition-colors"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              style={{ background: "var(--accent)", color: "var(--text-inverse)" }}
            >
              {isSubmitting ? "Submitting..." : <><Send size={13} /> Submit</>}
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <div
              key={review.id}
              className="p-3 rounded-xl border"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-subtle)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Avatar text={review.username} size="sm" />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {review.username || "Anonymous"}
                    </p>
                    <StarRow rating={review.rating || 0} size={10} />
                  </div>
                </div>
                {review.created_at && (
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {review.review_text}
              </p>
            </div>
          ))
        ) : !showForm ? (
          <div className="py-8 text-center">
            <MessageSquare size={20} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No reviews yet.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StarRow({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5 mt-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={size}
          className={s <= rating ? "fill-yellow-400 text-yellow-400" : ""}
          style={{ color: s <= rating ? undefined : "var(--border)" }}
        />
      ))}
    </div>
  );
}
