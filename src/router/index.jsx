// src/router/index.jsx
import { Routes, Route } from "react-router-dom";

import Layout from "../views/Layout";
import Home from "../views/Home";
import Cart from "../views/Cart";
import NotFound from "../views/NotFound";

// Vistas con nombres en inglés (slugs en español para la navbar)
import Categories from "../views/Categories";
import SizeGuide from "../views/SizeGuide";
import CottonCare from "../views/CottonCare";
import FAQ from "../views/FAQ";
import DniAccount from "../views/DniAccount";
import MyAccount from "../views/MyAccount";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        {/* Enlaces de la navbar */}
        <Route path="/categorias" element={<Categories />} />
        <Route path="/talles" element={<SizeGuide />} />
        <Route path="/algodon" element={<CottonCare />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/cuenta-dni" element={<DniAccount />} />
        <Route path="/mi-cuenta" element={<MyAccount />} />

        {/* Otros */}
        <Route path="/cart" element={<Cart />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
