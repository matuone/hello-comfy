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

// Admin (pantalla de login y panel)
import AdminLogin from "../views/AdminLogin";
import AdminPanel from "../views/AdminPanel";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* TODOS LOS PRODUCTOS */}
        <Route path="/products" element={<Products />} />

        {/* CATEGORÍAS (con section pasado como prop) */}
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

        {/* CARRITO */}
        <Route path="/cart" element={<Cart />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
