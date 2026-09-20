import { useQuery } from "@tanstack/react-query";
import { getDashboardStatsRequest } from "../../services/adminService.js";
import { Spinner } from "../../components/common/Spinner.jsx";

const TILES = [
  { key: "totalCustomers", label: "Total Customers" },
  { key: "totalArtisans", label: "Total Craftsmen" },
  { key: "pendingArtisans", label: "Pending Verifications" },
  { key: "approvedArtisans", label: "Verified Craftsmen" },
  { key: "totalProducts", label: "Total Products" },
  { key: "pendingProducts", label: "Pending Products" },
  { key: "approvedProducts", label: "Live Products" },
  { key: "totalCategories", label: "Categories" },
];

export function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboardStatsRequest,
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Admin Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {TILES.map((tile) => (
          <div key={tile.key} className="rounded-xl border border-stone-200 p-5">
            <p className="text-sm font-medium text-stone-500">{tile.label}</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">{data[tile.key]}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-stone-400">
        Order, payment, and complaint analytics will appear here once those modules ship.
      </p>
    </div>
  );
}
