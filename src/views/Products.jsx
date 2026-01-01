import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/products.css";

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColors, setSelectedColors] = useState({}); // color por tarjeta

  // ============================
  // FETCH DE PRODUCTOS
  // ============================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error al obtener productos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ============================
  // MANEJAR SELECCIÓN DE COLOR
  // ============================
  const handleColorSelect = (productId, color) => {
    setSelectedColors((prev) => ({
      ...prev,
      [productId]: color,
    }));
  };

  if (loading) {
    return <div className="products-loading">Cargando productos...</div>;
  }

  return (
    <div className="products-container">
      <h1 className="products-title">Productos</h1>

      <div className="products-grid">
        {products.map((product) => {
          const selectedColor = selectedColors[product._id];

          return (
            <div
              key={product._id}
              className="product-card"
              onClick={() => navigate(`/products/${product._id}`)}
            >
              {/* IMAGEN */}
              <img
                src={product.images?.[0] || "https://via.placeholder.com/300"}
                alt={product.name}
                className="product-img"
              />

              {/* NOMBRE */}
              <h3 className="product-name">{product.name}</h3>

              {/* PRECIO */}
              <p className="product-price">
                ${product.price.toLocaleString("es-AR")}
              </p>

              {/* COLORES */}
              {product.colors?.length > 0 && (
                <div
                  className="product-colors"
                  onClick={(e) => e.stopPropagation()} // evita navegar al hacer click en color
                >
                  {product.colors.map((color) => (
                    <div
                      key={color}
                      className={`color-dot ${selectedColor === color ? "selected" : ""
                        }`}
                      style={{ backgroundColor: color.toLowerCase() }}
                      onClick={() => handleColorSelect(product._id, color)}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
