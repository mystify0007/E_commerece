import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency.js";

export function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product._id}`}
      className="group block overflow-hidden rounded-xl border border-stone-200 transition-shadow hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden bg-stone-100">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2">
          {product.isHandmade && (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">Handmade</span>
          )}
          {product.isCustomizable && (
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">Customizable</span>
          )}
        </div>
        <h3 className="mt-2 line-clamp-1 font-medium text-stone-900">{product.name}</h3>
        <p className="mt-0.5 text-sm text-stone-500">{product.artisan?.shopName}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-semibold text-stone-900">{formatCurrency(product.price)}</span>
          {product.ratingCount > 0 && (
            <span className="text-sm text-stone-500">★ {product.ratingAvg.toFixed(1)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
