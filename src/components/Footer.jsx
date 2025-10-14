export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="foot-inner">
        <div className="foot-brand">Hello Comfy</div>
        <nav className="foot-nav">
          <a href="/productos">Productos</a>
          <a href="/nosotros">Nosotros</a>
          <a href="/contacto">Contacto</a>
          <a href="/carrito">Carrito</a>
        </nav>
        <div className="foot-copy">© {new Date().getFullYear()} Hello Comfy</div>
      </div>
    </footer>
  );
}
