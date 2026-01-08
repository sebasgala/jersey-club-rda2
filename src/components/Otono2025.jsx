import React from "react";
import { Link } from "react-router-dom";

export default function Otono2025() {
  return (
    <section className="otono-2025" id="otono-2025">
      <div className="container">
        <div style={{ marginBottom: '40px' }}></div>
        <h2 className="section-title" style={{ color: 'black' }}>OTOÑO 2025</h2>
        <div className="categories-grid">
          <article className="category-card">
            <Link to="/futbol?filter=temporada2025" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src="/assets/images/real-madrid-2025-local.webp" alt="Colección Otoño" className="category-image" loading="lazy" />
              <h3 className="category-name">Colección Otoño</h3>
              <p className="product-description">Nueva temporada con diseños exclusivos</p>
            </Link>
            <div className="category-footer"><Link to="/futbol?filter=temporada2025">Ver más</Link></div>
          </article>

          <article className="category-card">
            <Link to="/formula1?filter=temporada2025" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src="/assets/images/red-bull-racing-2025.webp" alt="F1 Otoño" className="category-image" loading="lazy" />
              <h3 className="category-name">F1 Otoño</h3>
              <p className="product-description">Jerseys de temporada con nuevos colores</p>
            </Link>
            <div className="category-footer"><Link to="/formula1?filter=temporada2025">Ver más</Link></div>
          </article>

          <article className="category-card">
            <Link to="/jersey-club-brand?filter=temporada2025" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src="/assets/images/camiseta-deportiva-hombre-jersey-club.webp" alt="Tendencias Otoño" className="category-image" loading="lazy" />
              <h3 className="category-name">Tendencias Otoño</h3>
              <p className="product-description">Lo último en moda deportiva para otoño</p>
            </Link>
            <div className="category-footer"><Link to="/jersey-club-brand?filter=temporada2025">Ver más</Link></div>
          </article>

          <article className="category-card">
            <Link to="/futbol?tipo=retro" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src="/assets/images/real-madrid-2015-tercera-retro.webp" alt="Retro Otoño" className="category-image" loading="lazy" />
              <h3 className="category-name">Retro Otoño</h3>
              <p className="product-description">Clásicos reimaginados para la nueva temporada</p>
            </Link>
            <div className="category-footer"><Link to="/futbol?tipo=retro">Ver más</Link></div>
          </article>
        </div>
      </div>
    </section>
  );
}
