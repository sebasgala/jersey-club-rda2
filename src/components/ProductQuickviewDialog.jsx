import React, { useState } from "react";

export default function ProductQuickviewDialog({ open, onOpenChange, product }) {
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  if (!open || !product) return null;

  // Tallas disponibles por defecto
  const sizes = product.sizes || [
    { name: "S", available: true },
    { name: "M", available: true },
    { name: "L", available: true },
    { name: "XL", available: true },
    { name: "XXL", available: true }
  ];

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleAddToCart = () => {
    // Aquí se implementaría la lógica para agregar al carrito
    console.log("Agregando al carrito:", {
      product,
      size: selectedSize,
      quantity
    });
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row max-h-[95vh] sm:max-h-[90vh] overflow-y-auto md:overflow-hidden">
          {/* Imagen del producto */}
          <div className="md:w-1/2 p-3 sm:p-6 bg-gray-50">
            <figure className="relative aspect-square w-full max-w-[300px] sm:max-w-none mx-auto overflow-hidden rounded-lg sm:rounded-xl bg-white">
              <img
                className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                src={product.image}
                alt={product.title}
              />
              {/* Badge de oferta */}
              {product.isOnSale && (
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                  -{product.discount}% OFF
                </div>
              )}
              {product.isBestSeller && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                  Más vendido
                </div>
              )}
            </figure>
          </div>

          {/* Información del producto */}
          <div className="md:w-1/2 p-3 sm:p-6 flex flex-col md:overflow-y-auto md:max-h-[70vh]">
            {/* Título */}
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 pr-8">
              {product.title}
            </h2>

            {/* Precio */}
            <div className="mb-4 sm:mb-6">
              {product.isOnSale ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</span>
                  </div>
                </div>
              ) : (
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</span>
              )}
              <p className="text-xs sm:text-sm text-green-600 mt-1 sm:mt-2 flex items-center gap-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                En stock - {product.stock || 10} disponibles
              </p>
            </div>

            {/* Separador */}
            <hr className="mb-4 sm:mb-6" />

            {/* Tallas */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3 flex-wrap gap-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-900">
                  Talla: <span className="font-normal text-gray-600">{selectedSize}</span>
                </h3>
                <button className="text-xs sm:text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Guía de tallas
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => size.available && setSelectedSize(size.name)}
                    disabled={!size.available}
                    className={`min-w-[40px] sm:min-w-[48px] h-8 sm:h-10 px-2 sm:px-3 rounded-lg border text-xs sm:text-sm font-medium transition-all ${!size.available
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through"
                        : selectedSize === size.name
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-900 border-gray-300 hover:border-gray-900"
                      }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Cantidad */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">Cantidad</h3>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-10 sm:w-12 text-center font-medium text-base sm:text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col gap-2 sm:gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                className="w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-[#BF1919] hover:bg-red-600 text-white font-semibold rounded-full transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Agregar al carrito
              </button>
              <button
                onClick={() => console.log("Comprar ahora:", { product, size: selectedSize, quantity })}
                className="w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-[#495A72] hover:bg-[#3b4c61] text-white font-semibold rounded-full transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Comprar ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
