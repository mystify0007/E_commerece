import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMyOrdersRequest } from "../../services/orderService.js";
import { Spinner } from "../../components/common/Spinner.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-stone-100 text-stone-500",
  refunded: "bg-red-50 text-red-700",
};

export function CustomerOrders() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => getMyOrdersRequest({ page: 1, limit: 50 }),
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-stone-900">My Orders</h1>

      {data && data.items.length === 0 && (
        <div className="mt-6">
          <EmptyState title="No orders yet" description="Your placed orders will show up here." />
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="mt-6 divide-y divide-stone-200 rounded-xl border border-stone-200">
          {data.items.map((order) => (
            <Link key={order._id} to={`/orders/${order._id}`} className="flex items-center gap-4 p-4 hover:bg-stone-50">
              <div className="flex-1">
                <p className="font-medium text-stone-900">Order #{order._id.slice(-6)}</p>
                <p className="text-sm text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="font-medium text-stone-900">{formatCurrency(order.total)}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[order.status]}`}>
                {order.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
