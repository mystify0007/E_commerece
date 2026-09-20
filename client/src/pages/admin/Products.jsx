import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { listProductsAdminRequest, moderateProductRequest } from "../../services/adminService.js";
import { Spinner } from "../../components/common/Spinner.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { Button } from "../../components/common/Button.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";

const TABS = ["pending", "approved", "rejected", "archived", "all"];

export function AdminProducts() {
  const [tab, setTab] = useState("pending");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", tab],
    queryFn: () => listProductsAdminRequest({ status: tab, limit: 50 }),
  });

  async function decide(id, action) {
    try {
      await moderateProductRequest(id, { action });
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Product ${action}d`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update product");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Product Moderation</h1>

      <div className="mt-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize ${
              tab === t ? "bg-brand-600 text-white" : "bg-stone-100 text-stone-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading && <Spinner />}
      {data && data.items.length === 0 && <div className="mt-6"><EmptyState title={`No ${tab} products`} /></div>}

      {data && data.items.length > 0 && (
        <div className="mt-6 divide-y divide-stone-200 rounded-xl border border-stone-200">
          {data.items.map((product) => (
            <div key={product._id} className="flex items-center gap-4 p-4">
              <img src={product.images?.[0]} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium text-stone-900">{product.name}</p>
                <p className="text-sm text-stone-500">
                  {product.artisan?.shopName} · {formatCurrency(product.price)} · {product.category?.name}
                </p>
              </div>
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium capitalize text-stone-600">
                {product.status}
              </span>
              {product.status === "pending" && (
                <div className="flex gap-2">
                  <Button onClick={() => decide(product._id, "approve")}>Approve</Button>
                  <Button variant="outline" onClick={() => decide(product._id, "reject")}>
                    Reject
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
