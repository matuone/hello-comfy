import ResetPassword from "../views/ResetPassword";
<Route path="/reset-password/:token" element={<ResetPassword />} />
// src/router/index.jsx
import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Layout público
import Layout from "../views/Layout";

// Vistas públicas
import Home from "../views/Home";
import Cart from "../views/Cart";
import NotFound from "../views/NotFound";
import Categories from "../views/Categories";
import SizeGuide from "../views/SizeGuide";
import CottonCare from "../views/CottonCare";
import FAQ from "../views/FAQ";
import PaymentMethods from "../views/PaymentMethods";
import MyAccount from "../views/MyAccount";
import Products from "../views/Products";
import Category from "../views/Category";
import ProductDetail from "../views/ProductDetail";
import Wishlist from "../views/Wishlist";

// ⭐ NUEVO: Registro
import Register from "../views/account/Register";
import VerifyEmail from "../views/VerifyEmail";

// Checkout
import Checkout from "../views/Checkout";
import CheckoutSuccess from "../views/CheckoutSuccess";
import CheckoutError from "../views/CheckoutError";

// ⭐ NUEVO: Mercado Pago Payment Results
import PaymentSuccess from "../views/PaymentSuccess";
import PaymentFailure from "../views/PaymentFailure";
import PaymentPending from "../views/PaymentPending";

// ⭐ NUEVO: Modo Checkout
import ModoCheckout from "../views/ModoCheckout";

// Order Tracking
import OrderTracking from "../views/OrderTracking";

// Order Details (PÚBLICO)
import OrderDetails from "../views/OrderDetails";

// Admin (lazy)
const AdminLayout = lazy(() => import("../views/AdminLayout"));
const AdminDashboard = lazy(() => import("../views/AdminDashboard"));
const AdminSales = lazy(() => import("../views/AdminSales"));
const AdminSaleDetail = lazy(() => import("../views/AdminSaleDetail"));
const AdminProducts = lazy(() => import("../views/AdminProducts"));
const AdminProductDetail = lazy(() => import("../views/AdminProductDetail"));
const AdminStock = lazy(() => import("../views/AdminStock"));
const AdminCustomers = lazy(() => import("../views/AdminCustomers"));
const AdminCustomerDetail = lazy(() => import("../views/AdminCustomerDetail"));
const AdminCustomerEdit = lazy(() => import("../views/AdminCustomerEdit"));
const AdminStats = lazy(() => import("../views/AdminStats"));
const AdminOpinions = lazy(() => import("../views/AdminOpinions"));
const AdminMarketing = lazy(() => import("../views/AdminMarketing"));
const AdminSubcategories = lazy(() => import("../views/AdminSubcategories"));
const AdminDiscounts = lazy(() => import("../views/AdminDiscounts"));
const AdminPromoCodes = lazy(() => import("../views/AdminPromoCodes"));
const AdminSizeTables = lazy(() => import("../views/AdminSizeTables"));
const AdminAbandonedCarts = lazy(() => import("../views/AdminAbandonedCarts"));
// Protección admin
import AdminRoute from "./AdminRoute";
import AdminLogin from "../views/AdminLogin";

// Área de cliente (PROTEGIDA)
import UserRoute from "./UserRoute";
import AccountLayout from "../views/account/AccountLayout";
import AccountPurchases from "../views/account/AccountPurchases";
import AccountProfile from "../views/account/AccountProfile";
import AccountShipping from "../views/account/AccountShipping";
import AccountContact from "../views/account/AccountContact";

// ⭐ NUEVO: soporte
import AccountOpinions from "../views/account/AccountOpinions";
import AccountHelp from "../views/account/AccountHelp";
import AccountWishlist from "../views/account/AccountWishlist";

