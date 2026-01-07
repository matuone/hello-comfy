// src/views/Category.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";
import "../styles/product-card.css";

export default function Category() {
  const { subcategory } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Normalizar para mostrar el título
  const formatTitle = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).replace("-", " ");

  useEffect(() => {
    setLoading(true);

    fetch(`http://localhost:5000/api/products/subcategory/${subcategory}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data); // ← YA NO filtramos por section
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando productos:", err);
        setLoading(false);
      });
  }, [subcategory]);

  return (
    <section className="category-view">
      <h1 className="category-title">{formatTitle(subcategory)}</h1>

      {/* Loader */}
      {loading && <p className="category-loading">Cargando productos...</p>}

      {/* Grid */}
      {!loading && <ProductGrid products={products} />}

      {/* Vacío */}
      {!loading && products.length === 0 && (
        <p className="category-empty">
          No hay productos en <strong>{formatTitle(subcategory)}</strong>.
        </p>
      )}
    </section>
  );
}
