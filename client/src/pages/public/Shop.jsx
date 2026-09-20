import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { listProductsRequest } from "../../services/productService.js";
import { listCategoriesRequest } from "../../services/categoryService.js";
import { ProductCard } from "../../components/product/ProductCard.jsx";
import { ProductCardSkeleton } from "../../components/common/Skeleton.jsx";
import { EmptyState, ErrorState } from "../../components/common/EmptyState.jsx";
import { Button } from "../../components/common/Button.jsx";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating_desc", label: "Top Rated" },
];

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    search: searchParams.get("search") || undefined,
    category: searchParams.get("category") || undefined,
    minPrice: searchParams.get("minPrice") || undefined,
    maxPrice: searchParams.get("maxPrice") || undefined,
    customizable: searchParams.get("customizable") === "true" ? true : undefined,
    sort: searchParams.get("sort") || "newest",
    page: Number(searchParams.get("page")) || 1,
    limit: 12,
  };

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategoriesRequest,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => listProductsRequest(filters),
    placeholderData: (prev) => prev,
  });

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  }

  function goToPage(page) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-stone-900">Shop Handmade Footwear</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-4">
        <aside className="space-y-6 lg:col-span-1">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">Search</label>
            <input
              type="search"
              defaultValue={filters.search}
              onKeyDown={(e) => e.key === "Enter" && updateFilter("search", e.currentTarget.value)}
              onBlur={(e) => updateFilter("search", e.currentTarget.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">Category</label>
            <select
              value={filters.category || ""}
              onChange={(e) => updateFilter("category", e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All categories</option>
              {categories?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">Price range (NPR)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                defaultValue={filters.minPrice}
                onBlur={(e) => updateFilter("minPrice", e.currentTarget.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
              <span className="text-stone-400">–</span>
              <input
                type="number"
                placeholder="Max"
                defaultValue={filters.maxPrice}
                onBlur={(e) => updateFilter("maxPrice", e.currentTarget.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={Boolean(filters.customizable)}
              onChange={(e) => updateFilter("customizable", e.target.checked ? "true" : "")}
            />
            Customizable only
          </label>
        </aside>

        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-stone-500">{data ? `${data.total} products` : ""}</p>
            <select
              value={filters.sort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {isError && <ErrorState message="Could not load products. Please try again." />}

          {isLoading && !data && (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          )}

          {data && data.items.length === 0 && (
            <EmptyState title="No products match your filters" description="Try adjusting your search or filters." />
          )}

          {data && data.items.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                {data.items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {data.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={filters.page <= 1}
                    onClick={() => goToPage(filters.page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-stone-500">
                    Page {filters.page} of {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={filters.page >= data.totalPages}
                    onClick={() => goToPage(filters.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
