import { NavLink, Outlet } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar.jsx";

const linkClass = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium ${
    isActive ? "bg-brand-50 text-brand-700" : "text-stone-600 hover:bg-stone-100"
  }`;

export function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <aside className="w-56 shrink-0 space-y-1">
          <NavLink to="/admin" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={linkClass}>
            Users
          </NavLink>
          <NavLink to="/admin/artisans" className={linkClass}>
            Craftsman Verification
          </NavLink>
          <NavLink to="/admin/products" className={linkClass}>
            Product Moderation
          </NavLink>
          <NavLink to="/admin/categories" className={linkClass}>
            Categories
          </NavLink>
        </aside>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
