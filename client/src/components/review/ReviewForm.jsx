import { useState } from "react";
import toast from "react-hot-toast";
import { createReviewRequest } from "../../services/reviewService.js";
import { StarRating } from "./StarRating.jsx";
import { Button } from "../common/Button.jsx";

export function ReviewForm({ targetType, target, order, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createReviewRequest({ targetType, target, order, rating, comment: comment || undefined });
      toast.success("Review submitted");
      onDone?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-stone-200 p-4">
      <StarRating value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Share your experience (optional)"
        className="mt-3 w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm"
      />
      <Button type="submit" isLoading={submitting} className="mt-3">
        Submit Review
      </Button>
    </form>
  );
}
