import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getCurrentUser } from '../utils/auth';
import { createOrder } from '../controllers';

/**
 * =====================================================
 * PÁGINA DE PAGO - ESTILO AMAZON
 * =====================================================
 * 
 * Características:
 * - Layout 2 columnas (formularios + resumen)
 * - Formulario completo de datos y pago
 * - Validación en tiempo real
 * - Conexión con carrito real
 * - Generación de factura PDF
 * - 100% responsivo
 */

// ==================== VALIDACIONES ====================

const validateRequired = (value, fieldName) => {
  if (!value || !value.trim()) return `${fieldName} es requerido`;
  return '';
};

const validateEmail = (email) => {
  if (!email) return 'El email es requerido';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Email inválido';
  return '';
};

const validatePhone = (phone) => {
  if (!phone) return 'El teléfono es requerido';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 9) return 'El teléfono debe tener al menos 9 dígitos';
  return '';
};

// Validación de ciudad: solo letras, espacios y acentos
const validateCity = (city) => {
  if (!city || !city.trim()) return 'La ciudad es requerida';
  const cityRegex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/;
  if (!cityRegex.test(city)) return 'Ciudad inválida (solo letras)';
  if (city.trim().length < 3) return 'Ciudad demasiado corta';
  return '';
};

// Validación de dirección: letras, números, espacios y caracteres comunes
const validateAddress = (address) => {
  if (!address || !address.trim()) return 'La dirección es requerida';
  const addressRegex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s.,#\-]+$/;
  if (!addressRegex.test(address)) return 'Dirección inválida';
  if (address.trim().length < 5) return 'Dirección demasiado corta';
  return '';
};

// Validación de código postal: máximo 6 números, sin letras
const validatePostalCode = (postalCode) => {
  if (!postalCode) return 'Código postal requerido';
  if (!/^\d+$/.test(postalCode)) return 'Solo números permitidos';
  if (postalCode.length > 6) return 'Máximo 6 dígitos';
  if (postalCode.length < 4) return 'Mínimo 4 dígitos';
  return '';
};

const validateCardNumber = (cardNumber) => {
  if (!cardNumber) return 'Número de tarjeta requerido';
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d+$/.test(cleaned)) return 'Solo números permitidos';
  if (cleaned.length !== 16) return 'Debe tener 16 dígitos';
  return '';
};

const validateExpiry = (expiry) => {
  if (!expiry) return 'Fecha requerida';
  const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!regex.test(expiry)) return 'Formato MM/YY';

  const [month, year] = expiry.split('/');
  const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  const now = new Date();
  if (expDate < now) return 'Tarjeta expirada';
  return '';
};

// Validación de nombre en tarjeta: solo letras y espacios, sin números
const validateCardName = (cardName) => {
  if (!cardName || !cardName.trim()) return 'Nombre en tarjeta requerido';
  const nameRegex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/;
  if (!nameRegex.test(cardName)) return 'Solo letras y espacios permitidos';
  const words = cardName.trim().split(/\s+/);
  if (words.length < 2) return 'Ingrese nombre y apellido';
  if (cardName.trim().length < 5) return 'Nombre demasiado corto';
  return '';
};

// Validación de CVC: exactamente 3 números, sin letras
const validateCVC = (cvc) => {
  if (!cvc) return 'CVC requerido';
  if (!/^\d{3}$/.test(cvc)) return 'Debe tener exactamente 3 dígitos';
  return '';
};

// ==================== COMPONENTE PRINCIPAL ====================

