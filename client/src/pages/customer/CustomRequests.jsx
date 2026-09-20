import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMyCustomOrdersRequest } from "../../services/customOrderService.js";
import { Spinner } from "../../components/common/Spinner.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { Button } from "../../components/common/Button.jsx";

export function CustomRequests() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-custom-orders"],
    queryFn: () => getMyCustomOrdersRequest({ page: 1, limit: 50 }),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">Custom Requests</h1>
        <Link to="/custom-requests/new">
          <Button>New Request</Button>
        </Link>
      </div>

      {isLoading && <Spinner />}
      {data && data.items.length === 0 && (
        <div className="mt-6">
          <EmptyState title="No custom requests yet" description="Request a fully custom pair of handmade footwear." />
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="mt-6 divide-y divide-stone-200 rounded-xl border border-stone-200">
          {data.items.map((co) => (
            <Link key={co._id} to={`/custom-requests/${co._id}`} className="flex items-center gap-4 p-4 hover:bg-stone-50">
              <div className="flex-1">
                <p className="font-medium text-stone-900">Custom {co.shoeType}</p>
                <p className="text-sm text-stone-500">{new Date(co.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium capitalize text-stone-600">
                {co.status.replace(/_/g, " ")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
