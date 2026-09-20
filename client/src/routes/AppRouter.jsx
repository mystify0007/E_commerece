import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout.jsx";
import { ProtectedRoute, RoleRoute } from "./ProtectedRoute.jsx";
import { Home } from "../pages/public/Home.jsx";
import { Login } from "../pages/public/Login.jsx";
import { Register } from "../pages/public/Register.jsx";
import { ComingSoon } from "../pages/public/ComingSoon.jsx";
import { NotFound } from "../pages/public/NotFound.jsx";
import { CustomerDashboard } from "../pages/customer/Dashboard.jsx";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shop" element={<ComingSoon title="Shop" phase="Phase 5 — Product Marketplace" />} />
        <Route path="/artisans" element={<ComingSoon title="Artisan Marketplace" phase="Phase 6 — Artisan Marketplace" />} />
        <Route path="/custom-shoes" element={<ComingSoon title="Custom Shoes" phase="Phase 8 — Customization" />} />
        <Route path="/about" element={<ComingSoon title="About JuttaX" phase="a later content phase" />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<CustomerDashboard />} />
        </Route>

        <Route element={<RoleRoute roles={["artisan"]} />}>
          <Route path="/artisan" element={<ComingSoon title="Artisan Dashboard" phase="Phase 6 — Artisan Marketplace" />} />
        </Route>

        <Route element={<RoleRoute roles={["admin"]} />}>
          <Route path="/admin" element={<ComingSoon title="Admin Dashboard" phase="Phase 12 — Admin" />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
