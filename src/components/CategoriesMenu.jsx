import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import footballProducts from "../data/footballProducts";
import formula1Products from "../data/formula1Products";

/**
 * Normaliza un texto para comparación (quita acentos, minúsculas)
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

/**
 * Verifica si un producto pertenece a un equipo/liga/selección específica
 */
const productMatchesFilter = (product, filterValue) => {
  const normalizedFilter = normalizeText(filterValue);
  const title = normalizeText(product.title || product.nombre || '');
  const team = normalizeText(product.team || '');

  // Mapeos especiales para nombres que pueden variar
  const aliasMap = {
    'bayern munich': ['bayern', 'bayern munich'],
    'borussia dortmund': ['borussia', 'dortmund', 'borussia dortmund'],
    'bayer leverkusen': ['leverkusen', 'bayer leverkusen', 'bayer'],
    'real madrid': ['real madrid', 'real-madrid'],
    'barcelona': ['barcelona', 'barca', 'fc barcelona'],
    'atletico madrid': ['atletico', 'atletico madrid'],
    'real betis': ['betis', 'real betis'],
    'manchester united': ['manchester united', 'man utd', 'man united'],
    'manchester city': ['manchester city', 'man city'],
    'chelsea': ['chelsea'],
    'liverpool': ['liverpool'],
    'arsenal': ['arsenal'],
    'ac milan': ['ac milan', 'milan'],
    'inter milan': ['inter milan', 'inter'],
    'juventus': ['juventus', 'juve'],
    'roma': ['roma', 'as roma'],
    'napoli': ['napoli'],
    'psg': ['psg', 'paris', 'paris saint-germain'],
    'monaco': ['monaco', 'as monaco'],
    'marseille': ['marseille', 'olympique marseille'],
    'lyon': ['lyon', 'liyon', 'olympique lyonnais'],
    'independiente del valle': ['idv', 'independiente', 'independiente del valle'],
    'liga de quito': ['liga de quito', 'ldu', 'liga'],
    'barcelona sc': ['barcelona ecuador', 'barcelona sc'],
    'emelec': ['emelec'],
    'aucas': ['aucas'],
    'deportivo quito': ['deportivo quito', 'deportivo quiro'],
    'ecuador': ['ecuador', 'tri', 'la tri'],
    'brasil': ['brasil', 'brazil'],
    'colombia': ['colombia'],
    'españa': ['espana', 'spain', 'españa'],
    'alemania': ['alemania', 'germany', 'deutschland'],
    'argentina': ['argentina'],
    'portugal': ['portugal'],
    'inglaterra': ['inglaterra', 'england'],
    'francia': ['francia', 'france'],
    // F1 Teams
    'mclaren': ['mclaren', 'mclared'],
    'mercedes': ['mercedes', 'amg'],
    'red bull racing': ['red bull', 'redbull'],
    'red bull': ['red bull', 'redbull', 'verstappen'],
    'ferrari': ['ferrari', 'leclerc', 'hamilton ferrari'],
    'williams': ['williams'],
    'aston martin': ['aston martin', 'aston'],
    'alpine': ['alpine'],
    'haas': ['haas'],
    'rb': ['rb f1', 'visa cash app', 'rb'],
    'sauber': ['sauber']
  };

  const aliases = aliasMap[normalizedFilter] || [normalizedFilter];

  return aliases.some(alias => title.includes(alias) || team.includes(alias));
};

/**
 * Definición de la estructura de categorías con sus subcategorías
 */
