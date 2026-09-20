import { NavLink, Outlet } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar.jsx";

const linkClass = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium ${
    isActive ? "bg-brand-50 text-brand-700" : "text-stone-600 hover:bg-stone-100"
  }`;

export function ArtisanLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <aside className="w-56 shrink-0 space-y-1">
          <NavLink to="/artisan" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/artisan/shop" className={linkClass}>
            Shop Profile
          </NavLink>
          <NavLink to="/artisan/products" className={linkClass}>
            Products
          </NavLink>
          <NavLink to="/artisan/products/new" className={linkClass}>
            Add Product
          </NavLink>
          <NavLink to="/artisan/orders" className={linkClass}>
            Orders
          </NavLink>
          <NavLink to="/artisan/custom-requests" className={linkClass}>
            Custom Requests
          </NavLink>
        </aside>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
