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

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

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
    </Routes>
  );
}
