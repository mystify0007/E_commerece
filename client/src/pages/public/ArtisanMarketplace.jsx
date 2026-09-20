import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listArtisansRequest } from "../../services/artisanService.js";
import { Spinner } from "../../components/common/Spinner.jsx";
import { EmptyState, ErrorState } from "../../components/common/EmptyState.jsx";

export function ArtisanMarketplace() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["artisans"],
    queryFn: () => listArtisansRequest({ page: 1, limit: 24 }),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-stone-900">Meet the Craftsmen</h1>
      <p className="mt-1 text-stone-500">Local, verified makers behind every handmade pair.</p>

      {isLoading && <Spinner />}
      {isError && <ErrorState message="Could not load artisans." />}
      {data && data.items.length === 0 && (
        <EmptyState title="No verified artisans yet" description="Check back soon." />
      )}

      {data && data.items.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((artisan) => (
            <Link
              key={artisan._id}
              to={`/artisans/${artisan._id}`}
              className="rounded-xl border border-stone-200 p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
                  {artisan.shopName?.[0]}
                </div>
                <div>
                  <p className="font-medium text-stone-900">{artisan.shopName}</p>
                  <p className="text-sm text-stone-500">{artisan.location || "Nepal"}</p>
                </div>
              </div>
              {artisan.ratingCount > 0 && (
                <p className="mt-3 text-sm text-stone-500">★ {artisan.ratingAvg.toFixed(1)} ({artisan.ratingCount} reviews)</p>
              )}
              {artisan.bio && <p className="mt-2 line-clamp-2 text-sm text-stone-600">{artisan.bio}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
