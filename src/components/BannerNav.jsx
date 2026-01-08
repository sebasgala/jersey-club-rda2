import React from "react";
import { Link } from "react-router-dom";

export default function BannerNav() {
  return (
    <nav className="banner-nav">
      <div className="banner-nav-container">
        <Link to="#" className="banner-nav-item">Envíos</Link>
        <Link to="#" className="banner-nav-item">Pagos</Link>
        <Link to="#" className="banner-nav-item">Cambios</Link>
      </div>
    </nav>
  );
}
