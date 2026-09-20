import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getProductRequest, getSimilarProductsRequest } from "../../services/productService.js";
import { addCartItemRequest } from "../../services/cartService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { ProductCard } from "../../components/product/ProductCard.jsx";
import { Spinner } from "../../components/common/Spinner.jsx";
import { ErrorState } from "../../components/common/EmptyState.jsx";
import { Button } from "../../components/common/Button.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";

export function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState(null);
  const [adding, setAdding] = useState(false);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductRequest(id),
  });

  const { data: similar } = useQuery({
    queryKey: ["product-similar", id],
    queryFn: () => getSimilarProductsRequest(id),
    enabled: Boolean(product),
  });

  async function handleAddToCart() {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    if (user.role !== "customer") {
      toast.error("Only customer accounts can add products to a cart");
      return;
    }
    if (!size) {
      toast.error("Please select a size");
      return;
    }
    setAdding(true);
    try {
      await addCartItemRequest({ product: id, quantity: 1, size });
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  }

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

          <div className="mt-6">
            <span className="mb-1.5 block text-sm font-medium text-stone-700">Size</span>
            <div className="flex flex-wrap gap-2">
              {product.sizesAvailable.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`h-10 w-10 rounded-lg border text-sm font-medium ${
                    size === s ? "border-brand-500 bg-brand-50 text-brand-700" : "border-stone-300 text-stone-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button disabled={product.stock === 0} isLoading={adding} onClick={handleAddToCart} className="flex-1">
              Add to Cart
            </Button>
            {product.isCustomizable && (
              <Link to={`/products/${id}/customize`}>
                <Button variant="outline">Customize</Button>
              </Link>
            )}
          </div>
          <p className="mt-2 text-xs text-stone-400">Wishlist ships in a later phase.</p>
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
