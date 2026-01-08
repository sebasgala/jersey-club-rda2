import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * =====================================================
 * PÁGINA DE REGISTRO - JERSEY CLUB EC
 * =====================================================
 * 
 * Características:
 * - Diseño consistente con el login (Auth.jsx)
 * - Validación completa del formulario
 * - Preparado para conectar con backend
 * - 100% responsivo
 * - Espaciado correcto para header fixed (pt-24)
 * 
 * Para conectar con backend:
 * - Modificar la función handleRegister() para hacer fetch
 * - Agregar manejo de tokens/sesión según tu auth strategy
 */

// ==================== VALIDACIONES ====================

/**
 * Valida nombre completo
 */
const validateFullName = (name) => {
  if (!name) return 'El nombre es requerido';
  if (name.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
  return '';
};

/**
 * Valida formato de email
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'El correo electrónico es requerido';
  if (!emailRegex.test(email)) return 'Ingresa un correo electrónico válido';
  return '';
};

/**
 * Valida password (mínimo 8 caracteres)
 */
const validatePassword = (password) => {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  return '';
};

/**
 * Valida confirmación de password
 */
const validateConfirmPassword = (confirmPassword, password) => {
  if (!confirmPassword) return 'Confirma tu contraseña';
  if (confirmPassword !== password) return 'Las contraseñas no coinciden';
  return '';
};

/**
 * Valida aceptación de términos
 */
const validateTerms = (accepted) => {
  if (!accepted) return 'Debes aceptar los términos y condiciones';
  return '';
};

// ==================== COMPONENTE PRINCIPAL ====================

export default function Register() {
  const navigate = useNavigate();

  // Estado del formulario
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  // Estado de errores
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: ''
  });

  // Estado de UI
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    termsAccepted: false
  });

  // ==================== HANDLERS ====================

  /**
   * Actualiza el campo y valida en tiempo real
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: fieldValue }));
    
    // Limpiar errores
    if (submitError) setSubmitError('');
    if (submitSuccess) setSubmitSuccess(false);

    // Validar solo si el campo ya fue tocado
    if (touched[name]) {
      let error = '';
      switch (name) {
        case 'fullName':
          error = validateFullName(fieldValue);
          break;
        case 'email':
          error = validateEmail(fieldValue);
          break;
        case 'password':
          error = validatePassword(fieldValue);
          // También revalidar confirmPassword si ya fue tocado
          if (touched.confirmPassword) {
            setErrors(prev => ({
              ...prev,
              confirmPassword: validateConfirmPassword(formData.confirmPassword, fieldValue)
            }));
          }
          break;
        case 'confirmPassword':
          error = validateConfirmPassword(fieldValue, formData.password);
          break;
        case 'termsAccepted':
          error = validateTerms(fieldValue);
          break;
        default:
          break;
      }
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  /**
   * Marca campo como tocado y valida
   */
  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    let error = '';
    switch (name) {
      case 'fullName':
        error = validateFullName(fieldValue);
        break;
      case 'email':
        error = validateEmail(fieldValue);
        break;
      case 'password':
        error = validatePassword(fieldValue);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(fieldValue, formData.password);
        break;
      case 'termsAccepted':
        error = validateTerms(fieldValue);
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  /**
   * Valida todo el formulario
   */
  const validateForm = () => {
    const fullNameError = validateFullName(formData.fullName);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
    const termsError = validateTerms(formData.termsAccepted);
    
    setErrors({
      fullName: fullNameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      termsAccepted: termsError
    });
    
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      termsAccepted: true
    });
    
    return !fullNameError && !emailError && !passwordError && !confirmPasswordError && !termsError;
  };

  /**
   * 🔌 PLACEHOLDER PARA BACKEND
   * 
   * Esta función simula el registro. Para conectar con tu backend:
   * 1. Reemplaza el setTimeout por un fetch/axios
   * 2. Ejemplo:
   *    const response = await fetch('/api/auth/register', {
   *      method: 'POST',
   *      headers: { 'Content-Type': 'application/json' },
   *      body: JSON.stringify(values)
   *    });
   *    const data = await response.json();
   *    if (!response.ok) throw new Error(data.message);
   *    // Redirigir a login o auto-login
   */
  const handleRegister = async (values) => {
    console.log('📝 Register attempt:', values);
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simular respuesta exitosa
    // TODO: Reemplazar con llamada real al backend
    console.log('✅ Registration successful (placeholder)');
    
    // Ejemplo de error simulado (descomentar para probar):
    // throw new Error('Este correo ya está registrado');
    
    return { success: true, user: { email: values.email, fullName: values.fullName } };
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    if (!validateForm()) return;

    setIsLoading(true);
    setSubmitError('');

    try {
      await handleRegister({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      
      setSubmitSuccess(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
      
    } catch (error) {
      setSubmitError(error.message || 'Error al crear la cuenta. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col pt-20 sm:pt-24">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-sm">
          
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link to="/" className="block">
              <img 
                src="/assets/images/logo.webp" 
                alt="Jersey Club EC" 
                className="h-10 sm:h-12 w-auto"
              />
            </Link>
          </div>

          {/* Card de Registro */}
          <div className="bg-white rounded-lg border border-gray-300 p-5 sm:p-6 shadow-sm">
            
            {/* Título */}
            <h1 className="text-2xl sm:text-[28px] font-normal text-[#0F1111] mb-5">
              Crear cuenta
            </h1>

            {/* Mensaje de éxito */}
            {submitSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-green-700 font-medium">¡Cuenta creada exitosamente!</p>
                    <p className="text-xs text-green-600 mt-1">Redirigiendo al inicio de sesión...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error general */}
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} noValidate>
              
              {/* Nombre completo */}
              <div className="mb-4">
                <label 
                  htmlFor="fullName" 
                  className="block text-sm font-bold text-[#0F1111] mb-1"
                >
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Tu nombre y apellido"
                  autoComplete="name"
                  disabled={isLoading || submitSuccess}
                  className={`
                    w-full px-3 py-2 text-sm border rounded-[3px] outline-none transition-all
                    ${errors.fullName && touched.fullName
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-400 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                    }
                    ${isLoading || submitSuccess ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                  `}
                />
                {errors.fullName && touched.fullName && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label 
                  htmlFor="email" 
                  className="block text-sm font-bold text-[#0F1111] mb-1"
                >
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  disabled={isLoading || submitSuccess}
                  className={`
                    w-full px-3 py-2 text-sm border rounded-[3px] outline-none transition-all
                    ${errors.email && touched.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-400 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                    }
                    ${isLoading || submitSuccess ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                  `}
                />
                {errors.email && touched.email && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="mb-4">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-bold text-[#0F1111] mb-1"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    disabled={isLoading || submitSuccess}
                    className={`
                      w-full px-3 py-2 pr-10 text-sm border rounded-[3px] outline-none transition-all
                      ${errors.password && touched.password
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-400 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                      }
                      ${isLoading || submitSuccess ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                    `}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || submitSuccess}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirmar Password */}
              <div className="mb-4">
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-bold text-[#0F1111] mb-1"
                >
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Repite tu contraseña"
                    autoComplete="new-password"
                    disabled={isLoading || submitSuccess}
                    className={`
                      w-full px-3 py-2 pr-10 text-sm border rounded-[3px] outline-none transition-all
                      ${errors.confirmPassword && touched.confirmPassword
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-400 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                      }
                      ${isLoading || submitSuccess ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                    `}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading || submitSuccess}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Checkbox términos */}
              <div className="mb-5">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading || submitSuccess}
                    className={`
                      mt-0.5 w-4 h-4 rounded border-gray-400 text-[#e77600] 
                      focus:ring-2 focus:ring-[#f3d078] focus:ring-offset-0
                      ${isLoading || submitSuccess ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    `}
                  />
                  <span className="text-sm text-[#0F1111] leading-tight">
                    Acepto las{' '}
                    <Link to="#" className="text-[#0066c0] hover:text-[#c45500] hover:underline">
                      Condiciones de Uso
                    </Link>{' '}
                    y el{' '}
                    <Link to="#" className="text-[#0066c0] hover:text-[#c45500] hover:underline">
                      Aviso de Privacidad
                    </Link>{' '}
                    de Jersey Club EC.
                  </span>
                </label>
                {errors.termsAccepted && touched.termsAccepted && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1 ml-6">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.termsAccepted}
                  </p>
                )}
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={isLoading || submitSuccess}
                className={`
                  w-full py-2 px-4 text-sm font-medium rounded-[3px] border
                  transition-all duration-150
                  ${isLoading || submitSuccess
                    ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#BF1919] text-white border-[#BF1919] hover:bg-[#a81414] active:bg-[#8f1212]'
                  }
                  focus:outline-none focus:ring-2 focus:ring-[#f3d078]
                `}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creando cuenta...
                  </span>
                ) : submitSuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ¡Cuenta creada!
                  </span>
                ) : (
                  'Crear tu cuenta de Jersey Club'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-500">
                  ¿Ya tienes cuenta?
                </span>
              </div>
            </div>

            {/* Link a login */}
            <Link
              to="/auth"
              className="block w-full py-2 px-4 text-sm font-medium text-center text-[#111] bg-gradient-to-b from-[#f7f8fa] to-[#e7e9ec] border border-[#adb1b8] rounded-[3px] hover:from-[#e7eaf0] hover:to-[#d9dce1] transition-all"
            >
              Iniciar sesión
            </Link>
          </div>

          {/* Información adicional */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              Al crear una cuenta, podrás guardar tus productos favoritos, 
              ver tu historial de pedidos y disfrutar de una experiencia 
              de compra personalizada.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-gray-200 bg-gradient-to-b from-transparent to-[#f5f5f5]">
        <div className="flex items-center justify-center gap-4 text-xs text-[#555] mb-2">
          <Link to="#" className="text-[#0066c0] hover:text-[#c45500] hover:underline">
            Condiciones de uso
          </Link>
          <Link to="#" className="text-[#0066c0] hover:text-[#c45500] hover:underline">
            Aviso de privacidad
          </Link>
          <Link to="/contacto" className="text-[#0066c0] hover:text-[#c45500] hover:underline">
            Ayuda
          </Link>
        </div>
        <p className="text-xs text-[#555]">
          © 2024-2026 Jersey Club EC. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
