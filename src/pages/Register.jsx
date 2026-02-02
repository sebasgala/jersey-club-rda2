import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../models/httpClient';

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
  if (password.length < 8) return 'Debe tener al menos 8 caracteres';
  if (!/[A-Z]/.test(password)) return 'Debe incluir una letra mayúscula (A-Z)';
  if (!/[0-9]/.test(password)) return 'Debe incluir al menos un número (0-9)';
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
    // Llamar al backend real
    const response = await registerUser({
      name: values.fullName,
      email: values.email,
      password: values.password
    });

    if (!response.success) {
      throw new Error(response.message || 'Error al crear la cuenta');
    }

    return response;
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

      // Redirigir inmediatamente
      navigate('/auth');

    } catch (error) {
      setSubmitError(error.message || 'Error al crear la cuenta. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-2">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-3">
            <Link to="/" className="block">
              <img
                src="https://storage.googleapis.com/imagenesjerseyclub/logo.webp"
                alt="Jersey Club EC"
                className="h-8 sm:h-10 w-auto"
              />
            </Link>
          </div>

          {/* Card de Registro */}
          <div className="bg-white rounded-lg border border-gray-300 p-4 sm:p-5 shadow-sm">
            {/* Título */}
            <h1 className="text-lg sm:text-xl font-normal text-[#0F1111] mb-3 text-center">
              Crear cuenta
            </h1>

            {/* Mensajes de feedback (éxito/error) */}
            {(submitSuccess || submitError) && (
              <div className={`mb-3 p-2 border rounded-md ${submitSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-2">
                  <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${submitSuccess ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {submitSuccess ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  <p className={`text-xs ${submitSuccess ? 'text-green-700 font-medium' : 'text-red-700'}`}>
                    {submitSuccess ? '¡Cuenta creada con éxito! Redirigiendo...' : submitError}
                  </p>
                </div>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 gap-2">
                {/* Nombre completo */}
                <div>
                  <label htmlFor="fullName" className="block text-xs font-bold text-[#0F1111] mb-1">Nombre completo</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Tu nombre y apellido"
                    disabled={isLoading || submitSuccess}
                    className={`w-full px-3 py-1.5 text-sm border rounded-[3px] outline-none transition-all ${errors.fullName && touched.fullName
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-400 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                      } ${isLoading || submitSuccess ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                  />
                  {errors.fullName && touched.fullName && (
                    <p className="mt-0.5 text-[9px] text-red-600 leading-none">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-[#0F1111] mb-1">Correo electrónico</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="tu@email.com"
                    disabled={isLoading || submitSuccess}
                    className={`w-full px-3 py-1.5 text-sm border rounded-[3px] outline-none transition-all ${errors.email && touched.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-400 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                      } ${isLoading || submitSuccess ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                  />
                  {errors.email && touched.email && (
                    <p className="mt-0.5 text-[9px] text-red-600 leading-none">{errors.email}</p>
                  )}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="password" className="block text-xs font-bold text-[#0F1111] mb-1">Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Mínimo 8"
                        disabled={isLoading || submitSuccess}
                        className={`w-full px-3 py-1.5 pr-10 text-sm border rounded-[3px] outline-none transition-all ${errors.password && touched.password
                          ? 'border-red-500' : 'border-gray-400 focus:border-[#e77600]'
                          } ${isLoading || submitSuccess ? 'bg-gray-100' : 'bg-white'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || submitSuccess}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && touched.password && (
                      <p className="mt-0.5 text-[9px] text-red-600 leading-none">{errors.password}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-bold text-[#0F1111] mb-1">Confirmar</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Repite"
                        disabled={isLoading || submitSuccess}
                        className={`w-full px-3 py-1.5 pr-10 text-sm border rounded-[3px] outline-none transition-all ${errors.confirmPassword && touched.confirmPassword
                          ? 'border-red-500' : 'border-gray-400 focus:border-[#e77600]'
                          } ${isLoading || submitSuccess ? 'bg-gray-100' : 'bg-white'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading || submitSuccess}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showConfirmPassword ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <p className="mt-0.5 text-[9px] text-red-600 leading-none">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Checkbox términos */}
                <div className="mt-1">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isLoading || submitSuccess}
                      className="mt-0.5 w-3.5 h-3.5 rounded border-gray-400 text-[#BF1919] focus:ring-[#BF1919]"
                    />
                    <span className="text-[10px] text-[#0F1111] leading-tight">
                      Acepto las <Link to="#" className="text-[#0066c0] hover:underline">Condiciones de Uso</Link> y <Link to="#" className="text-[#0066c0] hover:underline">Aviso de Privacidad</Link>.
                    </span>
                  </label>
                </div>

                {/* Botón Submit */}
                <button
                  type="submit"
                  disabled={isLoading || submitSuccess}
                  className={`w-full py-1.5 px-4 mt-1 text-sm font-medium rounded-[3px] border transition-all ${isLoading || submitSuccess
                    ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#BF1919] text-white hover:bg-[#a81414]'
                    } focus:outline-none focus:ring-2 focus:ring-[#f3d078]`}
                >
                  {isLoading ? 'Creando...' : submitSuccess ? '¡Listo!' : 'Crear cuenta'}
                </button>
              </div>
            </form>

            {/* Divider y Link a login */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-gray-400">¿Ya tienes cuenta?</span>
              </div>
            </div>

            <Link
              to="/auth"
              className="block w-full py-1 text-sm font-medium text-center text-[#111] bg-gradient-to-b from-[#f7f8fa] to-[#e7e9ec] border border-[#adb1b8] rounded-[3px] hover:from-[#e7eaf0] transition-all"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </main>

      {/* Footer minimalista */}
      <footer className="py-2 text-center border-t border-gray-200 bg-white shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
        <div className="max-w-screen-xl mx-auto px-4">
          <p className="text-[10px] text-gray-400">
            © 2024-2026 Jersey Club EC. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
