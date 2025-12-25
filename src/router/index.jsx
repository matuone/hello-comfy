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

// Admin
import AdminLayout from "../views/AdminLayout";
import AdminDashboard from "../views/AdminDashboard";
import AdminSales from "../views/AdminSales";
import AdminSaleDetail from "../views/AdminSaleDetail";

export default function AppRouter() {
  return (
    <Routes>

      {/* ============================
          RUTAS PÚBLICAS
      ============================ */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />

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

        <Route path="/categorias" element={<Categories />} />
        <Route path="/talles" element={<SizeGuide />} />
        <Route path="/algodon" element={<CottonCare />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/medios-de-pago" element={<PaymentMethods />} />
        <Route path="/mi-cuenta" element={<MyAccount />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/cart" element={<Cart />} />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ============================
          PANEL ADMIN (AISLADO)
      ============================ */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/sales" element={<AdminSales />} />
        <Route path="/admin/sales/:id" element={<AdminSaleDetail />} />
      </Route>

    </Routes>
  );
}
