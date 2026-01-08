import React, { useState } from "react";
import { Link } from 'react-router-dom';

export default function ProductModal({ isOpen, onClose, onOpenSizeGuide }) {
  const [selectedSize, setSelectedSize] = useState("M");

  if (!isOpen) return null;

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="product-modal-header">
          <div className="product-modal-header-left">
            <button type="button" className="product-modal-back" onClick={onClose} title="Volver">
              <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
            </button>
            <span className="product-modal-header-title">Vista rápida del producto</span>
          </div>
          <button type="button" className="product-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="product-modal-content">
          <div className="product-modal-images">
            <div className="product-modal-main-image">
              <img src="/assets/images/real-madrid-2025-local.webp" alt="Producto" />
            </div>
            <div className="product-modal-thumbnails">
              <div className="product-modal-thumbnail active">
                <img src="/assets/images/real-madrid-2025-local.webp" alt="Thumbnail 1" />
              </div>
              <div className="product-modal-thumbnail">
                <img src="/assets/images/real-madrid-2025-local.webp" alt="Thumbnail 2" />
              </div>
            </div>
            <div className="product-modal-actions">
              <button className="product-modal-btn product-modal-btn-primary">
                <i className="fas fa-cart-plus"></i> Agregar al carrito
              </button>
              <button className="product-modal-btn product-modal-btn-secondary" style={{backgroundColor: '#495A72', borderColor: '#495A72'}}>
                <i className="fas fa-bolt"></i> Comprar ahora
              </button>
            </div>
          </div>
          <div className="product-modal-info">
            <Link to="#" className="product-modal-brand">Jersey Club EC</Link>
            <h1 className="product-modal-title">Real Madrid 2025 Local</h1>
            <div className="product-modal-rating">
              <span className="product-modal-rating-value">4.5</span>
              <div className="product-modal-stars">
                <i className="fa fa-star"></i>
                <i className="fa fa-star"></i>
                <i className="fa fa-star"></i>
                <i className="fa fa-star"></i>
                <i className="fa fa-star-half-alt"></i>
              </div>
              <span className="product-modal-reviews">256 valoraciones</span>
            </div>
            
            <div className="product-modal-separator"></div>
            
            <div className="product-modal-price-section">
              <div className="product-modal-price-row">
                <span className="product-modal-discount">-25%</span>
                <p className="product-modal-price"><span className="price-symbol">$</span>67<span className="price-cents">49</span></p>
              </div>
              <span className="product-modal-original-price">Precio anterior: $89.99</span>
              <p className="product-modal-stock">En stock</p>
              <p className="product-modal-delivery"><strong>Envío GRATIS</strong> en pedidos mayores a $50</p>
            </div>
            
            <div className="product-modal-separator"></div>
            
            <div className="product-modal-description">
              <p>Camiseta oficial del Real Madrid para la temporada 2024/25. Diseño elegante con tecnología de última generación para máxima comodidad.</p>
            </div>
            
            <div className="product-modal-sizes">
              <div className="size-header">
                <h3>Talla: <span>{selectedSize}</span></h3>
                <button 
                  type="button"
                  className="size-guide-link" 
                  onClick={(e) => { e.preventDefault(); onOpenSizeGuide(); }}
                >
                  <i className="fas fa-ruler"></i> Guía de tallas
                </button>
              </div>
              <div className="size-options">
                {["S", "M", "L", "XL", "XXL"].map((size) => (
                  <div 
                    key={size}
                    className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="product-modal-features">
              <h3>Acerca de este artículo</h3>
              <ul>
                <li>Material: 100% Poliéster premium</li>
                <li>Tecnología Dri-FIT para máxima transpirabilidad</li>
                <li>Diseño oficial con licencia</li>
                <li>Corte ergonómico para mayor comodidad</li>
                <li>Lavable a máquina</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
