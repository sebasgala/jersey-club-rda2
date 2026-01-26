import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

/**
 * CartItem - Componente individual de item del carrito
 * 
 * Props:
 * - item: objeto con id, title, price, image, quantity, selectedSize, isOnSale
 * - compact: boolean para versión mini (drawer)
 */
export default function CartItem({ item, compact = false }) {
  const { updateQuantity, removeFromCart } = useCart();

  // Parsear precio
  const parsePrice = (priceStr) => {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;
    return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
  };

  const unitPrice = parsePrice(item.price);
  const subtotal = unitPrice * item.quantity;

  // Manejar cambio de cantidad con botones
  const handleIncrease = () => {
    updateQuantity(item.id, item.quantity + 1, item.selectedSize);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1, item.selectedSize);
    } else {
      // Si la cantidad es 1, confirmar antes de eliminar
      if (window.confirm('¿Seguro que quieres eliminar este producto del carrito?')) {
        removeFromCart(item.id, item.selectedSize);
      }
    }
  };

  // Manejar eliminación
  const handleRemove = () => {
    if (window.confirm('¿Seguro que quieres eliminar este producto del carrito?')) {
      removeFromCart(item.id, item.selectedSize);
    }
  };

  // Versión compacta para drawer/mini-carrito
  if (compact) {
    return (
      <div className="flex gap-3 py-3">
        {/* Imagen */}
        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-contain p-1"
            onError={(e) => {
              e.target.src = 'https://storage.googleapis.com/imagenesjerseyclub/default.webp';
            }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">{item.title}</h4>
          <p className="text-xs text-gray-500">Talla: {item.selectedSize}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
            <span className="text-xs text-gray-500">x{item.quantity}</span>
          </div>
        </div>
      </div>
    );
  }

  // Versión completa para página de carrito
  return (
    <div className="flex flex-col sm:flex-row gap-4 py-6 border-b border-gray-200 last:border-b-0">
      {/* Imagen del producto */}
      <Link
        to={`/product/${item.id}`}
        className="w-full sm:w-32 md:w-40 aspect-square flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden group"
      >
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://storage.googleapis.com/imagenesjerseyclub/default.webp';
          }}
        />
      </Link>

      {/* Información del producto */}
      <div className="flex-1 flex flex-col sm:flex-row sm:justify-between gap-4">
        {/* Detalles */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/product/${item.id}`}
            className="text-base sm:text-lg font-medium text-[#0F1111] hover:text-[#C7511F] hover:underline transition-colors line-clamp-2"
          >
            {item.title}
          </Link>

          {/* Badge de oferta */}
          {item.isOnSale && (
            <span className="inline-block mt-2 bg-[#CC0C39] text-white text-xs font-bold px-2 py-0.5 rounded">
              EN OFERTA
            </span>
          )}

          {/* Talla */}
          <p className="mt-2 text-sm text-gray-600">
            Talla: <span className="font-medium text-gray-900">{item.selectedSize}</span>
          </p>

          {item.stock !== undefined && (
            <p className={`mt-1 text-xs font-medium ${item.quantity >= item.stock ? 'text-red-500' : 'text-gray-500'}`}>
              Disponibles: {item.stock} unidades
            </p>
          )}



          {/* Controles móviles (visible solo en móvil) */}
          <div className="flex items-center gap-4 mt-4 sm:hidden">
            {/* Selector de cantidad */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={handleDecrease}
                disabled={item.quantity <= 1}
                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Disminuir cantidad"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
              <button
                onClick={handleIncrease}
                disabled={item.stock !== undefined && item.quantity >= item.stock}
                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Aumentar cantidad"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Botón eliminar */}
            <button
              onClick={handleRemove}
              className="text-[#007185] hover:text-[#C7511F] hover:underline text-sm font-medium transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>

        {/* Precio y controles (desktop) */}
        <div className="flex flex-col items-end gap-3 min-w-[140px]">
          {/* Precio unitario y subtotal */}
          <div className="text-right">
            <p className="text-lg sm:text-xl font-bold text-[#0F1111]">
              ${subtotal.toFixed(2)}
            </p>
            {item.quantity > 1 && (
              <p className="text-sm text-gray-500">
                ${unitPrice.toFixed(2)} c/u
              </p>
            )}
          </div>

          {/* Controles desktop (ocultos en móvil) */}
          <div className="hidden sm:flex flex-col items-end gap-2">
            {/* Selector de cantidad */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={handleDecrease}
                disabled={item.quantity <= 1}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Disminuir cantidad"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-12 text-center font-medium border-x border-gray-300 py-2">{item.quantity}</span>
              <button
                onClick={handleIncrease}
                disabled={item.stock !== undefined && item.quantity >= item.stock}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Aumentar cantidad"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-3 text-sm">
              <button
                onClick={handleRemove}
                className="text-[#007185] hover:text-[#C7511F] hover:underline font-medium transition-colors"
              >
                Eliminar
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
