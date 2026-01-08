import React from "react";
import { Link } from "react-router-dom";

export default function CategoryNavRow() {
  return (
    <section className="category-nav-row">
      <div className="category-nav-container">
        <Link to="/futbol" className="category-nav-item">
          <span>Fútbol</span>
        </Link>
        <Link to="/formula1" className="category-nav-item">
          <span>Fórmula 1</span>
        </Link>
        <Link to="/jersey-club-brand" className="category-nav-item">
          <span>Jersey Club Brand</span>
        </Link>
        <Link to="/ofertas" className="category-nav-item">
          <span>Más Ofertas</span>
        </Link>
      </div>
    </section>
  );
}
