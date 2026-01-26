import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

/**
 * OrderSummary - Resumen de la orden del carrito
 * 
 * Props:
 * - compact: boolean para versión mini (drawer)
 * - onCheckout: función callback opcional al hacer checkout
 */
export default function OrderSummary({ compact = false, onCheckout }) {
  const { getCartTotal, getCartCount, cartItems } = useCart();

  const totals = getCartTotal();
  const itemCount = getCartCount();
  const isEmpty = cartItems.length === 0;

  // Versión compacta para drawer
  if (compact) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({itemCount} artículos)</span>
          <span className="font-semibold text-gray-900">
            {`$${(parseFloat(String(totals.subtotal || 0).replace('$', '').replace(',', '')) || 0).toFixed(2)}`}
          </span>
        </div>

        <div className="flex gap-2">
          <Link
            to="/cart"
            className="flex-1 text-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Ver carrito
          </Link>
          <Link
            to="/payment"
            className={`flex-1 text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors ${isEmpty
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'
                : 'bg-[#BF1919] text-white hover:bg-[#a81616]'
              }`}
          >
            Checkout
          </Link>
        </div>
      </div>
    );
  }

  // Versión completa para página de carrito
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:sticky lg:top-24">
      <h2 className="text-lg font-bold text-[#0F1111] mb-4 pb-3 border-b border-gray-200">
        Resumen del pedido
      </h2>

      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({itemCount} artículos)</span>
          <span className="font-medium text-gray-900">
            {`$${(parseFloat(String(totals.subtotal || 0).replace('$', '').replace(',', '')) || 0).toFixed(2)}`}
          </span>
        </div>

        {/* Envío */}
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1">
            <span className="text-gray-600">Envío</span>
            {/* Tooltip de info */}
            <div className="relative group">
              <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
                Envío gratis en pedidos mayores a ${totals.freeShippingThreshold}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
          <span className={`font-medium ${totals.freeShipping ? 'text-[#007600]' : 'text-gray-900'}`}>
            {totals.freeShipping ? 'GRATIS' : `$${(parseFloat(String(totals.shipping || 0).replace('$', '').replace(',', '')) || 0).toFixed(2)}`}
          </span>
        </div>

        {/* Mensaje de envío gratis */}
        {!totals.freeShipping && parseFloat(totals.subtotal) > 0 && (
          <div className="bg-[#F7F8F8] border border-gray-200 rounded-lg p-3 text-xs">
            <p className="text-gray-600">
              Añade <span className="font-bold text-[#007185]">${(totals.freeShippingThreshold - parseFloat(totals.subtotal)).toFixed(2)}</span> más para obtener envío <span className="text-[#007600] font-bold">GRATIS</span>
            </p>
            {/* Barra de progreso */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-[#007600] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((parseFloat(totals.subtotal) / totals.freeShippingThreshold) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Impuestos */}
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1">
            <span className="text-gray-600">Impuestos (IVA 15%)</span>
            <div className="relative group">
              <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
                Impuesto al Valor Agregado (Ecuador)
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
          <span className="font-medium text-gray-900">
            {`$${(parseFloat(String(totals.taxes || 0).replace('$', '').replace(',', '')) || 0).toFixed(2)}`}
          </span>
        </div>

        {/* Línea divisora */}
        <div className="border-t border-gray-200 pt-3 mt-3">
          {/* Total */}
          <div className="flex justify-between text-base font-bold">
            <span className="text-[#0F1111]">Total del pedido</span>
            <span className="text-[#B12704] text-xl">
              {`$${(parseFloat(String(totals.total || 0).replace('$', '').replace(',', '')) || 0).toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Botón de Checkout */}
      <Link
        to={isEmpty ? '#' : '/payment'}
        onClick={(e) => {
          if (isEmpty) {
            e.preventDefault();
            return;
          }
          if (onCheckout) onCheckout();
        }}
        className={`mt-6 w-full flex items-center justify-center py-3 px-4 rounded-full font-medium text-white transition-all shadow-sm ${isEmpty
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#BF1919] hover:bg-[#a81616]'
          }`}
      >
        Proceder al pago
      </Link>

      {/* Información adicional */}
      <div className="mt-4 space-y-2 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#007600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Pago 100% seguro</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#007600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Devoluciones gratis en 30 días</span>
        </div>
      </div>
    </div>
  );
}
