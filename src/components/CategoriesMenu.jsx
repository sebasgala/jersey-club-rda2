import React, { useState } from "react";
import { Link } from "react-router-dom";

function CategoriesMenu({ isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState(null);

  if (!isOpen) return null;

  const toggleCategory = (category) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  return (
    <div className="categories-menu-overlay" onClick={onClose}>
      <div className="categories-menu-container" onClick={(e) => e.stopPropagation()}>
        <div className="categories-menu-header">
          <h2>Categorías</h2>
          <button type="button" className="categories-menu-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="categories-menu-wrapper">
          <div className="categories-menu-content">
            
            {/* Fútbol */}
            <div className="menu-category">
              <button
                className={`menu-category-title ${activeCategory === 'futbol' ? 'active' : ''}`}
                onClick={() => toggleCategory('futbol')}
                type="button"
              >
                <span>Fútbol</span>
                <span className="menu-arrow">›</span>
              </button>
            </div>

            {/* Fórmula 1 */}
            <div className="menu-category">
              <button
                className={`menu-category-title ${activeCategory === 'formula1' ? 'active' : ''}`}
                onClick={() => toggleCategory('formula1')}
                type="button"
              >
                <span>Fórmula 1</span>
                <span className="menu-arrow">›</span>
              </button>
            </div>

            {/* Ropa de Marca */}
            <div className="menu-category">
              <button
                className={`menu-category-title ${activeCategory === 'ropa' ? 'active' : ''}`}
                onClick={() => toggleCategory('ropa')}
                type="button"
              >
                <span>Ropa de Marca</span>
                <span className="menu-arrow">›</span>
              </button>
            </div>

            {/* Ofertas */}
            <div className="menu-category">
              <button
                className={`menu-category-title ${activeCategory === 'ofertas' ? 'active' : ''}`}
                onClick={() => toggleCategory('ofertas')}
                type="button"
              >
                <span>🎉 Ofertas</span>
                <span className="menu-arrow">›</span>
              </button>
            </div>

          </div>

          {/* Panel de contenido de categoría */}
          {activeCategory === 'futbol' && (
            <div className="menu-category-content">
              <div className="menu-section">
                <h4><Link to="/futbol?liga=Bundesliga" onClick={onClose}>Alemania - Bundesliga</Link></h4>
                <ul>
                  <li><Link to="/futbol?equipo=Bayern Munich" onClick={onClose}>Bayern Munich</Link></li>
                  <li><Link to="/futbol?equipo=Borussia Dortmund" onClick={onClose}>Borussia Dortmund</Link></li>
                  <li><Link to="/futbol?equipo=Bayer Leverkusen" onClick={onClose}>Bayer Leverkusen</Link></li>
                </ul>
              </div>
              <div className="menu-section">
                <h4><Link to="/futbol?liga=La Liga" onClick={onClose}>España - La Liga</Link></h4>
                <ul>
                  <li><Link to="/futbol?equipo=Real Madrid" onClick={onClose}>Real Madrid</Link></li>
                  <li><Link to="/futbol?equipo=Barcelona" onClick={onClose}>Barcelona</Link></li>
                  <li><Link to="/futbol?equipo=Atlético Madrid" onClick={onClose}>Atlético Madrid</Link></li>
                  <li><Link to="/futbol?equipo=Real Betis" onClick={onClose}>Real Betis</Link></li>
                </ul>
              </div>
              <div className="menu-section">
                <h4><Link to="/futbol?liga=Premier League" onClick={onClose}>Inglaterra - Premier League</Link></h4>
                <ul>
                  <li><Link to="/futbol?equipo=Manchester United" onClick={onClose}>Manchester United</Link></li>
                  <li><Link to="/futbol?equipo=Manchester City" onClick={onClose}>Manchester City</Link></li>
                  <li><Link to="/futbol?equipo=Chelsea" onClick={onClose}>Chelsea</Link></li>
                  <li><Link to="/futbol?equipo=Liverpool" onClick={onClose}>Liverpool</Link></li>
                  <li><Link to="/futbol?equipo=Arsenal" onClick={onClose}>Arsenal</Link></li>
                </ul>
              </div>
              <div className="menu-section">
                <h4><Link to="/futbol?liga=Serie A" onClick={onClose}>Italia - Serie A</Link></h4>
                <ul>
                  <li><Link to="/futbol?equipo=AC Milan" onClick={onClose}>AC Milan</Link></li>
                  <li><Link to="/futbol?equipo=Inter Milan" onClick={onClose}>Inter Milan</Link></li>
                  <li><Link to="/futbol?equipo=Juventus" onClick={onClose}>Juventus</Link></li>
                  <li><Link to="/futbol?equipo=Roma" onClick={onClose}>Roma</Link></li>
                  <li><Link to="/futbol?equipo=Napoli" onClick={onClose}>Napoli</Link></li>
                </ul>
              </div>
              <div className="menu-section">
                <h4><Link to="/futbol?liga=Ligue 1" onClick={onClose}>Francia - Ligue 1</Link></h4>
                <ul>
                  <li><Link to="/futbol?equipo=PSG" onClick={onClose}>Paris Saint-Germain (PSG)</Link></li>
                  <li><Link to="/futbol?equipo=Monaco" onClick={onClose}>AS Monaco</Link></li>
                  <li><Link to="/futbol?equipo=Marseille" onClick={onClose}>Olympique Marseille</Link></li>
                  <li><Link to="/futbol?equipo=Lyon" onClick={onClose}>Olympique Lyonnais</Link></li>
                </ul>
              </div>
              <div className="menu-section">
                <h4><Link to="/futbol?liga=Liga Pro" onClick={onClose}>Ecuador - Liga Pro</Link></h4>
                <ul>
                  <li><Link to="/futbol?equipo=Independiente del Valle" onClick={onClose}>Independiente del Valle (IDV)</Link></li>
                  <li><Link to="/futbol?equipo=Liga de Quito" onClick={onClose}>Liga de Quito</Link></li>
                  <li><Link to="/futbol?equipo=Barcelona SC" onClick={onClose}>Barcelona SC</Link></li>
                  <li><Link to="/futbol?equipo=Emelec" onClick={onClose}>Emelec</Link></li>
                  <li><Link to="/futbol?equipo=Aucas" onClick={onClose}>Aucas</Link></li>
                  <li><Link to="/futbol?equipo=Deportivo Quito" onClick={onClose}>Deportivo Quito</Link></li>
                </ul>
              </div>
              <div className="menu-section">
                <h4><Link to="/futbol?categoria=Selecciones" onClick={onClose}>Selecciones Nacionales</Link></h4>
                <ul>
                  <li><Link to="/futbol?seleccion=Ecuador" onClick={onClose}>Ecuador</Link></li>
                  <li><Link to="/futbol?seleccion=Brasil" onClick={onClose}>Brasil</Link></li>
                  <li><Link to="/futbol?seleccion=Colombia" onClick={onClose}>Colombia</Link></li>
                  <li><Link to="/futbol?seleccion=España" onClick={onClose}>España</Link></li>
                  <li><Link to="/futbol?seleccion=Alemania" onClick={onClose}>Alemania</Link></li>
                  <li><Link to="/futbol?seleccion=Argentina" onClick={onClose}>Argentina</Link></li>
                  <li><Link to="/futbol?seleccion=Portugal" onClick={onClose}>Portugal</Link></li>
                  <li><Link to="/futbol?seleccion=Inglaterra" onClick={onClose}>Inglaterra</Link></li>
                  <li><Link to="/futbol?seleccion=Francia" onClick={onClose}>Francia</Link></li>
                </ul>
              </div>
            </div>
          )}

          {activeCategory === 'formula1' && (
            <div className="menu-category-content">
              <div className="menu-section">
                <h4>Equipos F1</h4>
                <ul className="menu-teams">
                  <li><Link to="/formula1?equipo=McLaren" onClick={onClose}>McLaren</Link></li>
                  <li><Link to="/formula1?equipo=Mercedes" onClick={onClose}>Mercedes</Link></li>
                  <li><Link to="/formula1?equipo=Red Bull Racing" onClick={onClose}>Red Bull Racing</Link></li>
                  <li><Link to="/formula1?equipo=Ferrari" onClick={onClose}>Ferrari</Link></li>
                  <li><Link to="/formula1?equipo=Williams" onClick={onClose}>Williams</Link></li>
                  <li><Link to="/formula1?equipo=Aston Martin" onClick={onClose}>Aston Martin</Link></li>
                  <li><Link to="/formula1?equipo=Alpine" onClick={onClose}>Alpine</Link></li>
                  <li><Link to="/formula1?equipo=Haas" onClick={onClose}>Haas</Link></li>
                  <li><Link to="/formula1?equipo=RB" onClick={onClose}>RB (Visa Cash App)</Link></li>
                  <li><Link to="/formula1?equipo=Sauber" onClick={onClose}>Sauber</Link></li>
                </ul>
              </div>
            </div>
          )}

          {activeCategory === 'ropa' && (
            <div className="menu-category-content">
              <div className="menu-section">
                <h4><Link to="/jersey-club-brand" onClick={onClose}>Jersey Club Brand</Link></h4>
                <ul className="menu-items">
                  <li><Link to="/jersey-club-brand" onClick={onClose}>Ver toda la colección</Link></li>
                  <li><Link to="/jersey-club-brand?tipo=camisetas" onClick={onClose}>Camisetas</Link></li>
                  <li><Link to="/jersey-club-brand?tipo=accesorios" onClick={onClose}>Accesorios</Link></li>
                </ul>
              </div>
              <div className="menu-section">
                <h4>Categorías</h4>
                <ul className="menu-items">
                  <li><Link to="/jersey-club-brand?categoria=hombre" onClick={onClose}>Hombre</Link></li>
                  <li><Link to="/jersey-club-brand?categoria=mujer" onClick={onClose}>Mujer</Link></li>
                  <li><Link to="/jersey-club-brand?categoria=ninos" onClick={onClose}>Niños</Link></li>
                </ul>
              </div>
              <div className="menu-section">
                <h4>Novedades</h4>
                <ul className="menu-items">
                  <li><Link to="/jersey-club-brand?nuevo=true" onClick={onClose}>Nuevos Lanzamientos</Link></li>
                  <li><Link to="/jersey-club-brand?destacado=true" onClick={onClose}>Más Vendidos</Link></li>
                </ul>
              </div>
            </div>
          )}

          {activeCategory === 'ofertas' && (
            <div className="menu-category-content">
              <div className="menu-section">
                <h4>Todas las Ofertas</h4>
                <ul className="menu-items">
                  <li><Link to="/ofertas" onClick={onClose}>Ver todas las ofertas</Link></li>
                </ul>
              </div>
              <div className="menu-section">
                <h4>Por Categoría</h4>
                <ul className="menu-items">
                  <li><Link to="/ofertas?categoria=Fútbol" onClick={onClose}>⚽ Ofertas de Fútbol</Link></li>
                  <li><Link to="/ofertas?categoria=Fórmula" onClick={onClose}>🏎️ Ofertas de Fórmula 1</Link></li>
                </ul>
              </div>
              <div className="menu-section">
                <h4>Equipos Destacados</h4>
                <ul className="menu-items">
                  <li><Link to="/ofertas?equipo=Real Madrid" onClick={onClose}>Real Madrid</Link></li>
                  <li><Link to="/ofertas?equipo=Barcelona" onClick={onClose}>Barcelona</Link></li>
                  <li><Link to="/ofertas?equipo=Manchester" onClick={onClose}>Manchester</Link></li>
                  <li><Link to="/ofertas?equipo=Ferrari" onClick={onClose}>Ferrari</Link></li>
                </ul>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default CategoriesMenu;
