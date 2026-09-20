import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getOrderRequest, updateOrderStatusRequest } from "../../services/orderService.js";
import { Spinner } from "../../components/common/Spinner.jsx";
import { ErrorState } from "../../components/common/EmptyState.jsx";
import { Button } from "../../components/common/Button.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";

const STAGES = ["pending", "confirmed", "processing", "shipped", "delivered"];

export function CustomerOrderDetails() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderRequest(id),
  });

  async function handleCancel() {
    try {
      await updateOrderStatusRequest(id, "cancelled");
      await queryClient.invalidateQueries({ queryKey: ["order", id] });
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel order");
    }
  }

  if (isLoading) return <Spinner />;
  if (isError || !order) return <ErrorState message="Order not found." />;

  const isTerminal = ["cancelled", "refunded"].includes(order.status);
  const stageIndex = STAGES.indexOf(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-stone-900">Order #{order._id.slice(-6)}</h1>
      <p className="text-sm text-stone-500">Placed {new Date(order.createdAt).toLocaleString()}</p>

      {!isTerminal ? (
        <div className="mt-8 flex items-center justify-between">
          {STAGES.map((stage, i) => (
            <div key={stage} className="flex flex-1 flex-col items-center">
              <div
                className={`h-3 w-3 rounded-full ${i <= stageIndex ? "bg-brand-600" : "bg-stone-200"}`}
              />
              <span className={`mt-2 text-xs capitalize ${i <= stageIndex ? "text-stone-900" : "text-stone-400"}`}>
                {stage}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <span className="mt-6 inline-block rounded-full bg-stone-100 px-3 py-1 text-sm font-medium capitalize text-stone-600">
          {order.status}
        </span>
      )}

      <div className="mt-8">
        <h2 className="font-medium text-stone-900">Items</h2>
        <div className="mt-3 divide-y divide-stone-200 rounded-xl border border-stone-200">
          {order.items.map((item) => (
            <div key={item._id} className="flex items-center gap-4 p-4">
              <img src={item.product?.images?.[0]} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium text-stone-900">{item.product?.name}</p>
                <p className="text-sm text-stone-500">
                  Size {item.size} × {item.quantity} · {item.artisan?.shopName}
                </p>
              </div>
              <span className="font-medium text-stone-900">{formatCurrency(item.lineTotal)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div>
          <h2 className="font-medium text-stone-900">Shipping Address</h2>
          <p className="mt-2 text-sm text-stone-600">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 && <>, {order.shippingAddress.line2}</>}
            <br />
            {order.shippingAddress.city}
            <br />
            {order.shippingAddress.phone}
          </p>
        </div>
        <div>
          <h2 className="font-medium text-stone-900">Total</h2>
          <div className="mt-2 space-y-1 text-sm text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatCurrency(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between font-semibold text-stone-900">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {["pending", "confirmed", "processing"].includes(order.status) && (
        <Button variant="outline" className="mt-8" onClick={handleCancel}>
          Cancel Order
        </Button>
      )}
    </div>
  );
}
