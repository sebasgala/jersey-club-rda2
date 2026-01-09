import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  loginUser
} from '../models/httpClient';
import { useAuth } from '../context/AuthContext';

/**
 * =====================================================
 * PÁGINA DE AUTENTICACIÓN - ESTILO AMAZON
 * =====================================================
 * 
 * Características:
 * - Diseño limpio y minimalista estilo Amazon
 * - Validación de formulario en tiempo real
 * - Preparado para conectar con backend
 * - 100% responsivo
 * - Accesible (labels, focus states, etc.)
 * 
 * Para conectar con backend:
 * - Modificar la función handleLogin() para hacer fetch
 * - Agregar manejo de tokens/sesión según tu auth strategy
 */

// ==================== VALIDACIONES ====================

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
 * Valida password (mínimo 8 caracteres, al menos una mayúscula y un número)
 */
const validatePassword = (password) => {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (!/[A-Z]/.test(password)) return 'La contraseña debe incluir al menos una letra mayúscula';
  if (!/[0-9]/.test(password)) return 'La contraseña debe incluir al menos un número';
  return '';
};

// ==================== COMPONENTE PRINCIPAL ====================

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, login } = useAuth();

  // Obtener la ruta de origen para redirigir después del login
  const from = location.state?.from || '/';

  // Estado del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Estado de errores
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  // Estado de UI
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  // ==================== HANDLERS ====================

  /**
   * Actualiza el campo y valida en tiempo real
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpiar error de submit
    if (submitError) setSubmitError('');

    // Validar solo si el campo ya fue tocado
    if (touched[name]) {
      const error = name === 'email' ? validateEmail(value) : validatePassword(value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  /**
   * Marca campo como tocado y valida
   */
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = name === 'email' ? validateEmail(value) : validatePassword(value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  /**
   * Valida todo el formulario
   */
  const validateForm = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });

    return !emailError && !passwordError;
  };

  /**
   * 🔌 PLACEHOLDER PARA BACKEND
   * 
   * Esta función simula el login. Para conectar con tu backend:
   * 1. Reemplaza el setTimeout por un fetch/axios
   * 2. Ejemplo:
   *    const response = await fetch('/api/auth/login', {
   *      method: 'POST',
   *      headers: { 'Content-Type': 'application/json' },
   *      body: JSON.stringify(values)
   *    });
   *    const data = await response.json();
   *    if (!response.ok) throw new Error(data.message);
   *    // Guardar token, redirigir, etc.
   */
  const handleLogin = async (values) => {
    // Llamar al backend real usando loginUser
    const response = await loginUser(values);

    // El backend devuelve { success: true, message: '...', data: { user, token } }
    if (!response.success) {
      throw new Error(response.message || 'Error al iniciar sesión');
    }

    const { token, user } = response.data;
    // Retornamos los datos para que el handleSubmit use el login del contexto
    return { success: true, user, token };
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
      const result = await handleLogin(formData);
      // USAR LOGIN DEL CONTEXTO (Esto dispara la actualización inmediata en el Navbar)
      login(result.user, result.token);

      // Redirigir al usuario a la página de origen o al home
      navigate(from, { replace: true });
    } catch (error) {
      setSubmitError(error.message || 'Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== RENDER ====================


  if (isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex flex-col pt-20 sm:pt-24">
        <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-lg border border-gray-300 p-8 shadow-sm text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-indigo-600 font-bold uppercase">
                  {user?.name?.charAt(0) || user?.nombre?.charAt(0) || user?.email?.charAt(0)}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">¡Hola, {user?.name || user?.nombre}!</h1>
              <p className="text-sm text-gray-500 mb-6">Has iniciado sesión como <br /><strong>{user?.email}</strong></p>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-2 px-4 text-sm font-medium rounded-[3px] bg-[#BF1919] text-white hover:bg-[#a81414] transition-all"
                >
                  Ir a la tienda
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate('/auth');
                  }}
                  className="w-full py-2 px-4 text-sm font-medium rounded-[3px] border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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

          {/* Card de Login */}
          <div className="bg-white rounded-lg border border-gray-300 p-5 sm:p-6 shadow-sm">

            {/* Título */}
            <h1 className="text-2xl sm:text-[28px] font-normal text-[#0F1111] mb-5">
              Iniciar sesión
            </h1>

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
                  disabled={isLoading}
                  className={`
                    w-full px-3 py-2 text-sm border rounded-[3px] outline-none transition-all
                    ${errors.email && touched.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-400 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                    }
                    ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
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
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold text-[#0F1111]"
                  >
                    Contraseña
                  </label>
                  <Link
                    to="#"
                    className="text-xs text-[#0066c0] hover:text-[#c45500] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="current-password"
                    disabled={isLoading}
                    className={`
                      w-full px-3 py-2 pr-10 text-sm border rounded-[3px] outline-none transition-all
                      ${errors.password && touched.password
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-400 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                      }
                      ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                    `}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
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

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full py-2 px-4 text-sm font-medium rounded-[3px] border
                  transition-all duration-150
                  ${isLoading
                    ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#BF1919] text-white hover:bg-[#a81414] active:bg-[#8f1212]'
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
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </form>

            {/* Términos */}
            <p className="mt-4 text-xs text-[#555] leading-relaxed">
              Al continuar, aceptas las{' '}
              <Link to="#" className="text-[#0066c0] hover:text-[#c45500] hover:underline">
                Condiciones de Uso
              </Link>{' '}
              y el{' '}
              <Link to="#" className="text-[#0066c0] hover:text-[#c45500] hover:underline">
                Aviso de Privacidad
              </Link>{' '}
              de Jersey Club EC.
            </p>

            {/* Divider */}
            {/* Eliminado el texto "o continúa con" y los botones sociales de Google y GitHub */}

          </div>

          {/* Divider para crear cuenta */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-50 px-3 text-xs text-gray-500">
                ¿Eres nuevo en Jersey Club?
              </span>
            </div>
          </div>

          {/* Botón crear cuenta */}
          <Link
            to="/register"
            className="block w-full py-2 px-4 text-sm font-medium text-center text-white bg-[#495A72] border border-[#495A72] rounded-[3px] hover:bg-[#3b4d63] transition-all"
          >
            Crear tu cuenta de Jersey Club
          </Link>
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
