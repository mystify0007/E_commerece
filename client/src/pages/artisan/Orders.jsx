import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getArtisanOrderItemsRequest, updateOrderStatusRequest } from "../../services/orderService.js";
import { Spinner } from "../../components/common/Spinner.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { Button } from "../../components/common/Button.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";

const NEXT_STATUS = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "shipped",
  shipped: "delivered",
};

export function ArtisanOrders() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["artisan-order-items"],
    queryFn: () => getArtisanOrderItemsRequest({ page: 1, limit: 50 }),
  });

  async function advance(orderId, currentStatus) {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    try {
      await updateOrderStatusRequest(orderId, next);
      await queryClient.invalidateQueries({ queryKey: ["artisan-order-items"] });
      toast.success(`Order marked ${next}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update order");
    }
  }

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Orders</h1>
      <p className="mt-1 text-sm text-stone-500">Line items from customer orders containing your products.</p>

      {data && data.items.length === 0 && (
        <div className="mt-6">
          <EmptyState title="No orders yet" />
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="mt-6 divide-y divide-stone-200 rounded-xl border border-stone-200">
          {data.items.map((item) => (
            <div key={item._id} className="flex items-center gap-4 p-4">
              <img src={item.product?.images?.[0]} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium text-stone-900">{item.product?.name}</p>
                <p className="text-sm text-stone-500">
                  Size {item.size}
                  {item.color && ` · Color ${item.color}`} × {item.quantity} · {formatCurrency(item.lineTotal)}
                </p>
              </div>
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium capitalize text-stone-600">
                {item.order?.status}
              </span>
              {NEXT_STATUS[item.order?.status] && (
                <Button variant="outline" onClick={() => advance(item.order._id, item.order.status)}>
                  Mark {NEXT_STATUS[item.order.status]}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
