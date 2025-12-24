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
import AdminBanners from "../views/AdminBanners";
import AdminProducts from "../views/AdminProducts";
import AdminCategories from "../views/AdminCategories";
import AdminOrders from "../views/AdminOrders";
import AdminCustomers from "../views/AdminCustomers"; // 👈 NUEVO

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>

        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* TODOS LOS PRODUCTOS */}
        <Route path="/products" element={<Products />} />

        {/* CATEGORÍAS */}
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

        {/* OTRAS SECCIONES */}
        <Route path="/categorias" element={<Categories />} />
        <Route path="/talles" element={<SizeGuide />} />
        <Route path="/algodon" element={<CottonCare />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/medios-de-pago" element={<PaymentMethods />} />
        <Route path="/mi-cuenta" element={<MyAccount />} />
        <Route path="/create-account" element={<CreateAccount />} />

        {/* ADMIN */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />

        {/* SECCIONES DEL PANEL ADMIN */}
        <Route path="/admin/banners" element={<AdminBanners />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/customers" element={<AdminCustomers />} /> {/* 👈 NUEVO */}

        {/* CARRITO */}
        <Route path="/cart" element={<Cart />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Route>
    </Routes>
  );
}
