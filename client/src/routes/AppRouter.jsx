import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout.jsx";
import { ArtisanLayout } from "../layouts/ArtisanLayout.jsx";
import { AdminLayout } from "../layouts/AdminLayout.jsx";
import { ProtectedRoute, RoleRoute } from "./ProtectedRoute.jsx";
import { Home } from "../pages/public/Home.jsx";
import { Login } from "../pages/public/Login.jsx";
import { Register } from "../pages/public/Register.jsx";
import { Shop } from "../pages/public/Shop.jsx";
import { ProductDetails } from "../pages/public/ProductDetails.jsx";
import { Customizer } from "../pages/public/Customizer.jsx";
import { ArtisanMarketplace } from "../pages/public/ArtisanMarketplace.jsx";
import { ArtisanProfile } from "../pages/public/ArtisanProfile.jsx";
import { ComingSoon } from "../pages/public/ComingSoon.jsx";
import { NotFound } from "../pages/public/NotFound.jsx";
import { CustomerDashboard } from "../pages/customer/Dashboard.jsx";
import { Cart } from "../pages/customer/Cart.jsx";
import { Wishlist } from "../pages/customer/Wishlist.jsx";
import { Checkout } from "../pages/customer/Checkout.jsx";
import { CustomerOrders } from "../pages/customer/Orders.jsx";
import { CustomerOrderDetails } from "../pages/customer/OrderDetails.jsx";
import { ArtisanDashboard } from "../pages/artisan/Dashboard.jsx";
import { ArtisanShopProfile } from "../pages/artisan/ShopProfile.jsx";
import { ArtisanProducts } from "../pages/artisan/Products.jsx";
import { ArtisanAddProduct } from "../pages/artisan/AddProduct.jsx";
import { ArtisanEditProduct } from "../pages/artisan/EditProduct.jsx";
import { ArtisanOrders } from "../pages/artisan/Orders.jsx";
import { ArtisanProductCustomizations } from "../pages/artisan/ProductCustomizations.jsx";
import { AdminDashboard } from "../pages/admin/Dashboard.jsx";
import { AdminUsers } from "../pages/admin/Users.jsx";
import { AdminArtisans } from "../pages/admin/Artisans.jsx";
import { AdminProducts } from "../pages/admin/Products.jsx";
import { AdminCategories } from "../pages/admin/Categories.jsx";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/products/:id/customize" element={<Customizer />} />
        <Route path="/artisans" element={<ArtisanMarketplace />} />
        <Route path="/artisans/:id" element={<ArtisanProfile />} />
        <Route path="/about" element={<ComingSoon title="About JuttaX" phase="a later content phase" />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<CustomerOrders />} />
          <Route path="/orders/:id" element={<CustomerOrderDetails />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<RoleRoute roles={["artisan"]} />}>
        <Route element={<ArtisanLayout />}>
          <Route path="/artisan" element={<ArtisanDashboard />} />
          <Route path="/artisan/shop" element={<ArtisanShopProfile />} />
          <Route path="/artisan/products" element={<ArtisanProducts />} />
          <Route path="/artisan/products/new" element={<ArtisanAddProduct />} />
          <Route path="/artisan/products/:id/edit" element={<ArtisanEditProduct />} />
          <Route path="/artisan/orders" element={<ArtisanOrders />} />
          <Route path="/artisan/products/:id/customizations" element={<ArtisanProductCustomizations />} />
        </Route>
      </Route>

      <Route element={<RoleRoute roles={["admin"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/artisans" element={<AdminArtisans />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
        </Route>
      </Route>
    </Routes>
  );
}
