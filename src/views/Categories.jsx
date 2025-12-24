// src/views/Categories.jsx
import { Link } from "react-router-dom";
import products from "../data/products.json";
import "../styles/categories.css";

export default function Categories() {
  // Agrupar productos por sección
  const sections = {};

  products.forEach((p) => {
    if (!sections[p.section]) {
      sections[p.section] = new Set();
    }
    sections[p.section].add(p.subcategory);
  });

  // Formatear títulos
  const format = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).replace("-", " ");

  return (
    <section className="categories-view">
      <h2 className="categories-title">Categorías</h2>

      <div className="categories-grid">
        {Object.entries(sections).map(([section, subcats]) => (
          <div key={section} className="category-card">
            <h3>{format(section)}</h3>

            <ul className="subcategory-list">
              {[...subcats].map((sub) => (
                <li key={sub}>
                  <Link to={`/${section}/${sub}`} className="subcategory-link">
                    {format(sub)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
