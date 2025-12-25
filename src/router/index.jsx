// src/router/index.jsx
import { Routes, Route } from "react-router-dom";

import Layout from "../views/Layout";
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
import AdminLogin from "../views/AdminLogin";
import AdminPanel from "../views/AdminPanel";
import AdminOrders from "../views/AdminOrders";
import AdminProducts from "../views/AdminProducts";
import AdminBanners from "../views/AdminBanners";
import AdminCategories from "../views/AdminCategories";
import AdminCustomers from "../views/AdminCustomers";
import AdminCustomerDetail from "../views/AdminCustomerDetail"; // 👈 IMPORTANTE
import AdminStock from "../views/AdminStock";

export default function AppRouter() {
  return (
    <Routes>

      {/* RUTAS PÚBLICAS */}
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

        {/* 404 PÚBLICO */}
        <Route path="*" element={<NotFound />} />

      </Route>

      {/* LOGIN ADMIN (fuera del layout público) */}
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* PANEL ADMIN (fuera del layout público) */}
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="/admin/products" element={<AdminProducts />} />
      <Route path="/admin/stock" element={<AdminStock />} />
      <Route path="/admin/banners" element={<AdminBanners />} />
      <Route path="/admin/categories" element={<AdminCategories />} />
      <Route path="/admin/customers" element={<AdminCustomers />} />

      {/* DETALLE DE CLIENTE (NUEVO) */}
      <Route path="/admin/customers/:id" element={<AdminCustomerDetail />} />

    </Routes>
  );
}
