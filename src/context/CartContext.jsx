import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Crear el contexto
const CartContext = createContext();

// Clave para localStorage
const CART_STORAGE_KEY = 'jersey-club-cart';

// Configuración de costos
const CART_CONFIG = {
  freeShippingThreshold: 50, // Envío gratis si subtotal > $50
  shippingCost: 5.00,        // Costo de envío si no aplica gratis
  taxRate: 0.15,             // 15% de impuestos (Ecuador IVA)
};

/**
 * CartProvider - Proveedor del contexto del carrito
 * 
 * Funcionalidades:
 * - addToCart: Agregar producto al carrito
 * - removeFromCart: Eliminar producto del carrito
 * - updateQuantity: Actualizar cantidad de un producto
 * - clearCart: Vaciar el carrito
 * - getCartTotal: Obtener totales (subtotal, envío, impuestos, total)
 * - getCartCount: Obtener cantidad total de items
 */
export function CartProvider({ children }) {
  // Estado del carrito
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch (error) {
      console.warn('Error cargando carrito desde localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (error) {
        console.warn('Error guardando carrito en localStorage:', error);
      }
    }
  }, [cartItems, isLoading]);

  /**
   * Agregar producto al carrito
   * Si el producto ya existe (mismo id + size), incrementa cantidad
   */
  const addToCart = useCallback((product, quantity = 1, selectedSize = 'M') => {
    if (!product || !product.id) {
      console.warn('Producto inválido para agregar al carrito');
      return false;
    }

    const stockAvailable = product.stock || 0;
    let allowed = true;

    setCartItems(prevItems => {
      // Buscar si ya existe el item con mismo id y talla
      const existingIndex = prevItems.findIndex(
        item => item.id === product.id && item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const currentQty = prevItems[existingIndex].quantity;
        if (currentQty + quantity > stockAvailable) {
          alert(`Lo sentimos, solo hay ${stockAvailable} unidades disponibles de este producto. Ya tienes ${currentQty} en el carrito.`);
          allowed = false;
          return prevItems;
        }

        // Actualizar cantidad del item existente
        const updatedItems = [...prevItems];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: currentQty + quantity,
          stock: stockAvailable // Actualizar stock por si acaso
        };
        return updatedItems;
      }

      if (quantity > stockAvailable) {
        alert(`Lo sentimos, solo hay ${stockAvailable} unidades disponibles de este producto.`);
        allowed = false;
        return prevItems;
      }

      // Agregar nuevo item
      const newItem = {
        id: product.id,
        title: product.title || product.name || 'Producto sin nombre',
        price: product.price,
        image: product.image || product.imageSrc || 'https://storage.googleapis.com/imagenesjerseyclub/gs://imagenesjerseyclub/default.webp',
        quantity,
        selectedSize,
        stock: stockAvailable,
        isOnSale: product.isOnSale || false,
        originalPrice: product.originalPrice || null,
        category: product.category || 'general',
        addedAt: Date.now()
      };

      return [...prevItems, newItem];
    });

    return allowed;
  }, []);

  /**
   * Eliminar producto del carrito
   */
  const removeFromCart = useCallback((productId, selectedSize = null) => {
    setCartItems(prevItems => {
      if (selectedSize) {
        // Eliminar item específico por id y talla
        return prevItems.filter(
          item => !(item.id === productId && item.selectedSize === selectedSize)
        );
      }
      // Eliminar todos los items con ese id
      return prevItems.filter(item => item.id !== productId);
    });
  }, []);

  /**
   * Actualizar cantidad de un producto
   * No permite cantidad menor a 1
   */
  const updateQuantity = useCallback((productId, newQuantity, selectedSize = null) => {
    if (newQuantity < 1) return;

    setCartItems(prevItems => {
      return prevItems.map(item => {
        const matchesId = item.id === productId;
        const matchesSize = selectedSize ? item.selectedSize === selectedSize : true;

        if (matchesId && matchesSize) {
          const stockLimit = item.stock || 999;
          if (newQuantity > stockLimit) {
            alert(`Solo hay ${stockLimit} unidades disponibles.`);
            return { ...item, quantity: stockLimit };
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  }, []);

  /**
   * Vaciar el carrito completamente
   */
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  /**
   * Parsear precio string a número
   */
  const parsePrice = (priceStr) => {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;
    return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
  };

  /**
   * Calcular totales del carrito
   */
  const getCartTotal = useCallback(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = parsePrice(item.price);
      return sum + (price * item.quantity);
    }, 0);

    const shipping = subtotal >= CART_CONFIG.freeShippingThreshold ? 0 : CART_CONFIG.shippingCost;
    const taxes = subtotal * CART_CONFIG.taxRate;
    const total = subtotal + shipping + taxes;

    return {
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      taxes: taxes.toFixed(2),
      total: total.toFixed(2),
      freeShipping: subtotal >= CART_CONFIG.freeShippingThreshold,
      freeShippingThreshold: CART_CONFIG.freeShippingThreshold
    };
  }, [cartItems]);

  /**
   * Obtener cantidad total de items en el carrito
   */
  const getCartCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  /**
   * Verificar si un producto está en el carrito
   */
  const isInCart = useCallback((productId, selectedSize = null) => {
    if (selectedSize) {
      return cartItems.some(
        item => item.id === productId && item.selectedSize === selectedSize
      );
    }
    return cartItems.some(item => item.id === productId);
  }, [cartItems]);

  // Valor del contexto
  const value = {
    // Estado
    cartItems,
    isLoading,
    isCartOpen,
    setIsCartOpen,

    // Acciones
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,

    // Getters
    getCartTotal,
    getCartCount,
    isInCart,

    // Configuración
    config: CART_CONFIG
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook personalizado para usar el carrito
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
}

export default CartContext;
