// src/views/Category.jsx
import { useParams } from "react-router-dom";
import products from "../data/products.json";
import ProductGrid from "../components/ProductGrid";
import "../styles/product-card.css";


export default function Category({ section }) {
  const { subcategory } = useParams();

  const filteredProducts = products.filter(
    (p) =>
      p.section?.toLowerCase() === section.toLowerCase() &&
      p.subcategory?.toLowerCase() === subcategory.toLowerCase()
  );

  const formatTitle = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).replace("-", " ");

  return (
    <section className="category-view">
      <h1 className="category-title">{formatTitle(subcategory)}</h1>

      <ProductGrid products={filteredProducts} />

      {filteredProducts.length === 0 && (
        <p className="category-empty">
          No hay productos en <strong>{formatTitle(subcategory)}</strong>.
        </p>
      )}
    </section>
  );
}
