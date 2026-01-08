import React from 'react';

const FutbolCategories = () => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Categorías</h3>
      <ul className="space-y-2">
        <li>
          <button className="text-blue-500 hover:underline">La Liga</button>
        </li>
        <li>
          <button className="text-blue-500 hover:underline">Premier League</button>
        </li>
        <li>
          <button className="text-blue-500 hover:underline">Serie A</button>
        </li>
        <li>
          <button className="text-blue-500 hover:underline">Bundesliga</button>
        </li>
        <li>
          <button className="text-blue-500 hover:underline">Ligue 1</button>
        </li>
      </ul>
    </div>
  );
};

export default FutbolCategories;