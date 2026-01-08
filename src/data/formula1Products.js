// Productos de Fórmula 1

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
    "title": "McLaren F1 Lando Norris Campeón 2025",
    "image": "/assets/images/formula-1-norris.webp",
    "price": "$95.00",
    "isOnSale": false,
    "team": "McLaren",
    "driver": "Lando Norris",
    "season": "2025",
    "type": "Jersey",
    "isChampion": true
  },
  {
    "title": "McLaren F1 Racing Team 2025",
    "image": "/assets/images/mclared-f1-racing.webp",
    "price": "$85.00",
    "isOnSale": false,
    "team": "McLaren",
    "driver": "Lando Norris",
    "season": "2025",
    "type": "Jersey"
  },
  {
    "title": "Ferrari F1 Team 2025",
    "image": "/assets/images/ferrari-f1-team-2025.webp",
    "price": "$85.00",
    "isOnSale": false,
    "team": "Ferrari",
    "driver": "Charles Leclerc",
    "season": "2025",
    "type": "Jersey"
  },
  {
    "title": "Lewis Hamilton Ferrari 2025",
    "image": "/assets/images/lewis-hamilton-ferrari-2025.webp",
    "price": "$90.00",
    "isOnSale": false,
    "team": "Ferrari",
    "driver": "Lewis Hamilton",
    "season": "2025",
    "type": "Jersey"
  },
  {
    "title": "Charles Leclerc Monaco GP",
    "image": "/assets/images/charles-leclerc-monaco-gp.webp",
    "price": "$95.00",
    "isOnSale": true,
    "team": "Ferrari",
    "driver": "Charles Leclerc",
    "season": "2025",
    "type": "Jersey"
  },
  {
    "title": "Red Bull Racing 2025",
    "image": "/assets/images/red-bull-racing-2025.webp",
    "price": "$85.00",
    "isOnSale": false,
    "team": "Red Bull",
    "driver": "Max Verstappen",
    "season": "2025",
    "type": "Jersey"
  },
  {
    "title": "Max Verstappen 2025 Special Edition",
    "image": "/assets/images/max-verstappen-2025-special.webp",
    "price": "$90.00",
    "isOnSale": true,
    "team": "Red Bull",
    "driver": "Max Verstappen",
    "season": "2025",
    "type": "Jersey"
  },
  {
    "title": "Mercedes AMG Petronas",
    "image": "/assets/images/camiseta-mercedes-amg.webp",
    "price": "$80.00",
    "isOnSale": false,
    "team": "Mercedes",
    "driver": "George Russell",
    "season": "2025",
    "type": "Jersey"
  },
  {
    "title": "Alpine F1 Team 2025",
    "image": "/assets/images/alpine-f1-2025.webp",
    "price": "$75.00",
    "isOnSale": true,
    "team": "Alpine",
    "driver": "Pierre Gasly",
    "season": "2025",
    "type": "Jersey"
  },
  {
    "title": "Aston Martin F1 Team Polo 2024",
    "image": "/assets/images/polo-aston-martin-f1-team-2024.webp",
    "price": "$70.00",
    "isOnSale": false,
    "team": "Aston Martin",
    "driver": "Fernando Alonso",
    "season": "2024",
    "type": "Jersey"
  },
  {
    "title": "Williams Racing 2025",
    "image": "/assets/images/williams-racing-2025.webp",
    "price": "$65.00",
    "isOnSale": false,
    "team": "Williams",
    "driver": "Alex Albon",
    "season": "2025",
    "type": "Jersey"
  },
  {
    "title": "Haas F1 Team 2025",
    "image": "/assets/images/haas-f1-team-2025.webp",
    "price": "$60.00",
    "isOnSale": true,
    "team": "Haas",
    "driver": "Kevin Magnussen",
    "season": "2025",
    "type": "Jersey"
  },
  {
    "title": "RB F1 Team 2025 (Visa Cash App)",
    "image": "/assets/images/rb-f1-team-2025.webp",
    "price": "$65.00",
    "isOnSale": false,
    "team": "RB",
    "driver": "Yuki Tsunoda",
    "season": "2025",
    "type": "Jersey"
  },
  {
    "title": "Sauber F1 Team 2025",
    "image": "/assets/images/sauber-f1-2025.webp",
    "price": "$60.00",
    "isOnSale": true,
    "team": "Sauber",
    "driver": "Valtteri Bottas",
    "season": "2025",
    "type": "Jersey"
  }
];

// Agregar ID único a cada producto
const formula1Products = rawProducts.map(p => ({
  ...p,
  id: generateId(p.title)
}));

export default formula1Products;
