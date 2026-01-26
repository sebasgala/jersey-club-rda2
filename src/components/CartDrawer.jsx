import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from './CartItem';
import OrderSummary from './OrderSummary';

/**
 * CartDrawer - Mini carrito lateral tipo Amazon
 * 
 * Se abre/cierra desde el Navbar u otros componentes
 * Muestra preview del carrito con acceso rápido a checkout
 */
export default function CartDrawer({ isOpen, onClose }) {
  const { cartItems, getCartCount, getCartTotal } = useCart();

  const itemCount = getCartCount();
  const totals = getCartTotal();
  const isEmpty = cartItems.length === 0;

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id="cart-drawer-title" className="text-lg font-bold text-[#0F1111]">
            Carrito de compras
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar carrito"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-64px)]">
          {/* Lista de productos o estado vacío */}
          {isEmpty ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 text-gray-300 mb-4">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
              <Link
                to="/futbol"
                onClick={onClose}
                className="text-[#007185] hover:text-[#C7511F] hover:underline font-medium"
              >
                Ver productos
              </Link>
            </div>
          ) : (
            <>
              {/* Lista de items */}
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-sm text-gray-500 mb-3">
                  {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
                </p>
                <div className="divide-y divide-gray-200">
                  {cartItems.slice(0, 5).map((item, index) => (
                    <CartItem
                      key={`${item.id}-${item.selectedSize}-${index}`}
                      item={item}
                      compact
                    />
                  ))}
                </div>
                {cartItems.length > 5 && (
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    y {cartItems.length - 5} artículo(s) más...
                  </p>
                )}
              </div>

              {/* Resumen y botones */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex justify-between mb-4">
                  <span className="font-medium text-gray-700">Subtotal</span>
                  <span className="font-bold text-[#B12704]">
                    {`$${(parseFloat(String(totals.subtotal || 0).replace('$', '').replace(',', '')) || 0).toFixed(2)}`}
                  </span>
                </div>

                {totals.freeShipping ? (
                  <p className="text-sm text-[#007600] font-medium mb-4">
                    ✓ Envío GRATIS aplicado
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mb-4">
                    Añade ${(totals.freeShippingThreshold - parseFloat(totals.subtotal)).toFixed(2)} más para envío gratis
                  </p>
                )}

                <div className="space-y-2">
                  <Link
                    to="/cart"
                    onClick={onClose}
                    className="block w-full text-center py-2.5 px-4 border border-gray-300 rounded-full font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Ver carrito
                  </Link>
                  <Link
                    to="/payment"
                    onClick={onClose}
                    className="block w-full text-center py-2.5 px-4 bg-[#BF1919] hover:bg-[#a81616] rounded-full font-medium text-white transition-colors"
                  >
                    Proceder al pago
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
