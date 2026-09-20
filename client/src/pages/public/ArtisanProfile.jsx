import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getArtisanRequest } from "../../services/artisanService.js";
import { listProductsRequest } from "../../services/productService.js";
import { ProductCard } from "../../components/product/ProductCard.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { ErrorState, EmptyState } from "../../components/common/EmptyState.jsx";

export function ArtisanProfile() {
  const { id } = useParams();

  const { data: artisan, isLoading, isError } = useQuery({
    queryKey: ["artisan", id],
    queryFn: () => getArtisanRequest(id),
  });

  const { data: products } = useQuery({
    queryKey: ["artisan-products", id],
    queryFn: () => listProductsRequest({ artisan: id, limit: 24 }),
    enabled: Boolean(artisan),
  });

  if (isLoading) return <Spinner />;
  if (isError || !artisan) return <ErrorState message="Artisan not found." />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-start gap-5 border-b border-stone-200 pb-8">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-100 text-2xl font-semibold text-brand-700">
          {artisan.shopName?.[0]}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-stone-900">{artisan.shopName}</h1>
            {artisan.verificationStatus === "approved" && (
              <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                ✓ Verified
              </span>
            )}
          </div>
          <p className="mt-1 text-stone-500">
            {artisan.location} {artisan.yearsOfExperience ? `· ${artisan.yearsOfExperience} years of experience` : ""}
          </p>
          {artisan.ratingCount > 0 && (
            <p className="mt-1 text-sm text-stone-500">★ {artisan.ratingAvg.toFixed(1)} ({artisan.ratingCount} reviews)</p>
          )}
          {artisan.specialization?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {artisan.specialization.map((s) => (
                <span key={s} className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                  {s}
                </span>
              ))}
            </div>
          )}
          {artisan.bio && <p className="mt-3 max-w-2xl text-stone-600">{artisan.bio}</p>}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-stone-900">Products</h2>
        {!products && <Spinner full={false} />}
        {products && products.items.length === 0 && (
          <EmptyState title="No products listed yet" />
        )}
        {products && products.items.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {products.items.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
