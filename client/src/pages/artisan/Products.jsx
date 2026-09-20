import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { listMyProductsRequest, archiveProductRequest } from "../../services/productService.js";
import { Spinner } from "../../components/common/Spinner.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { Button } from "../../components/common/Button.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  archived: "bg-stone-100 text-stone-500",
};

export function ArtisanProducts() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-products"],
    queryFn: () => listMyProductsRequest({ page: 1, limit: 50 }),
  });

  async function handleArchive(id) {
    try {
      await archiveProductRequest(id);
      await queryClient.invalidateQueries({ queryKey: ["my-products"] });
      toast.success("Product archived");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to archive product");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">My Products</h1>
        <Link to="/artisan/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>

      {isLoading && <Spinner />}
      {data && data.items.length === 0 && (
        <div className="mt-6">
          <EmptyState title="No products yet" description="Add your first handmade product to get started." />
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="mt-6 divide-y divide-stone-200 rounded-xl border border-stone-200">
          {data.items.map((product) => (
            <div key={product._id} className="flex items-center gap-4 p-4">
              <img src={product.images?.[0]} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium text-stone-900">{product.name}</p>
                <p className="text-sm text-stone-500">{formatCurrency(product.price)} · Stock: {product.stock}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[product.status]}`}>
                {product.status}
              </span>
              {product.status !== "archived" && (
                <div className="flex gap-2">
                  <Link to={`/artisan/products/${product._id}/edit`}>
                    <Button variant="outline">Edit</Button>
                  </Link>
                  <Button variant="secondary" onClick={() => handleArchive(product._id)}>
                    Archive
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
