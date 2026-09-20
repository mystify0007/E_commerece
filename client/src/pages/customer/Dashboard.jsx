import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMyOrdersRequest } from "../../services/orderService.js";
import { getMyCustomOrdersRequest } from "../../services/customOrderService.js";
import { getWishlistRequest } from "../../services/wishlistService.js";

export function CustomerDashboard() {
  const { user } = useAuth();
  const { data: orders } = useQuery({
    queryKey: ["my-orders", "dashboard"],
    queryFn: () => getMyOrdersRequest({ page: 1, limit: 1 }),
  });
  const { data: customOrders } = useQuery({
    queryKey: ["my-custom-orders", "dashboard"],
    queryFn: () => getMyCustomOrdersRequest({ page: 1, limit: 1 }),
  });
  const { data: wishlist } = useQuery({ queryKey: ["wishlist"], queryFn: getWishlistRequest });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-stone-900">Welcome, {user?.name}</h1>
      <p className="mt-1 text-sm text-stone-500">{user?.email} &middot; {user?.role}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link to="/orders" className="rounded-xl border border-stone-200 p-6 hover:border-brand-300">
          <p className="text-sm font-medium text-stone-500">Orders</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">{orders?.total ?? "—"}</p>
        </Link>
        <Link to="/wishlist" className="rounded-xl border border-stone-200 p-6 hover:border-brand-300">
          <p className="text-sm font-medium text-stone-500">Wishlist</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">{wishlist?.items?.length ?? "—"}</p>
        </Link>
        <Link to="/custom-requests" className="rounded-xl border border-stone-200 p-6 hover:border-brand-300">
          <p className="text-sm font-medium text-stone-500">Custom Requests</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">{customOrders?.total ?? "—"}</p>
        </Link>
      </div>
    </div>
  );
}
