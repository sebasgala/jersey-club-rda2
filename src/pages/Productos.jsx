import React, { useEffect, useState } from 'react';
import { fetchProducts } from '../controllers';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const data = await fetchProducts();
        setProductos(data);
      } catch (err) {
        console.error('Error fetching productos:', err);
        setError('No se pudieron cargar los productos.');
      }
    };

    obtenerProductos();
  }, []);

  return (
    <div>
      <h1>Productos</h1>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {productos.map((producto) => (
            <div key={producto.id} style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
              <h2>{producto.name}</h2>
              <p>Precio: ${producto.price}</p>
              <p>Stock: {producto.stock}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Productos;