const categoryStructure = {
  futbol: {
    name: "Fútbol",
    sections: [
      {
        title: "Alemania - Bundesliga",
        link: "/futbol?liga=Bundesliga",
        items: [
          { name: "Bayern Munich", filter: "Bayern Munich", link: "/futbol?equipo=Bayern Munich" },
          { name: "Borussia Dortmund", filter: "Borussia Dortmund", link: "/futbol?equipo=Borussia Dortmund" },
          { name: "Bayer Leverkusen", filter: "Bayer Leverkusen", link: "/futbol?equipo=Bayer Leverkusen" }
        ]
      },
      {
        title: "España - La Liga",
        link: "/futbol?liga=La Liga",
        items: [
          { name: "Real Madrid", filter: "Real Madrid", link: "/futbol?equipo=Real Madrid" },
          { name: "Barcelona", filter: "Barcelona", link: "/futbol?equipo=Barcelona" },
          { name: "Atlético Madrid", filter: "Atletico Madrid", link: "/futbol?equipo=Atlético Madrid" },
          { name: "Real Betis", filter: "Real Betis", link: "/futbol?equipo=Real Betis" }
        ]
      },
      {
        title: "Inglaterra - Premier League",
        link: "/futbol?liga=Premier League",
        items: [
          { name: "Manchester United", filter: "Manchester United", link: "/futbol?equipo=Manchester United" },
          { name: "Manchester City", filter: "Manchester City", link: "/futbol?equipo=Manchester City" },
          { name: "Chelsea", filter: "Chelsea", link: "/futbol?equipo=Chelsea" },
          { name: "Liverpool", filter: "Liverpool", link: "/futbol?equipo=Liverpool" },
          { name: "Arsenal", filter: "Arsenal", link: "/futbol?equipo=Arsenal" }
        ]
      },
      {
        title: "Italia - Serie A",
        link: "/futbol?liga=Serie A",
        items: [
          { name: "AC Milan", filter: "AC Milan", link: "/futbol?equipo=AC Milan" },
          { name: "Inter Milan", filter: "Inter Milan", link: "/futbol?equipo=Inter Milan" },
          { name: "Juventus", filter: "Juventus", link: "/futbol?equipo=Juventus" },
          { name: "Roma", filter: "Roma", link: "/futbol?equipo=Roma" },
          { name: "Napoli", filter: "Napoli", link: "/futbol?equipo=Napoli" }
        ]
      },
      {
        title: "Francia - Ligue 1",
        link: "/futbol?liga=Ligue 1",
        items: [
          { name: "Paris Saint-Germain (PSG)", filter: "PSG", link: "/futbol?equipo=PSG" },
          { name: "AS Monaco", filter: "Monaco", link: "/futbol?equipo=Monaco" },
          { name: "Olympique Marseille", filter: "Marseille", link: "/futbol?equipo=Marseille" },
          { name: "Olympique Lyonnais", filter: "Lyon", link: "/futbol?equipo=Lyon" }
        ]
      },
      {
        title: "Ecuador - Liga Pro",
        link: "/futbol?liga=Liga Pro",
        items: [
          { name: "Independiente del Valle (IDV)", filter: "Independiente del Valle", link: "/futbol?equipo=Independiente del Valle" },
          { name: "Liga de Quito", filter: "Liga de Quito", link: "/futbol?equipo=Liga de Quito" },
          { name: "Barcelona SC", filter: "Barcelona SC", link: "/futbol?equipo=Barcelona SC" },
          { name: "Emelec", filter: "Emelec", link: "/futbol?equipo=Emelec" },
          { name: "Aucas", filter: "Aucas", link: "/futbol?equipo=Aucas" },
          { name: "Deportivo Quito", filter: "Deportivo Quito", link: "/futbol?equipo=Deportivo Quito" }
        ]
      },
      {
        title: "Selecciones Nacionales",
        link: "/futbol?categoria=Selecciones",
        items: [
          { name: "Ecuador", filter: "Ecuador", link: "/futbol?seleccion=Ecuador" },
          { name: "Brasil", filter: "Brasil", link: "/futbol?seleccion=Brasil" },
          { name: "Colombia", filter: "Colombia", link: "/futbol?seleccion=Colombia" },
          { name: "España", filter: "España", link: "/futbol?seleccion=España" },
          { name: "Alemania", filter: "Alemania", link: "/futbol?seleccion=Alemania" },
          { name: "Argentina", filter: "Argentina", link: "/futbol?seleccion=Argentina" },
          { name: "Portugal", filter: "Portugal", link: "/futbol?seleccion=Portugal" },
          { name: "Inglaterra", filter: "Inglaterra", link: "/futbol?seleccion=Inglaterra" },
          { name: "Francia", filter: "Francia", link: "/futbol?seleccion=Francia" }
        ]
      }
    ]
  },
  formula1: {
    name: "Fórmula 1",
    sections: [
      {
        title: "Equipos F1",
        link: "/formula1",
        items: [
          { name: "McLaren", filter: "McLaren", link: "/formula1?equipo=McLaren" },
          { name: "Mercedes", filter: "Mercedes", link: "/formula1?equipo=Mercedes" },
          { name: "Red Bull Racing", filter: "Red Bull Racing", link: "/formula1?equipo=Red Bull Racing" },
          { name: "Ferrari", filter: "Ferrari", link: "/formula1?equipo=Ferrari" },
          { name: "Williams", filter: "Williams", link: "/formula1?equipo=Williams" },
          { name: "Aston Martin", filter: "Aston Martin", link: "/formula1?equipo=Aston Martin" },
          { name: "Alpine", filter: "Alpine", link: "/formula1?equipo=Alpine" },
          { name: "Haas", filter: "Haas", link: "/formula1?equipo=Haas" },
          { name: "RB (Visa Cash App)", filter: "RB", link: "/formula1?equipo=RB" },
          { name: "Sauber", filter: "Sauber", link: "/formula1?equipo=Sauber" }
        ]
      }
    ]
  },
  jerseyclub: {
    name: "Jersey Club Brand",
    sections: [
      {
        title: "Toda la Colección",
        link: "/jersey-club-brand",
        items: [
          { name: "Ver todos los productos", filter: null, link: "/jersey-club-brand", alwaysShow: true }
        ]
      },
      {
        title: "Ropa Deportiva",
        link: null,
        items: [
          { name: "Camisetas", filter: "camiseta", link: "/jersey-club-brand?tipo=camisetas", alwaysShow: true },
          { name: "Buzos de Compresión", filter: "buzo", link: "/jersey-club-brand?tipo=buzos", alwaysShow: true },
          { name: "Pantalonetas", filter: "pantaloneta", link: "/jersey-club-brand?tipo=pantalonetas", alwaysShow: true }
        ]
      },
      {
        title: "Para Él",
        link: "/jersey-club-brand?categoria=hombre",
        items: [
          { name: "Camiseta Deportiva Hombre", filter: "camiseta deportiva hombre", link: "/jersey-club-brand?buscar=camiseta+deportiva+hombre", alwaysShow: true },
          { name: "Buzo Compresión Hombre", filter: "buzo compresion hombre", link: "/jersey-club-brand?buscar=buzo+compresion+hombre", alwaysShow: true },
          { name: "Pantaloneta Deportiva Hombre", filter: "pantaloneta deportiva hombre", link: "/jersey-club-brand?buscar=pantaloneta+deportiva+hombre", alwaysShow: true },
          { name: "Pantaloneta Running Hombre", filter: "pantaloneta running hombre", link: "/jersey-club-brand?buscar=pantaloneta+running+hombre", alwaysShow: true }
        ]
      },
      {
        title: "Para Ella",
        link: "/jersey-club-brand?categoria=mujer",
        items: [
          { name: "Camiseta Deportiva Mujer", filter: "camiseta deportiva mujer", link: "/jersey-club-brand?buscar=camiseta+deportiva+mujer", alwaysShow: true }
        ]
      }
    ]
  },
  ofertas: {
    name: "🎉 Ofertas",
    sections: [
      {
        title: "Todas las Ofertas",
        link: null,
        items: [
          { name: "Ver todas las ofertas", filter: null, link: "/ofertas", alwaysShow: true }
        ]
      },
      {
        title: "Por Categoría",
        link: null,
        items: [
          { name: "⚽ Ofertas de Fútbol", filter: null, link: "/ofertas?categoria=Fútbol", alwaysShow: true },
          { name: "🏎️ Ofertas de Fórmula 1", filter: null, link: "/ofertas?categoria=Fórmula", alwaysShow: true }
        ]
      }
    ]
  }
};