export default function AppRouter() {
  const adminFallback = (
    <div style={{ padding: "24px", textAlign: "center" }}>Cargando panel...</div>
  );

  function VisitTracker() {
    const location = useLocation();

    useEffect(() => {
      const path = location.pathname || "/";

      if (path.startsWith("/admin")) return;

      const key = "hc-last-visit-ping";
      const now = Date.now();
      const lastPing = Number(sessionStorage.getItem(key) || 0);

      // Evita ruido excesivo en navegación rápida; cuenta como visita de sesión.
      if (now - lastPing < 5 * 60 * 1000) return;
      sessionStorage.setItem(key, String(now));

      const base = import.meta.env.VITE_API_URL || "/api";
      const url = path.startsWith("/") ? `${base}/visits/track` : `${base}/visits/track`;

      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path }),
        keepalive: true,
      }).catch(() => { });
    }, [location.pathname]);

    return null;
  }

  return (
    <>
      <VisitTracker />
      <Routes>

        {/* Públicas */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          <Route path="/indumentaria/:subcategory" element={<Category section="indumentaria" />} />
          <Route path="/cute-items/:subcategory" element={<Category section="cute-items" />} />
          <Route path="/merch/:subcategory" element={<Category section="merch" />} />

          <Route path="/categorias" element={<Categories />} />
          <Route path="/talles" element={<SizeGuide />} />
          <Route path="/algodon" element={<CottonCare />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/medios-de-pago" element={<PaymentMethods />} />

          <Route path="/mi-cuenta" element={<MyAccount />} />

          {/* ⭐ NUEVA RUTA DE REGISTRO */}
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />

          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/error" element={<CheckoutError />} />

          {/* ⭐ NUEVO: Rutas de pago Mercado Pago */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
          <Route path="/payment/pending" element={<PaymentPending />} />

          {/* ⭐ NUEVO: Ruta de checkout Modo */}
          <Route path="/payment/modo-checkout" element={<ModoCheckout />} />

          <Route path="/seguimiento" element={<OrderTracking />} />
          <Route path="/orden/:code" element={<OrderDetails />} />

          <Route path="/notfound" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Login admin (sin Layout, accesible siempre) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin */}
        <Route
          element={
            <AdminRoute>
              <Suspense fallback={adminFallback}>
                <AdminLayout />
              </Suspense>
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/sales" element={<AdminSales />} />
          <Route path="/admin/sales/:id" element={<AdminSaleDetail />} />

          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/new" element={<AdminProductDetail />} />
          <Route path="/admin/products/:id" element={<AdminProductDetail />} />

          <Route path="/admin/stock" element={<AdminStock />} />

          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/customers/:id" element={<AdminCustomerDetail />} />
          <Route path="/admin/customers/:id/edit" element={<AdminCustomerEdit />} />

          <Route path="/admin/stats" element={<AdminStats />} />
          <Route path="/admin/marketing" element={<AdminMarketing />} />

          <Route path="/admin/discounts" element={<AdminDiscounts />} />
          <Route path="/admin/promocodes" element={<AdminPromoCodes />} />
          <Route path="/admin/subcategories" element={<AdminSubcategories />} />
          <Route path="/admin/sizetables" element={<AdminSizeTables />} />
          <Route path="/admin/opinions" element={<AdminOpinions />} />
          <Route path="/admin/abandoned-carts" element={<AdminAbandonedCarts />} />
        </Route>

        {/* Área de cliente */}
        <Route
          element={
            <UserRoute>
              <AccountLayout />
            </UserRoute>
          }
        >
          <Route path="/mi-cuenta/compras" element={<AccountPurchases />} />
          <Route path="/mi-cuenta/perfil" element={<AccountProfile />} />
          <Route path="/mi-cuenta/envio" element={<AccountShipping />} />
          <Route path="/mi-cuenta/contacto" element={<AccountContact />} />
          <Route path="/mi-cuenta/opiniones" element={<AccountOpinions />} />
          {/* ⭐ NUEVA RUTA DE AYUDA */}
          <Route path="/mi-cuenta/ayuda" element={<AccountHelp />} />
          <Route path="/mi-cuenta/favoritos" element={<AccountWishlist />} />
        </Route>

      </Routes>
    </>
  );
}
