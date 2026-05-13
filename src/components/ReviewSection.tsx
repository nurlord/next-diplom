"use client";

import { useState } from "react";
import { Star, MessageSquare, Send, User, CheckCircle2, AlertCircle } from "lucide-react";
import { usePublicReviews, useSubmitReview, useMySubscriptions } from "@/api/hooks";
import { useAuthContext } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { useEffect } from "react";

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
    (sub) => sub.chat_id === chatId && sub.status === "active"
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
    if (!isAuthenticated) {
      setError("Please sign in from Telegram to leave a review.");
      return;
    }

    try {
      await submitReview({
        chatId,
        data: { rating, review_text: reviewText },
      });
      setReviewText("");
      setRating(5);
      setShowForm(false);
      setError(null);
      toast.success("Review submitted successfully!");
      refetch();
    } catch (err: any) {
      setError(err.message || "Failed to submit review.");
    }
  };

  if (isLoading || (isAuthenticated && subsLoading)) {
    return (
      <div className="px-5 py-8 text-center animate-pulse">
        <div className="h-4 w-32 bg-neutral-800 rounded mx-auto mb-4"></div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-neutral-800/40 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 space-y-6 relative">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          Reviews 
          {summary?.count ? (
            <span className="text-xs font-normal text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded-full">
              {summary.count}
            </span>
          ) : null}
        </h3>
        
        {isAuthenticated && isSubscribed && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="text-xs text-blue-400 font-medium hover:underline"
          >
            Leave a Review
          </button>
        )}
      </div>

      {/* Summary Stats */}
      {summary?.count ? (
        <div className="bg-neutral-800/20 border border-neutral-800/50 p-4 rounded-2xl flex items-center gap-6">
          <div className="text-center border-r border-neutral-800 pr-6">
            <div className="text-3xl font-bold text-white">{summary.average_rating?.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  size={12} 
                  className={s <= Math.round(summary.average_rating || 0) ? "fill-yellow-500 text-yellow-500" : "text-neutral-700"} 
                />
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm text-neutral-400">Community Feedback</p>
            <p className="text-xs text-neutral-500">Based on {summary.count} user reviews</p>
          </div>
        </div>
      ) : null}

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-neutral-800 border border-neutral-700 p-4 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold">Your Rating</h4>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star 
                    size={24} 
                    className={s <= rating ? "fill-yellow-500 text-yellow-500" : "text-neutral-600"} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell others what you think about this channel..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm min-h-[100px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-neutral-600"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-neutral-900 border border-neutral-800 text-neutral-400 hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Sending...</span>
              ) : (
                <>
                  Submit Review <Send size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="bg-neutral-800/40 border border-neutral-800/80 p-4 rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-inner uppercase ${
                    ['bg-blue-600', 'bg-purple-600', 'bg-orange-600', 'bg-emerald-600', 'bg-pink-600'][ (review.username?.length || 5) % 5 ]
                  }`}>
                    {review.username?.[0] || <User size={14} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{review.username || "Anonymous"}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          size={10} 
                          className={s <= (review.rating || 0) ? "fill-yellow-500 text-yellow-500" : "text-neutral-700"} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {review.created_at && (
                  <span className="text-[10px] text-neutral-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {review.review_text}
              </p>
            </div>
          ))
        ) : !showForm ? (
          <div className="text-center py-6 bg-neutral-900/50 border border-neutral-800 border-dashed rounded-2xl">
            <MessageSquare size={24} className="text-neutral-700 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">No reviews yet. Be the first!</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
