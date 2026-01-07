// src/views/Category.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/productgrid.css";
import "../styles/products.css"; // usa el mismo estilo que Products.jsx
import "../styles/category-filters.css";

export default function Category() {
  const { subcategory } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");

  const formatTitle = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).replace("-", " ");

  useEffect(() => {
    setLoading(true);

    fetch(`http://localhost:5000/api/products/subcategory/${subcategory}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando productos:", err);
        setLoading(false);
      });
  }, [subcategory]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === "price_desc") return b.price - a.price;
    if (sort === "price_asc") return a.price - b.price;
    if (sort === "sold_desc") return (b.sold || 0) - (a.sold || 0);
    return 0;
  });

  return (
    <section className="category-view">
      <h1 className="category-title">{formatTitle(subcategory)}</h1>

      {/* FILTRO */}
      {!loading && products.length > 0 && (
        <div className="category-filters">
          <label className="category-sort-label">Ordenar por:</label>

          <select
            className="category-sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Nuevo</option>
            <option value="price_desc">Mayor precio</option>
            <option value="price_asc">Menor precio</option>
            <option value="sold_desc">Más vendido</option>
          </select>
        </div>
      )}

      {/* LOADING */}
      {loading && <p className="category-loading">Cargando productos...</p>}

      {/* GRID */}
      {!loading && (
        <div className="products__grid">
          {sortedProducts.map((p) => (
            <div
              key={p._id}
              className="productcard__item"
              onClick={() => navigate(`/products/${p._id}`)}
            >
              <img
                src={p.images?.[0] || "https://via.placeholder.com/300"}
                alt={p.name}
                className="productcard__image"
              />

              {p.featured && (
                <span className="productcard__badge">Destacado</span>
              )}

              <div className="productcard__top">
                <h3 className="productcard__name">{p.name}</h3>

                <p className="productcard__price">
                  ${p.price?.toLocaleString("es-AR")}
                </p>

                <p className="productcard__desc">
                  {p.description?.slice(0, 80) || "Producto destacado"}
                </p>
              </div>

              <div
                className="productcard__stars"
                onClick={(e) => e.stopPropagation()}
              >
                {"★".repeat(5)}
              </div>

              <div
                className="productcard__buttons"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="productcard__btn-buy">Comprar</button>

                <button
                  className="productcard__btn-cart"
                  onClick={() => console.log("Agregar al carrito", p._id)}
                >
                  Agregar al carrito
                </button>
              </div>

              <button
                className="productcard__btn-viewmore"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/products/${p._id}`);
                }}
              >
                Ver más
              </button>
            </div>
          ))}

          {sortedProducts.length === 0 && (
            <p className="category-empty">
              No hay productos en <strong>{formatTitle(subcategory)}</strong>.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
