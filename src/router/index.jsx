import { Routes, Route } from "react-router-dom";
import Layout from "../views/Layout";
import Home from "../views/Home";
import Products from "../views/Products";
import About from "../views/About";
import Contact from "../views/Contact";
import NotFound from "../views/NotFound";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="productos" element={<Products />} />
        <Route path="nosotros" element={<About />} />
        <Route path="contacto" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
