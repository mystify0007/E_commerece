import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getArtisanCustomOrderInboxRequest } from "../../services/customOrderService.js";
import { Spinner } from "../../components/common/Spinner.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";

export function ArtisanCustomRequests() {
  const { data, isLoading } = useQuery({
    queryKey: ["artisan-custom-order-inbox"],
    queryFn: () => getArtisanCustomOrderInboxRequest({ page: 1, limit: 50 }),
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Custom Requests</h1>
      <p className="mt-1 text-sm text-stone-500">Open requests, and ones already addressed to you.</p>

      {isLoading && <Spinner />}
      {data && data.items.length === 0 && (
        <div className="mt-6">
          <EmptyState title="No custom requests right now" />
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="mt-6 divide-y divide-stone-200 rounded-xl border border-stone-200">
          {data.items.map((co) => (
            <Link
              key={co._id}
              to={`/artisan/custom-requests/${co._id}`}
              className="flex items-center gap-4 p-4 hover:bg-stone-50"
            >
              <div className="flex-1">
                <p className="font-medium text-stone-900">Custom {co.shoeType}</p>
                <p className="text-sm text-stone-500">Size {co.size} · {new Date(co.createdAt).toLocaleDateString()}</p>
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
