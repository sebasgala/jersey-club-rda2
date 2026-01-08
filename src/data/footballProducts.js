// Auto-generated file. Do not edit manually.

/**
 * Genera un ID slug a partir del título
 */
const generateId = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

const rawProducts = [
  {
    "title": "Ac Milan 2006 Local Retro",
    "image": "/assets/images/ac-milan-2006-local-retro.webp",
    "price": "$45.00",
    "isOnSale": true
  },
  {
    "title": "Ac Milan 2006 Visitante Retro",
    "image": "/assets/images/ac-milan-2006-visitante-retro.webp",
    "price": "$45.00",
    "isOnSale": true
  },
  {
    "title": "Ac Milan 2025 Away",
    "image": "/assets/images/ac-milan-2025-away.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Ac Milan 2025 Local",
    "image": "/assets/images/ac-milan-2025-local.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Alemania 2024 Home",
    "image": "/assets/images/alemania-2024-home.webp",
    "price": "$45.00",
    "isOnSale": true
  },
  {
    "title": "Argentina 1999 Visitante Retro",
    "image": "/assets/images/argentina-1999-visitante-retro.webp",
    "price": "$45.00",
    "isOnSale": true
  },
  {
    "title": "Argentina 2005 Local Retro",
    "image": "/assets/images/argentina-2005-local-retro.webp",
    "price": "$45.00",
    "isOnSale": true
  },
  {
    "title": "Argentina 2026 Local",
    "image": "/assets/images/argentina-2026-local.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Arsenal 2025 Away",
    "image": "/assets/images/arsenal-2025-away.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Barcelona 1987 Local Retro",
    "image": "/assets/images/barcelona-1987-local-retro.webp",
    "price": "$45.00",
    "isOnSale": true
  },
  {
    "title": "Barcelona 2026 Local",
    "image": "/assets/images/barcelona-2026-local.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Bayern Munich 2026 Away",
    "image": "/assets/images/bayern-munich-2026-away.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Bayern Munich 2026 Local",
    "image": "/assets/images/bayern-munich-2026-local.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Boca Jr 1995 Local Retro",
    "image": "/assets/images/boca-jr-1995-local-retro.webp",
    "price": "$45.00",
    "isOnSale": true
  },
  {
    "title": "Borussia 2025 Home",
    "image": "/assets/images/borussia-2025-home.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Brasil 2008 Local Retro",
    "image": "/assets/images/brasil-2008-local-retro.webp",
    "price": "$45.00",
    "isOnSale": true
  },
  {
    "title": "Brasil 2009 Total 90 Retro",
    "image": "/assets/images/brasil-2009-total-90-retro.webp",
    "price": "$45.00",
    "isOnSale": true
  },
  {
    "title": "Brasil 2024 Local",
    "image": "/assets/images/brasil-2024-local.webp",
    "price": "$45.00",
    "isOnSale": true
  },
  {
    "title": "Burissia 2026 Local",
    "image": "/assets/images/burissia-2026-local.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Chelsea 2026 Local",
    "image": "/assets/images/chelsea-2026-local.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Chelseea 2025 Away",
    "image": "/assets/images/chelseea-2025-away.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Club Brujas 2025 Home",
    "image": "/assets/images/club-brujas-2025-home.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Deportivo Quiro 2025 Home Ecuador",
    "image": "/assets/images/deportivo-quiro-2025-home-ecuador.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Emelec 2025 Home Ecuador",
    "image": "/assets/images/emelec-2025-home-ecuador.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "España Home 2025",
    "image": "/assets/images/españa-home-2025.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Fc Barcelona 1999 Local Retro",
    "image": "/assets/images/fc-barcelona-1999-local-retro.webp",
    "price": "$45.00",
    "isOnSale": true
  },
  {
    "title": "Fc Barcelona 2015 Local Retro",
    "image": "/assets/images/fc-barcelona-2015-local-retro.webp",
    "price": "$45.00",
    "isOnSale": true
  },
  {
    "title": "Francia 2025 Away",
    "image": "/assets/images/francia-2025-away.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Idv 2025 Home",
    "image": "/assets/images/idv-2025-home.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Inglaterra 2025 Home",
    "image": "/assets/images/inglaterra-2025-home.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Inter Miami 2025 Local",
    "image": "/assets/images/inter-miami-2025-local.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Inter Miami Home 2025",
    "image": "/assets/images/inter-miami-home-2025.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Inter Milan 2025 Home",
    "image": "/assets/images/inter-milan-2025-home.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Japon 2025 Home",
    "image": "/assets/images/japon-2025-home.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Juventus 2025 Away",
    "image": "/assets/images/juventus-2025-away.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Juventus 2026 Local",
    "image": "/assets/images/juventus-2026-local.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Leverkusen 2026 Home",
    "image": "/assets/images/leverkusen-2026-home.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Liverpool 2026 Local",
    "image": "/assets/images/liverpool-2026-local.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Liverpool Home 2025",
    "image": "/assets/images/liverpool-home-2025.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Liyon 2025 Home",
    "image": "/assets/images/liyon-2025-home.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Manchester City 2025 Away",
    "image": "/assets/images/manchester-city-2025-away.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Manchester City 2026 Local",
    "image": "/assets/images/manchester-city-2026-local.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Manchester United 2007 Local Retro",
    "image": "/assets/images/manchester-united-2007-local-retro.webp",
    "price": "$45.00",
    "isOnSale": true
  },
  {
    "title": "Manchester United 2011 Tercera Retro",
    "image": "/assets/images/manchester-united-2011-tercera-retro.webp",
    "price": "$45.00",
    "isOnSale": true
  },
  {
    "title": "Manchester United 2025 Away",
    "image": "/assets/images/manchester-united-2025-away.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Manchester United 2026 Local",
    "image": "/assets/images/manchester-united-2026-local.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Marseille 2025 Home",
    "image": "/assets/images/marseille-2025-home.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Monaco 2025 Home",
    "image": "/assets/images/monaco-2025-home.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Napoli 2025 Away",
    "image": "/assets/images/napoli-2025-away.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Portugal 2004 Local Retro",
    "image": "/assets/images/portugal-2004-local-retro.webp",
    "price": "$45.00",
    "isOnSale": true
  },
  {
    "title": "Portugal 2025 Home",
    "image": "/assets/images/portugal-2025-home.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Psg 2026 Local",
    "image": "/assets/images/psg-2026-local.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Real Betis 2025 Home",
    "image": "/assets/images/real-betis-2025-home.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Real Madrid 2015 Tercera Retro",
    "image": "/assets/images/real-madrid-2015-tercera-retro.webp",
    "price": "$45.00",
    "isOnSale": true
  },
  {
    "title": "Real Madrid 2017 Local Retro",
    "image": "/assets/images/real-madrid-2017-local-retro.webp",
    "price": "$45.00",
    "isOnSale": true
  },
  {
    "title": "Real Madrid 2025 Local",
    "image": "/assets/images/real-madrid-2025-local.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Roma 2025 Home",
    "image": "/assets/images/roma-2025-home.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Atletico Madrid 2025",
    "image": "/assets/images/ateltico-madrid-2025.webp",
    "price": "$60.00",
    "isOnSale": false
  },
  {
    "title": "Aucas 2025 Home Ecuador",
    "image": "/assets/images/aucas-2025-home-ecuador.webp",
    "price": "$55.00",
    "isOnSale": false
  },
  {
    "title": "Barcelona Ecuador 2025 Home",
    "image": "/assets/images/barcelona-ecuador-2025-home.webp",
    "price": "$55.00",
    "isOnSale": false
  },
  {
    "title": "Colombia 2024 Third",
    "image": "/assets/images/colombia-2024-third.webp",
    "price": "$60.00",
    "isOnSale": true
  },
  {
    "title": "PSG 2025 Tercera",
    "image": "/assets/images/psg-2025-tercera-.webp",
    "price": "$60.00",
    "isOnSale": false
  }
];

// Agregar ID único a cada producto
const footballProducts = rawProducts.map(p => ({
  ...p,
  id: generateId(p.title)
}));

export default footballProducts;
