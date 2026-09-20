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
      toast.success(`Craftsman ${status}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update craftsman");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Craftsman Verification</h1>
      <p className="mt-1 text-sm text-stone-500">
        Review the shop's specialization and experience before approving — this is what determines whether their
        products go live.
      </p>

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
      {data && data.items.length === 0 && <div className="mt-6"><EmptyState title={`No ${tab} craftsmen`} /></div>}

      {data && data.items.length > 0 && (
        <div className="mt-6 divide-y divide-stone-200 rounded-xl border border-stone-200">
          {data.items.map((artisan) => (
            <div key={artisan._id} className="flex items-start gap-4 p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-stone-900">{artisan.shopName}</p>
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium capitalize text-stone-600">
                    {artisan.verificationStatus}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-stone-500">{artisan.user?.name} · {artisan.user?.email}</p>
                <p className="mt-1 text-sm text-stone-500">
                  {artisan.location || "No location given"}
                  {artisan.yearsOfExperience ? ` · ${artisan.yearsOfExperience} years of experience` : ""}
                </p>
                {artisan.specialization?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {artisan.specialization.map((s) => (
                      <span key={s} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {artisan.bio && <p className="mt-2 max-w-xl text-sm text-stone-600">{artisan.bio}</p>}
                {artisan.verificationDocs?.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {artisan.verificationDocs.map((doc) => (
                      <a
                        key={doc}
                        href={doc}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-brand-600 hover:text-brand-700"
                      >
                        View document
                      </a>
                    ))}
                  </div>
                )}
              </div>
              {artisan.verificationStatus === "pending" && (
                <div className="flex shrink-0 gap-2">
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
