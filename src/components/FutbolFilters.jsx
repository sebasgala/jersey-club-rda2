import React from 'react';

const FutbolFilters = () => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Filtros</h3>
      <div className="mb-4">
        <h4 className="text-md font-medium">Ordenar por</h4>
        <label className="block mt-2">
          <input type="radio" name="sort" value="vendidos" className="mr-2" />
          Más vendidos
        </label>
        <label className="block mt-2">
          <input type="radio" name="sort" value="precio-asc" className="mr-2" />
          Precio: menor a mayor
        </label>
        <label className="block mt-2">
          <input type="radio" name="sort" value="precio-desc" className="mr-2" />
          Precio: mayor a menor
        </label>
      </div>
      <div className="mb-4">
        <h4 className="text-md font-medium">Ligas</h4>
        <label className="block mt-2">
          <input type="checkbox" name="league" value="La Liga" className="mr-2" />
          La Liga
        </label>
        <label className="block mt-2">
          <input type="checkbox" name="league" value="Premier League" className="mr-2" />
          Premier League
        </label>
        <label className="block mt-2">
          <input type="checkbox" name="league" value="Serie A" className="mr-2" />
          Serie A
        </label>
      </div>
    </div>
  );
};

export default FutbolFilters;