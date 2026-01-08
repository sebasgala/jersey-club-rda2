import React from "react";
import { Link } from "react-router-dom";

export default function FeaturedCategories() {
  return (
    <section className="highlight" id="products">
      <div className="container">
        <h2 className="section-title font-heading text-4xl md:text-5xl">LO MÁS VENDIDO</h2>
        <div className="categories-grid">
          <article className="category-card">
            <Link to="/futbol?tipo=retro" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src="/assets/images/real-madrid-2017-local-retro.webp" alt="Camisetas Retro" className="category-image" loading="lazy" />
              <h3 className="category-name">Camisetas Retro</h3>
              <p className="product-description">Camisetas clásicas de épocas doradas</p>
            </Link>
            <div className="category-footer"><Link to="/futbol?tipo=retro">Ver más</Link></div>
          </article>

          <article className="category-card">
            <Link to="/futbol?liga=Premier%20League" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src="/assets/images/premier-league.webp" alt="Premier League" className="category-image" loading="lazy" />
              <h3 className="category-name">Premier League</h3>
              <p className="product-description">Las mejores camisetas de la liga inglesa</p>
            </Link>
            <div className="category-footer"><Link to="/futbol?liga=Premier%20League">Ver más</Link></div>
          </article>

          <article className="category-card">
            <Link to="/futbol?liga=Selecciones" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src="/assets/images/selecciones.webp" alt="Selecciones" className="category-image" loading="lazy" />
              <h3 className="category-name">Selecciones</h3>
              <p className="product-description">Camisetas de selecciones nacionales</p>
            </Link>
            <div className="category-footer"><Link to="/futbol?liga=Selecciones">Ver más</Link></div>
          </article>

          <article className="category-card">
            <Link to="/product/fb-argentina-2026-local" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src="/assets/images/argentina-2026-local.webp" alt="Argentina 2026" className="category-image" loading="lazy" />
              <h3 className="category-name">Argentina 2026</h3>
              <p className="product-description">Colección especial Mundial 2026</p>
            </Link>
            <div className="category-footer"><Link to="/product/fb-argentina-2026-local">Ver detalles</Link></div>
          </article>
        </div>
      </div>
    </section>
  );
}
