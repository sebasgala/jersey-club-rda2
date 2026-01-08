import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import OrderSummary from '../components/OrderSummary';

/**
 * =====================================================
 * PÁGINA DE CARRITO - ESTILO AMAZON
 * =====================================================
 * 
 * Layout:
 * - Desktop (lg+): 2 columnas (lista + resumen sticky)
 * - Mobile: 1 columna con resumen al final
 * 
 * Funcionalidades:
 * - Lista de productos con controles de cantidad
 * - Resumen de orden con subtotal, envío, impuestos, total
 * - Estado vacío con CTA
 * - Estado de carga
 * - Responsive completo
 */
export default function Cart() {
  const { cartItems, isLoading, clearCart, getCartCount, getCartTotal } = useCart();
  
  const itemCount = getCartCount();
  const isEmpty = cartItems.length === 0;
  const totals = getCartTotal();

  // Estado de carga
  if (isLoading) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-[#BF1919] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  // Estado vacío
  if (isEmpty) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] bg-gray-50 py-8 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 text-center">
            {/* Icono de carrito vacío */}
            <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 text-gray-300">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F1111] mb-3">
              Tu carrito está vacío
            </h1>
            
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Parece que aún no has añadido ningún producto. Explora nuestra colección y encuentra tu jersey favorito.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/futbol"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#BF1919] hover:bg-[#a81616] text-white font-medium rounded-full transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Ver jerseys de fútbol
              </Link>
              
              <Link
                to="/formula1"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#495A72] hover:bg-[#3d4d61] text-white font-medium rounded-full transition-colors shadow-sm"
              >
                Ver Fórmula 1
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Carrito con productos
  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F1111]">
              Carrito de compras
            </h1>
            <p className="text-gray-600 mt-1">
              {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'} en tu carrito
            </p>
          </div>
          
          {/* Botón vaciar carrito */}
          <button
            onClick={() => {
              if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
                clearCart();
              }
            }}
            className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline font-medium transition-colors self-start sm:self-auto"
          >
            Vaciar carrito
          </button>
        </div>

        {/* Layout principal: 2 columnas en desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Columna izquierda: Lista de productos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              {/* Header de la lista */}
              <div className="hidden sm:flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
                <span className="text-sm text-gray-500">Producto</span>
                <span className="text-sm text-gray-500">Precio</span>
              </div>
              
              {/* Lista de items */}
              <div className="divide-y divide-gray-200">
                {cartItems.map((item, index) => (
                  <CartItem 
                    key={`${item.id}-${item.selectedSize}-${index}`} 
                    item={item} 
                  />
                ))}
              </div>
              
              {/* Footer con subtotal móvil */}
              <div className="sm:hidden mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-base font-bold">
                  <span>Subtotal:</span>
                  <span className="text-[#B12704]">${totals.subtotal}</span>
                </div>
              </div>
            </div>
            
            {/* Seguir comprando */}
            <div className="mt-6 flex items-center gap-4">
              <Link
                to="/futbol"
                className="inline-flex items-center text-[#007185] hover:text-[#C7511F] hover:underline text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Seguir comprando
              </Link>
            </div>
          </div>

          {/* Columna derecha: Resumen de orden (sticky en desktop) */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
        
        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F0F9FF] rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#007185]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm text-[#0F1111]">Envío rápido</p>
              <p className="text-xs text-gray-500">Entrega en 3-5 días hábiles</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F0FDF4] rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#007600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm text-[#0F1111]">Pago seguro</p>
              <p className="text-xs text-gray-500">Transacciones encriptadas</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FEF3C7] rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#D97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm text-[#0F1111]">Devoluciones gratis</p>
              <p className="text-xs text-gray-500">30 días para devoluciones</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