export default function Payment() {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, getCartCount, clearCart } = useCart();
  const user = getCurrentUser();

  // Estados del formulario
  const [formData, setFormData] = useState({
    // Datos del cliente
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    // Dirección de envío
    country: 'Ecuador',
    city: '',
    address: '',
    postalCode: '',
    // Datos de pago
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Datos del carrito
  const totals = getCartTotal();
  const itemCount = getCartCount();
  const isEmpty = cartItems.length === 0;

  // Redirigir si carrito vacío y no hay orden completada
  useEffect(() => {
    if (isEmpty && !orderComplete) {
      const timer = setTimeout(() => {
        navigate('/cart');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isEmpty, orderComplete, navigate]);

  // ==================== HANDLERS ====================

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formateo especial para ciertos campos

    // Ciudad: solo letras, espacios y acentos
    if (name === 'city') {
      formattedValue = value.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ\s]/g, '');
    }

    // Dirección: letras, números, espacios y caracteres comunes
    if (name === 'address') {
      formattedValue = value.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ0-9\s.,#\-]/g, '');
    }

    // Código postal: solo números, máximo 6
    if (name === 'postalCode') {
      formattedValue = value.replace(/\D/g, '').slice(0, 6);
    }

    // Nombre en tarjeta: solo letras y espacios (sin números)
    if (name === 'cardName') {
      formattedValue = value.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ\s]/g, '').toUpperCase();
    }

    if (name === 'cardNumber') {
      // Remove any non‑digit characters, then format as groups of 4 digits
      const digitsOnly = value.replace(/\D/g, '');
      formattedValue = digitsOnly.replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
    }

    if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
    }

    // CVC: solo números, exactamente 3
    if (name === 'cvc') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    if (name === 'phone') {
      formattedValue = value.replace(/[^\d+\-\s()]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));

    if (touched[name]) {
      validateField(name, formattedValue);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'fullName':
        error = validateRequired(value, 'Nombre completo');
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'country':
        error = validateRequired(value, 'País');
        break;
      case 'city':
        error = validateCity(value);
        break;
      case 'address':
        error = validateAddress(value);
        break;
      case 'postalCode':
        error = validatePostalCode(value);
        break;
      case 'cardName':
        error = validateCardName(value);
        break;
      case 'cardNumber':
        error = validateCardNumber(value);
        break;
      case 'expiry':
        error = validateExpiry(value);
        break;
      case 'cvc':
        error = validateCVC(value);
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const validateAllFields = () => {
    const fields = ['fullName', 'email', 'phone', 'country', 'city', 'address', 'postalCode', 'cardName', 'cardNumber', 'expiry', 'cvc'];
    const newErrors = {};
    const newTouched = {};
    let isValid = true;

    fields.forEach(field => {
      newTouched[field] = true;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(newTouched);
    return isValid;
  };

  const isFormValid = () => {
    const requiredFields = ['fullName', 'email', 'phone', 'country', 'city', 'address', 'postalCode', 'cardName', 'cardNumber', 'expiry', 'cvc'];
    return requiredFields.every(field => formData[field] && !errors[field]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAllFields()) return;
    if (isEmpty) return;

    setIsProcessing(true);

    try {
      const orderData = {
        userId: user?.id,
        items: cartItems,
        total: totals,
        shippingData: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          city: formData.city,
          address: formData.address,
          postalCode: formData.postalCode
        },
        paymentMethod: {
          type: 'card',
          last4: formData.cardNumber ? formData.cardNumber.slice(-4) : '****'
        }
      };
      const response = await createOrder(orderData);
      setCompletedOrder(response.data); // Aseguramos que guardamos response.data que tiene la orden
      setOrderComplete(true);
      clearCart();
      // Redirigir a la factura con los datos de la orden
      navigate('/invoice', { state: { order: response.data } });
    } catch (error) {
      console.error('Error al crear el pedido:', error);
      alert('Hubo un error al procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Eliminado: generación de factura PDF

  // ==================== RENDER - FORMULARIO DE PAGO ====================

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <Link
            to="/cart"
            className="inline-flex items-center text-[#007185] hover:text-[#C7511F] hover:underline text-sm font-medium transition-colors mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al carrito
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F1111]">
            Finalizar compra
          </h1>
        </div>

        {/* Layout principal */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna izquierda: Formularios */}
          <div className="lg:col-span-2 space-y-6">

            {/* Sección 1: Datos del cliente */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                <div className="w-8 h-8 bg-[#BF1919] text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <h2 className="text-lg font-bold text-[#0F1111]">Datos del cliente</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isProcessing}
                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all ${errors.fullName && touched.fullName
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                      } ${isProcessing ? 'bg-gray-100' : 'bg-white'}`}
                    placeholder="Juan Pérez"
                  />
                  {errors.fullName && touched.fullName && (
                    <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isProcessing}
                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all ${errors.email && touched.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                      } ${isProcessing ? 'bg-gray-100' : 'bg-white'}`}
                    placeholder="tu@email.com"
                  />
                  {errors.email && touched.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isProcessing}
                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all ${errors.phone && touched.phone
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                      } ${isProcessing ? 'bg-gray-100' : 'bg-white'}`}
                    placeholder="+593 99 123 4567"
                  />
                  {errors.phone && touched.phone && (
                    <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 2: Dirección de envío */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                <div className="w-8 h-8 bg-[#BF1919] text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <h2 className="text-lg font-bold text-[#0F1111]">Dirección de envío</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    País *
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isProcessing}
                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all ${errors.country && touched.country
                      ? 'border-red-500'
                      : 'border-gray-300 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                      } ${isProcessing ? 'bg-gray-100' : 'bg-white'}`}
                  >
                    <option value="Ecuador">Ecuador</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isProcessing}
                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all ${errors.city && touched.city
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                      } ${isProcessing ? 'bg-gray-100' : 'bg-white'}`}
                    placeholder="Quito"
                  />
                  {errors.city && touched.city && (
                    <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isProcessing}
                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all ${errors.address && touched.address
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                      } ${isProcessing ? 'bg-gray-100' : 'bg-white'}`}
                    placeholder="Av. 12 de Octubre N24-562"
                  />
                  {errors.address && touched.address && (
                    <p className="mt-1 text-xs text-red-600">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isProcessing}
                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all ${errors.postalCode && touched.postalCode
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                      } ${isProcessing ? 'bg-gray-100' : 'bg-white'}`}
                    placeholder="170150"
                  />
                  {errors.postalCode && touched.postalCode && (
                    <p className="mt-1 text-xs text-red-600">{errors.postalCode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 3: Método de pago */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                <div className="w-8 h-8 bg-[#BF1919] text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                <h2 className="text-lg font-bold text-[#0F1111]">Método de pago</h2>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-500">Aceptamos:</span>
                <div className="flex gap-2">
                  <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
                  <div className="w-10 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">MC</div>
                  <div className="w-10 h-6 bg-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">AMEX</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre en la tarjeta *
                  </label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isProcessing}
                    autoComplete="cc-name"
                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all ${errors.cardName && touched.cardName
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                      } ${isProcessing ? 'bg-gray-100' : 'bg-white'}`}
                    placeholder="JUAN PÉREZ"
                  />
                  {errors.cardName && touched.cardName && (
                    <p className="mt-1 text-xs text-red-600">{errors.cardName}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Número de tarjeta *
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isProcessing}
                    autoComplete="cc-number"
                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all font-mono ${errors.cardNumber && touched.cardNumber
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                      } ${isProcessing ? 'bg-gray-100' : 'bg-white'}`}
                    placeholder="1234 5678 9012 3456"
                  />
                  {errors.cardNumber && touched.cardNumber && (
                    <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiración *
                  </label>
                  <input
                    type="text"
                    id="expiry"
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isProcessing}
                    autoComplete="cc-exp"
                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all ${errors.expiry && touched.expiry
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                      } ${isProcessing ? 'bg-gray-100' : 'bg-white'}`}
                    placeholder="MM/YY"
                  />
                  {errors.expiry && touched.expiry && (
                    <p className="mt-1 text-xs text-red-600">{errors.expiry}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                    CVC *
                  </label>
                  <input
                    type="text"
                    id="cvc"
                    name="cvc"
                    value={formData.cvc}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isProcessing}
                    autoComplete="cc-csc"
                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-all ${errors.cvc && touched.cvc
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-300 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                      } ${isProcessing ? 'bg-gray-100' : 'bg-white'}`}
                    placeholder="123"
                  />
                  {errors.cvc && touched.cvc && (
                    <p className="mt-1 text-xs text-red-600">{errors.cvc}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Tus datos están protegidos con encriptación SSL</span>
              </div>
            </div>
          </div>

          {/* Columna derecha: Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-[#0F1111] mb-4 pb-3 border-b border-gray-200">
                Resumen del pedido
              </h2>

              <div className="max-h-64 overflow-y-auto mb-4 space-y-3">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-contain rounded-md border border-gray-200 bg-gray-50"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                      <p className="text-xs text-gray-500">Talla: {item.selectedSize} | Cant: {item.quantity}</p>
                      <p className="text-sm font-medium text-gray-900">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({itemCount} artículos)</span>
                  <span className="font-medium">${totals.subtotal}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envío</span>
                  <span className={`font-medium ${totals.freeShipping ? 'text-green-600' : ''}`}>
                    {totals.freeShipping ? 'GRATIS' : `$${totals.shipping}`}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA (15%)</span>
                  <span className="font-medium">${totals.taxes}</span>
                </div>

                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-lg font-bold text-[#0F1111]">Total</span>
                  <span className="text-lg font-bold text-[#B12704]">${totals.total}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || isEmpty || !isFormValid()}
                className={`w-full mt-6 py-3 px-4 rounded-full font-medium text-white transition-all ${isProcessing || isEmpty || !isFormValid()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#BF1919] hover:bg-[#a81616] shadow-sm'
                  }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  `Confirmar compra - $${totals.total}`
                )}
              </button>

              <p className="mt-4 text-xs text-gray-500 text-center">
                Al confirmar, aceptas nuestros términos y condiciones
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
