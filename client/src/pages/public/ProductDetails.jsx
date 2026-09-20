import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProductRequest, getSimilarProductsRequest } from "../../services/productService.js";
import { ProductCard } from "../../components/product/ProductCard.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { ErrorState } from "../../components/common/EmptyState.jsx";
import { Button } from "../../components/common/Button.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";

export function ProductDetails() {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductRequest(id),
  });

  const { data: similar } = useQuery({
    queryKey: ["product-similar", id],
    queryFn: () => getSimilarProductsRequest(id),
    enabled: Boolean(product),
  });

  if (isLoading) return <Spinner />;
  if (isError || !product) return <ErrorState message="Product not found." />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-xl bg-stone-100">
            <img src={product.images[activeImage]} alt={product.name} className="h-full w-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
                    i === activeImage ? "border-brand-500" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            {product.isHandmade && (
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">Handmade</span>
            )}
            {product.isCustomizable && (
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
                Customizable
              </span>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-semibold text-stone-900">{product.name}</h1>
          <Link to={`/artisans/${product.artisan._id}`} className="mt-1 inline-block text-sm text-brand-600 hover:text-brand-700">
            by {product.artisan.shopName}
            {product.artisan.ratingCount > 0 && ` · ★ ${product.artisan.ratingAvg.toFixed(1)}`}
          </Link>

          <p className="mt-4 text-3xl font-semibold text-stone-900">{formatCurrency(product.price)}</p>

          <p className="mt-4 text-stone-600">{product.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-stone-500">Material</dt>
              <dd className="font-medium text-stone-900">{product.material}</dd>
            </div>
            {product.soleType && (
              <div>
                <dt className="text-stone-500">Sole</dt>
                <dd className="font-medium text-stone-900">{product.soleType}</dd>
              </div>
            )}
            <div>
              <dt className="text-stone-500">Sizes available</dt>
              <dd className="font-medium text-stone-900">{product.sizesAvailable.join(", ")}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Colors</dt>
              <dd className="font-medium text-stone-900">{product.colors.join(", ")}</dd>
            </div>
            {product.productionTimeDays > 0 && (
              <div>
                <dt className="text-stone-500">Production time</dt>
                <dd className="font-medium text-stone-900">{product.productionTimeDays} days</dd>
              </div>
            )}
            <div>
              <dt className="text-stone-500">Stock</dt>
              <dd className="font-medium text-stone-900">{product.stock > 0 ? `${product.stock} available` : "Out of stock"}</dd>
            </div>
          </dl>

          <div className="mt-8 flex gap-3">
            <Button disabled={product.stock === 0} className="flex-1">
              Add to Cart
            </Button>
            <Button variant="outline">Wishlist</Button>
            {product.isCustomizable && <Button variant="outline">Customize</Button>}
          </div>
          <p className="mt-2 text-xs text-stone-400">Cart & checkout ship in Phase 7 of the roadmap.</p>
        </div>
      </div>

      {similar && similar.length > 0 && (
        <div className="mt-16">
          <h2 className="text-lg font-semibold text-stone-900">Similar Shoes</h2>
          <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {similar.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
