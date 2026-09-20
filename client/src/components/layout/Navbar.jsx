import { Link, NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext.jsx";
import { getCartRequest } from "../../services/cartService.js";
import { Button } from "../common/Button.jsx";
import { NotificationBell } from "../notification/NotificationBell.jsx";

const navLink = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? "text-brand-700" : "text-stone-600 hover:text-stone-900"}`;

export function Navbar() {
  const { user, logout } = useAuth();
  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: getCartRequest,
    enabled: user?.role === "customer",
  });

  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-semibold tracking-tight text-stone-900">
          Jutta<span className="text-brand-600">X</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/shop" className={navLink}>Shop</NavLink>
          <NavLink to="/artisans" className={navLink}>Artisans</NavLink>
          <NavLink to="/custom-requests/new" className={navLink}>Custom Shoes</NavLink>
          <NavLink to="/about" className={navLink}>About</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === "customer" && (
                <>
                  <Link to="/wishlist" className="text-sm font-medium text-stone-700 hover:text-stone-900">
                    Wishlist
                  </Link>
                  <Link to="/cart" className="relative text-sm font-medium text-stone-700 hover:text-stone-900">
                    Cart
                    {cart?.itemCount > 0 && (
                      <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-semibold text-white">
                        {cart.itemCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
              <NotificationBell />
              <Link
                to={user.role === "admin" ? "/admin" : user.role === "artisan" ? "/artisan" : "/dashboard"}
                className="text-sm font-medium text-stone-700 hover:text-stone-900"
              >
                {user.name}
              </Link>
              <Button variant="outline" onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-stone-700 hover:text-stone-900">
                Login
              </Link>
              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
