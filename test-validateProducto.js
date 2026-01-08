import validateProducto from './server/middleware/validateProducto.js';

const testCases = [
  { body: {}, description: 'Case 1: Empty body' },
  { body: { nombre: 'Coca', precio: 1 }, description: 'Case 2: Valid data' },
  { body: { nombre: 'Coca', precio: 0 }, description: 'Case 3: Invalid price' },
  { body: { nombre: 'Coca', precio: 2, stock: -1 }, description: 'Case 4: Invalid stock' },
];

testCases.forEach((req, index) => {
  const res = {};
  const next = (err) => {
    if (err) {
      console.error(`${testCases[index].description}:`, err.message, err.status);
    } else {
      console.log(`${testCases[index].description}: Success`);
    }
  };
  console.log(`Running ${testCases[index].description}`);
  validateProducto(req, res, next);
});