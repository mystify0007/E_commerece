import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../common/Button.jsx";

const navLink = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? "text-brand-700" : "text-stone-600 hover:text-stone-900"}`;

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-semibold tracking-tight text-stone-900">
          Jutta<span className="text-brand-600">X</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/shop" className={navLink}>Shop</NavLink>
          <NavLink to="/artisans" className={navLink}>Artisans</NavLink>
          <NavLink to="/custom-shoes" className={navLink}>Custom Shoes</NavLink>
          <NavLink to="/about" className={navLink}>About</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
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
