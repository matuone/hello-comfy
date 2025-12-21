// src/components/OpinionsPopup.jsx
import "../styles/opinionspopup.css";
import { useState } from "react";

// Ejemplo de opiniones (luego se pueden traer de la base de datos)
const OPINIONS = [
  {
    id: 1,
    avatar: "/src/assets/avatar/avatar.png",
    name: "Juan",
    text: "Muy buena calidad, me encantó la tela y el diseño.",
  },
  {
    id: 2,
    avatar: "/src/assets/avatar/avatar.png",
    name: "María",
    text: "El talle me quedó perfecto, volvería a comprar.",
  },
  {
    id: 3,
    avatar: "/src/assets/avatar/avatar.png",
    name: "Pedro",
    text: "Llegó rápido y la atención fue excelente.",
  },
];

export default function OpinionsPopup(props) {
  const [index, setIndex] = useState(0);

  function prev() {
    if (index === 0) {
      setIndex(OPINIONS.length - 1);
    } else {
      setIndex(index - 1);
    }
  }

  function next() {
    if (index === OPINIONS.length - 1) {
      setIndex(0);
    } else {
      setIndex(index + 1);
    }
  }

  const current = OPINIONS[index];

  return (
    <div className="opinions-overlay" onClick={props.onClose}>
      <div className="opinions-popup" onClick={function (e) { e.stopPropagation(); }}>
        <h2 className="opinions-title">Reviews ⭐⭐⭐⭐⭐ </h2>

        <div className="opinions-carousel">
          <button className="opinions-arrow left" onClick={prev}>
            ‹
          </button>

          <div className="opinions-item">
            <img
              src={current.avatar}
              alt={current.name}
              className="opinions-avatar"
            />
            <p className="opinions-text">"{current.text}"</p>
            <span className="opinions-name">- {current.name}</span>
          </div>

          <button className="opinions-arrow right" onClick={next}>
            ›
          </button>
        </div>

        <button className="opinions-close" onClick={props.onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
