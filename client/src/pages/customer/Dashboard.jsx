import { useAuth } from "../../context/AuthContext.jsx";

export function CustomerDashboard() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-stone-900">Welcome, {user?.name}</h1>
      <p className="mt-1 text-sm text-stone-500">{user?.email} &middot; {user?.role}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {["Orders", "Wishlist", "Custom Requests"].map((label) => (
          <div key={label} className="rounded-xl border border-stone-200 p-6">
            <p className="text-sm font-medium text-stone-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">0</p>
          </div>
        ))}
      </div>
    </div>
  );
}
