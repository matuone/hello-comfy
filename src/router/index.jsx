// src/router/index.jsx
import { Routes, Route } from "react-router-dom";

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
import CreateAccount from "../views/CreateAccount";
import Products from "../views/Products";
import Category from "../views/Category";
import ProductDetail from "../views/ProductDetail";
import Wishlist from "../views/Wishlist";

// ⭐ Checkout
import Checkout from "../views/Checkout";
import CheckoutSuccess from "../views/CheckoutSuccess";
import CheckoutError from "../views/CheckoutError";

// Admin
import AdminLayout from "../views/AdminLayout";
import AdminDashboard from "../views/AdminDashboard";
import AdminSales from "../views/AdminSales";
import AdminSaleDetail from "../views/AdminSaleDetail";
import AdminProducts from "../views/AdminProducts";
import AdminProductDetail from "../views/AdminProductDetail";
import AdminStock from "../views/AdminStock";
import AdminCustomers from "../views/AdminCustomers";
import AdminCustomerDetail from "../views/AdminCustomerDetail";
import AdminCustomerEdit from "../views/AdminCustomerEdit";
import AdminStats from "../views/AdminStats";
import AdminMarketing from "../views/AdminMarketing";

// ⭐ NUEVOS IMPORTS
import AdminDiscounts from "../views/AdminDiscounts";
import AdminPromoCodes from "../views/AdminPromoCodes";

// Protección de rutas admin
import AdminRoute from "./AdminRoute";

export default function AppRouter() {
  return (
    <Routes>

      {/* ============================
          RUTAS PÚBLICAS
      ============================ */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        {/* Categorías dinámicas */}
        <Route
          path="/indumentaria/:subcategory"
          element={<Category section="indumentaria" />}
        />
        <Route
          path="/cute-items/:subcategory"
          element={<Category section="cute-items" />}
        />
        <Route
          path="/merch/:subcategory"
          element={<Category section="merch" />}
        />

        {/* Páginas informativas */}
        <Route path="/categorias" element={<Categories />} />
        <Route path="/talles" element={<SizeGuide />} />
        <Route path="/algodon" element={<CottonCare />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/medios-de-pago" element={<PaymentMethods />} />

        {/* Cuenta */}
        <Route path="/mi-cuenta" element={<MyAccount />} />
        <Route path="/create-account" element={<CreateAccount />} />

        {/* Carrito */}
        <Route path="/cart" element={<Cart />} />

        {/* ⭐ Wishlist */}
        <Route path="/wishlist" element={<Wishlist />} />

        {/* ⭐ Checkout */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/checkout/error" element={<CheckoutError />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ============================
          PANEL ADMIN (PROTEGIDO)
      ============================ */}
      <Route
        element={
          <AdminRoute>
            <AdminLayout />
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

        {/* ⭐ NUEVAS RUTAS */}
        <Route path="/admin/discounts" element={<AdminDiscounts />} />
        <Route path="/admin/promocodes" element={<AdminPromoCodes />} />
      </Route>

    </Routes>
  );
}
