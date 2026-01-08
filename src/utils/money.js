/**
 * =====================================================
 * UTILIDADES DE FORMATO DE MONEDA
 * =====================================================
 */

/**
 * Formatear número a moneda USD
 * @param {number | string} value 
 * @returns {string}
 */
export const formatCurrency = (value) => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

/**
 * Parsear string de precio a número
 * @param {string | number} priceStr 
 * @returns {number}
 */
export const parsePrice = (priceStr) => {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
};

/**
 * Formatear número con separadores de miles
 * @param {number} num 
 * @returns {string}
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

export default {
  formatCurrency,
  parsePrice,
  formatNumber
};
