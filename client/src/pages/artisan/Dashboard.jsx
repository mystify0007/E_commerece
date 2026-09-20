import { useQuery } from "@tanstack/react-query";
import { getMyArtisanProfileRequest } from "../../services/artisanService.js";
import { Spinner } from "../../components/common/Spinner.jsx";

export function ArtisanDashboard() {
  const { data: artisan, isLoading } = useQuery({
    queryKey: ["my-artisan-profile"],
    queryFn: getMyArtisanProfileRequest,
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">{artisan.shopName}</h1>

      <div className="mt-2">
        {artisan.verificationStatus === "pending" && (
          <p className="inline-block rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
            Verification pending — an admin will review your shop soon.
          </p>
        )}
        {artisan.verificationStatus === "approved" && (
          <p className="inline-block rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
            ✓ Verified — you can list products for sale.
          </p>
        )}
        {artisan.verificationStatus === "rejected" && (
          <p className="inline-block rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
            Verification rejected{artisan.verificationNote ? `: ${artisan.verificationNote}` : ""}
          </p>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {["Total Sales", "Total Orders", "Average Rating"].map((label) => (
          <div key={label} className="rounded-xl border border-stone-200 p-6">
            <p className="text-sm font-medium text-stone-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">
              {label === "Average Rating" ? artisan.ratingAvg.toFixed(1) : 0}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-stone-400">Full sales/order analytics ship in Phase 17 of the roadmap.</p>
    </div>
  );
}
