// src/components/ProductGrid.jsx
import ProductCard from "./ProductCard";
import "../styles/productgrid.css";

export default function ProductGrid({ products }) {
  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
