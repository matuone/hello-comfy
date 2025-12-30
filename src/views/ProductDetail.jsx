import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import BabyTeesTable from "../components/sizeTables/BabyTeesTable";
import CropTopsTable from "../components/sizeTables/CropTopsTable";
import RemerasTable from "../components/sizeTables/RemerasTable";

import "../styles/productdetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProducto(data);
        setSelectedImage(data.images?.[0] || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="loading">Cargando producto...</p>;
  if (!producto) return <p className="error">Producto no encontrado.</p>;

  return (
    <div className="product-detail">

      {/* ============================
          IMÁGENES
      ============================ */}
      <div className="product-images">
        <img
          src={selectedImage}
          alt={producto.name}
          className="product-main-img"
        />

        <div className="product-thumbs">
          {producto.images?.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              className="product-thumb"
              onClick={() => setSelectedImage(img)}
            />
          ))}
        </div>
      </div>

      {/* ============================
          INFORMACIÓN
      ============================ */}
      <div className="product-info">
        <h1 className="product-title">{producto.name}</h1>

        <p className="product-price">
          ${producto.price?.toLocaleString("es-AR")}
        </p>

        <p className="product-description">{producto.description}</p>

        {/* ============================
            TALLES DISPONIBLES
        ============================ */}
        <div className="product-sizes">
          <h3>Talles disponibles</h3>
          <div className="sizes-row">
            {producto.sizes?.map((talle) => (
              <button key={talle} className="size-btn">
                {talle}
              </button>
            ))}
          </div>
        </div>

        {/* ============================
            GUÍA DE TALLES
        ============================ */}
        <div className="product-size-guide">
          <h3>Guía de talles</h3>

          {producto.sizeGuide === "babytees" && <BabyTeesTable />}
          {producto.sizeGuide === "croptops" && <CropTopsTable />}
          {producto.sizeGuide === "remeras" && <RemerasTable />}
        </div>

        {/* ============================
            BOTONES
        ============================ */}
        <div className="product-actions">
          <button className="btn-buy">Comprar ahora</button>
          <button className="btn-cart">Agregar al carrito</button>
        </div>
      </div>
    </div>
  );
}
