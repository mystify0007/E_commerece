import { useQuery } from "@tanstack/react-query";
import { StarRating } from "./StarRating.jsx";
import { EmptyState } from "../common/EmptyState.jsx";

export function ReviewList({ targetType, targetId, queryFn }) {
  const { data, isLoading } = useQuery({
    queryKey: ["reviews", targetType, targetId],
    queryFn: () => queryFn(targetId, { page: 1, limit: 20 }),
  });

  if (isLoading) return null;
  if (!data || data.items.length === 0) return <EmptyState title="No reviews yet" />;

  return (
    <div className="space-y-4">
      {data.items.map((review) => (
        <div key={review._id} className="rounded-lg border border-stone-200 p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-stone-900">{review.author?.name}</span>
            <StarRating value={review.rating} readOnly size="text-sm" />
          </div>
          {review.isVerifiedPurchase && (
            <span className="mt-1 inline-block text-xs font-medium text-green-700">✓ Verified purchase</span>
          )}
          {review.comment && <p className="mt-2 text-sm text-stone-600">{review.comment}</p>}
          <p className="mt-1 text-xs text-stone-400">{new Date(review.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
