import React, { useState, useEffect } from 'react';
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
 */

// ==================== VALIDACIONES ====================

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'El correo electrónico es requerido';
  if (!emailRegex.test(email)) return 'Ingresa un correo electrónico válido';
  return '';
};

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

  const from = location.state?.from || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  // Resetear formulario cada vez que se accede a la página
  useEffect(() => {
    setFormData({ email: '', password: '' });
    setErrors({ email: '', password: '' });
    setTouched({ email: false, password: false });
    setSubmitError('');
    setIsLoading(false);
  }, [location.pathname]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError('');
    if (touched[name]) {
      const error = name === 'email' ? validateEmail(value) : validatePassword(value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = name === 'email' ? validateEmail(value) : validatePassword(value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });
    return !emailError && !passwordError;
  };

  const handleLogin = async (values) => {
    const response = await loginUser(values);
    if (!response.success) {
      throw new Error(response.message || 'Error al iniciar sesión');
    }
    const { token, user } = response.data;
    return { success: true, user, token };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setSubmitError('');
    try {
      const result = await handleLogin(formData);
      login(result.user, result.token);
      navigate(from, { replace: true });
    } catch (error) {
      setSubmitError(error.message || 'Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
      setFormData({ email: '', password: '' });
      setErrors({ email: '', password: '' });
      setTouched({ email: false, password: false });
    }
  };

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
    <div className="min-h-screen w-full bg-gray-50 flex flex-col pt-16 sm:pt-20 overflow-y-auto">
      <main className="flex-1 flex items-center justify-center px-4 py-2 sm:py-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Link to="/" className="block">
              <img
                src="https://storage.googleapis.com/imagenesjerseyclub/logo.webp"
                alt="Jersey Club EC"
                className="h-10 sm:h-12 w-auto"
              />
            </Link>
          </div>

          {/* Card de Login */}
          <div className="bg-white rounded-lg border border-gray-300 p-4 sm:p-5 shadow-sm">
            <h1 className="text-xl sm:text-2xl font-normal text-[#0F1111] mb-4">
              Iniciar sesión
            </h1>

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

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="email" className="block text-sm font-bold text-[#0F1111] mb-1">
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
                  autoComplete="off"
                  disabled={isLoading}
                  className={`w-full px-3 py-2 text-sm border rounded-[3px] outline-none transition-all ${errors.email && touched.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-400 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                    } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
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

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-bold text-[#0F1111]">
                    Contraseña
                  </label>
                  <Link to="#" className="text-xs text-[#0066c0] hover:text-[#c45500] hover:underline">
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
                    autoComplete="new-password"
                    disabled={isLoading}
                    className={`w-full px-3 py-2 pr-10 text-sm border rounded-[3px] outline-none transition-all ${errors.password && touched.password
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-400 focus:border-[#e77600] focus:ring-2 focus:ring-[#f3d078]'
                      } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
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

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 px-4 text-sm font-medium rounded-[3px] border transition-all duration-150 ${isLoading
                    ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#BF1919] text-white hover:bg-[#a81414] active:bg-[#8f1212]'
                  } focus:outline-none focus:ring-2 focus:ring-[#f3d078]`}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>

            <p className="mt-3 text-xs text-[#555] leading-relaxed">
              Al continuar, aceptas las{' '}
              <Link to="#" className="text-[#0066c0] hover:text-[#c45500] hover:underline">Condiciones de Uso</Link> y el <Link to="#" className="text-[#0066c0] hover:text-[#c45500] hover:underline">Aviso de Privacidad</Link> de Jersey Club EC.
            </p>
          </div>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-50 px-3 text-xs text-gray-500">¿Eres nuevo en Jersey Club?</span>
            </div>
          </div>

          <Link
            to="/register"
            className="block w-full py-2 px-4 text-sm font-medium text-center text-white bg-[#BF1919] border border-[#BF1919] rounded-[3px] mt-2 hover:bg-[#a81414] transition-all"
          >
            Crear tu cuenta de Jersey Club
          </Link>
        </div>
      </main>

      <footer className="py-4 text-center border-t border-gray-200 bg-white shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-gray-500 mb-4">
            <Link to="/informacion" className="hover:text-[#BF1919] hover:underline transition-colors">Condiciones de uso</Link>
            <Link to="/privacidad" className="hover:text-[#BF1919] hover:underline transition-colors">Aviso de privacidad</Link>
            <Link to="/contacto" className="hover:text-[#BF1919] hover:underline transition-colors">Ayuda</Link>
          </div>
          <p className="text-[11px] text-gray-400 tracking-wide">
            © 2024-2026 Jersey Club EC. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
