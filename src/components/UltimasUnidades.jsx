import React from "react";
import { Link } from "react-router-dom";

export default function UltimasUnidades() {
  return (
    <section className="ultimas-unidades" id="ultimas-unidades">
      <div className="container">
        <div style={{ marginBottom: '40px' }}></div>
        <h2 className="section-title" style={{ color: 'black' }}>ÚLTIMAS UNIDADES</h2>
        <div className="categories-grid">
          <article className="category-card">
            <Link to="/product/medias-running-jersey-club" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src="https://storage.googleapis.com/imagenesjerseyclub/medias-running-jersey-club.webp" alt="Medias Running" className="category-image" loading="lazy" />
              <h3 className="category-name">Medias Running</h3>
              <p className="product-description">Solo quedan pocas unidades disponibles</p>
            </Link>
            <div className="category-footer"><Link to="/product/medias-running-jersey-club">Ver más</Link></div>
          </article>

          <article className="category-card">
            <Link to="/product/gorra-running-jersey-club" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src="https://storage.googleapis.com/imagenesjerseyclub/gorra-running-jersey-club.webp" alt="Gorras Jersey Club" className="category-image" loading="lazy" />
              <h3 className="category-name">Gorras Jersey Club</h3>
              <p className="product-description">Últimas tallas en stock</p>
            </Link>
            <div className="category-footer"><Link to="/product/gorra-running-jersey-club">Ver más</Link></div>
          </article>

          <article className="category-card">
            <Link to="/futbol?equipo=Barcelona" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src="https://storage.googleapis.com/imagenesjerseyclub/barcelona-2026-local.webp" alt="Fc Barcelona" className="category-image" loading="lazy" />
              <h3 className="category-name">Fc Barcelona</h3>
              <p className="product-description">Colección Fc Barcelona</p>
            </Link>
            <div className="category-footer"><Link to="/futbol?equipo=Barcelona">Ver más</Link></div>
          </article>

          <article className="category-card">
            <Link to="/formula1?equipo=McLaren&piloto=Norris" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src="https://storage.googleapis.com/imagenesjerseyclub/norris.webp" alt="Formula 1 Lando Norris" className="category-image" loading="lazy" />
              <h3 className="category-name">Formula 1 Lando Norris</h3>
              <p className="product-description">Edición especial Lando Norris</p>
            </Link>
            <div className="category-footer"><Link to="/formula1?equipo=McLaren&piloto=Norris">Ver más</Link></div>
          </article>
        </div>
        <div style={{ marginBottom: '2rem' }}></div> {/* Added extra spacing at the bottom of the section */}
      </div>
    </section>
  );
}
