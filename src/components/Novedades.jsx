import React from "react";
import { Link } from "react-router-dom";

export default function Novedades() {
  return (
    <section className="novedades" id="novedades">
      <div className="container">
        <h2 className="section-title">NOVEDADES</h2>
        <div className="categories-grid">
          <article className="category-card">
            <Link to="/futbol?temporada=2025" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src="https://storage.googleapis.com/imagenesjerseyclub/manchester-city-2026-local.webp" alt="Temporada 2025" className="category-image" loading="lazy" />
              <h3 className="category-name">Temporada 2025</h3>
              <p className="product-description">Las últimas camisetas de la temporada</p>
            </Link>
            <div className="category-footer"><Link to="/futbol?temporada=2025">Ver más</Link></div>
          </article>

          <article className="category-card">
            <Link to="/formula1?filter=edicionlimitada" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src="https://storage.googleapis.com/imagenesjerseyclub/ferrari-f1-team-2025.webp" alt="Edición Limitada F1" className="category-image" loading="lazy" />
              <h3 className="category-name">Edición Limitada F1</h3>
              <p className="product-description">Colección exclusiva de Fórmula 1</p>
            </Link>
            <div className="category-footer"><Link to="/formula1?filter=edicionlimitada">Ver más</Link></div>
          </article>

          <article className="category-card">
            <Link to="/jersey-club-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src="https://storage.googleapis.com/imagenesjerseyclub/buzo-compresion-hombre-jersey-club.webp" alt="Colección Exclusiva" className="category-image" loading="lazy" />
              <h3 className="category-name">Colección Exclusiva</h3>
              <p className="product-description">Diseños únicos Jersey Club</p>
            </Link>
            <div className="category-footer"><Link to="/jersey-club-brand">Ver más</Link></div>
          </article>

          <article className="category-card">
            <Link to="/product/portugal-2004-local-retro" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src="https://storage.googleapis.com/imagenesjerseyclub/portugal-2004-local-retro.webp" alt="Portugal 2004 Local RETRO" className="category-image" loading="lazy" />
              <h3 className="category-name">Portugal 2004 Local RETRO</h3>
              <p className="product-description">Revive las épocas doradas del fútbol con esta camiseta retro</p>
            </Link>
            <div className="category-footer"><Link to="/product/portugal-2004-local-retro">Ver más</Link></div>
          </article>
        </div>
      </div>
    </section>
  );
}
