import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { listArtisansAdminRequest, verifyArtisanRequest } from "../../services/adminService.js";
import { Spinner } from "../../components/common/Spinner.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { Button } from "../../components/common/Button.jsx";

const TABS = ["pending", "approved", "rejected", "all"];

export function AdminArtisans() {
  const [tab, setTab] = useState("pending");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-artisans", tab],
    queryFn: () => listArtisansAdminRequest({ status: tab, limit: 50 }),
  });

  async function decide(id, status) {
    try {
      await verifyArtisanRequest(id, { status });
      await queryClient.invalidateQueries({ queryKey: ["admin-artisans"] });
      toast.success(`Artisan ${status}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update artisan");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Artisan Verification</h1>

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
      {data && data.items.length === 0 && <div className="mt-6"><EmptyState title={`No ${tab} artisans`} /></div>}

      {data && data.items.length > 0 && (
        <div className="mt-6 divide-y divide-stone-200 rounded-xl border border-stone-200">
          {data.items.map((artisan) => (
            <div key={artisan._id} className="flex items-center gap-4 p-4">
              <div className="flex-1">
                <p className="font-medium text-stone-900">{artisan.shopName}</p>
                <p className="text-sm text-stone-500">{artisan.user?.name} · {artisan.user?.email}</p>
              </div>
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium capitalize text-stone-600">
                {artisan.verificationStatus}
              </span>
              {artisan.verificationStatus === "pending" && (
                <div className="flex gap-2">
                  <Button onClick={() => decide(artisan._id, "approved")}>Approve</Button>
                  <Button variant="outline" onClick={() => decide(artisan._id, "rejected")}>
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
