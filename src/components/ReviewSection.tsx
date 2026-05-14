"use client";

import { useState } from "react";
import { Star, MessageSquare, Send, User } from "lucide-react";
import { usePublicReviews, useSubmitReview, useMySubscriptions } from "@/api/hooks";
import { useAuthContext } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { useEffect } from "react";
import { Button, Card, TextArea, CardSkeleton } from "@/components/ui";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";

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
      toast.handleError(err);
    }
  };

  if (isLoading || (isAuthenticated && subsLoading)) {
    return (
      <div className="px-5 py-8">
        <CardSkeleton count={2} />
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
        <Card padding="sm" className="!rounded-2xl !p-4 flex items-center gap-6 !bg-neutral-800/20 !border-neutral-800/50">
          <div className="text-center border-r border-neutral-800 pr-6">
            <div className="text-3xl font-bold text-white">{summary.average_rating?.toFixed(1)}</div>
            <StarRow rating={Math.round(summary.average_rating || 0)} size={12} />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm text-neutral-400">Community Feedback</p>
            <p className="text-xs text-neutral-500">Based on {summary.count} user reviews</p>
          </div>
        </Card>
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

          <TextArea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Tell others what you think about this channel..."
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              icon={Send}
              className="flex-1"
            >
              Submit Review
            </Button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id} padding="sm" className="!rounded-2xl !p-4 !bg-neutral-800/40 !border-neutral-800/80">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Avatar text={review.username} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-white">{review.username || "Anonymous"}</p>
                    <StarRow rating={review.rating || 0} size={10} />
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
            </Card>
          ))
        ) : !showForm ? (
          <EmptyState
            icon={MessageSquare}
            subtitle="No reviews yet. Be the first!"
          />
        ) : null}
      </div>
    </div>
  );
}

/** Reusable star rating display */
function StarRow({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5 mt-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star 
          key={s} 
          size={size} 
          className={s <= rating ? "fill-yellow-500 text-yellow-500" : "text-neutral-700"} 
        />
      ))}
    </div>
  );
}