function CategoriesMenu({ isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [backendProducts, setBackendProducts] = useState([]);

  // Cargar productos del backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || '/api'}/productos`);
        const result = await response.json();
        if (result.success || result.status === 'success') {
          setBackendProducts(result.data || []);
        }
      } catch (error) {
        console.warn("No se pudieron cargar productos del backend para el menú");
      }
    };
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  // Combinar todos los productos disponibles
  const allProducts = useMemo(() => {
    return [...footballProducts, ...formula1Products, ...backendProducts];
  }, [backendProducts]);

  // Función para verificar si hay productos para un filtro específico
  const hasProductsForFilter = (filter) => {
    if (!filter) return true;
    return allProducts.some(product => productMatchesFilter(product, filter));
  };

  // Filtrar las secciones y sus items basándose en productos disponibles
  const getFilteredSections = (categoryKey) => {
    const category = categoryStructure[categoryKey];
    if (!category) return [];

    return category.sections
      .map(section => {
        // Filtrar items que tienen productos
        const filteredItems = section.items.filter(item =>
          item.alwaysShow || hasProductsForFilter(item.filter)
        );

        // Solo incluir la sección si tiene al menos un item
        if (filteredItems.length === 0) return null;

        return {
          ...section,
          items: filteredItems
        };
      })
      .filter(section => section !== null);
  };

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

            {/* Jersey Club Brand */}
            <div className="menu-category">
              <button
                className={`menu-category-title ${activeCategory === 'jerseyclub' ? 'active' : ''}`}
                onClick={() => toggleCategory('jerseyclub')}
                type="button"
              >
                <span>Jersey Club Brand</span>
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

          {/* Panel de contenido dinámico */}
          {activeCategory && (
            <div className="menu-category-content">
              {getFilteredSections(activeCategory).map((section, sectionIdx) => (
                <div className="menu-section" key={sectionIdx}>
                  <h4>
                    {section.link ? (
                      <Link to={section.link} onClick={onClose}>{section.title}</Link>
                    ) : (
                      section.title
                    )}
                  </h4>
                  <ul className={activeCategory === 'formula1' ? 'menu-teams' : ''}>
                    {section.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <Link to={item.link} onClick={onClose}>
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default CategoriesMenu;
