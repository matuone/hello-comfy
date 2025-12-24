import "../styles/products.css";
import testImage from "../assets/productos/imagen-test.png"; // 👈 IMPORTACIÓN CORRECTA

export default function Products() {
  // Generamos 18 productos usando la misma imagen
  const products = Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    name: `Producto ${i + 1}`,
    price: `$${(8000 + i * 500).toLocaleString("es-AR")}`,
    img: testImage, // 👈 AHORA FUNCIONA
  }));

  return (
    <div className="products">
      <h1 className="products__title">Nuestros Productos</h1>
      <p className="products__subtitle">
        Todo lo que necesitás para una vida más comfy 🧸✨
      </p>

      <div className="products__grid">
        {products.map((p) => (
          <div key={p.id} className="products__card">
            <div className="products__imgbox">
              <img src={p.img} alt={p.name} className="products__img" />
            </div>

            <h3 className="products__name">{p.name}</h3>
            <p className="products__price">{p.price}</p>

            <button className="products__btn">Ver más</button>
          </div>
        ))}
      </div>
    </div>
  );
}
