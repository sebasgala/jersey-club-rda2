import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../models/httpClient';
import { useAuth } from '../context/AuthContext';
// import { getAllProductsUnified } from '../utils/allProductsUnified'; // Removido por sincronización estricta

/**
 * AdminProductos - Página de administración CRUD de productos
 * 
 * Características:
 * - Listar productos en tabla responsive
 * - Crear nuevos productos
 * - Editar productos existentes
 * - Eliminar productos con confirmación
 * - Manejo de errores visible
 * - Estados de carga
 */

const initialProductState = {
  nombre: '',
  descripcion: '',
  precio: '',
  categoria: '',
  categoryId: '',
  imagen: '',
  stock: '',
  descuento: 0,
  tallas: 'S,M,L,XL',
};

// Mapeo de categorías (ID -> Nombre para mostrar)
// Los IDs deben coincidir con los de la base de datos
const CATEGORIAS = [
  { id: 'FUT1  ', nombre: 'Fútbol' },
  { id: 'F1-1  ', nombre: 'Fórmula 1' },
  { id: 'JCB1  ', nombre: 'Jersey Club Brand' },
  { id: 'ACC1  ', nombre: 'Accesorios' }
];

export default function AdminProductos() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Calcular rol admin desde el usuario
  const isAdmin = user?.rol === 'admin' || user?.role === 'admin' || user?.isAdmin === true;

  // Inicializar el estado con array vacío - los productos vienen del backend
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Estados del formulario
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(initialProductState);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Estado para confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, product: null });

  // Estado para el menú de ajustes
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // Cargar productos usando estrategia de sincronización con la base de datos
  // Cargar productos directamente y únicamente desde la base de datos (Sincronización Estricta)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Obtener productos de la base de datos (Fuente de Verdad única)
      const result = await getProducts();

      if (result?.status === 'success' && Array.isArray(result.data)) {
        const dbProducts = result.data.map(p => ({
          ...p,
          id: p.id,
          nombre: p.nombre || p.title,
          precio: parseFloat(p.precio) || 0,
          stock: p.stock !== undefined ? p.stock : 0,
          imagen: p.imagen || p.image || 'https://storage.googleapis.com/imagenesjerseyclub/default.webp',
          categoria: p.categoria,
          categoryId: p.categoryId,
          descuento: parseFloat(String(p.descuento || p.discount || 0)) || 0,
          discount: parseFloat(String(p.descuento || p.discount || 0)) || 0
        }));


        setProducts(dbProducts);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error al sincronizar con la base de datos:', err);
      setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(); // Cargar productos al montar el componente

    // Configurar un intervalo para refrescar los productos cada 30 segundos
    const interval = setInterval(() => {
      console.log('⏳ Refrescando productos desde la base de datos...');
      fetchProducts();
    }, 30000); // 30,000 ms = 30 segundos

    return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
  }, [fetchProducts]);

  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Cerrar menú de ajustes al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettingsMenu && !event.target.closest('.relative')) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettingsMenu]);

  // Filtrar productos basados en el término de búsqueda
  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.nombre?.toLowerCase().includes(searchLower) ||
      product.id?.toString().toLowerCase().includes(searchLower) ||
      product.categoria?.toLowerCase().includes(searchLower) ||
      product.descripcion?.toLowerCase().includes(searchLower)
    );
  });

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    if (!currentProduct.nombre.trim()) errors.nombre = 'El nombre es requerido';
    if (!currentProduct.precio || currentProduct.precio <= 0) errors.precio = 'El precio debe ser mayor a 0';
    if (!currentProduct.categoryId) errors.categoria = 'La categoría es requerida';
    if (!currentProduct.stock || currentProduct.stock < 0) errors.stock = 'El stock debe ser mayor o igual a 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo al escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Abrir formulario para crear
  const handleCreate = () => {
    setCurrentProduct(initialProductState);
    setIsEditing(false);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Abrir formulario para editar
  const handleEdit = (product) => {
    // Limpiar el precio si viene como string "$60.00"
    const rawPrice = product.precio || product.price || '';
    const cleanPrice = typeof rawPrice === 'string'
      ? rawPrice.replace('$', '').replace(',', '')
      : rawPrice;

    setCurrentProduct({
      id: product.id,
      nombre: product.nombre || product.title || product.name || '',
      descripcion: product.descripcion || product.description || '',
      precio: cleanPrice,
      categoria: product.categoria || product.category || '',
      categoryId: product.categoryId || '',
      imagen: product.imagen || product.image || '',
      stock: (product.stock !== undefined && product.stock > 0) ? product.stock : 25,
      descuento: product.descuento || product.discount || 0,
      tallas: Array.isArray(product.tallas) ? product.tallas.join(',') : 'S,M,L,XL',
    });
    setIsEditing(true);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Guardar producto (crear o actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    const productData = {
      nombre: currentProduct.nombre,
      descripcion: currentProduct.descripcion || currentProduct.nombre,
      precio: parseFloat(currentProduct.precio),
      stock: parseInt(currentProduct.stock, 10),
      categoryId: currentProduct.categoryId,
      categoria: CATEGORIAS.find(c => c.id === currentProduct.categoryId)?.nombre || 'Sin categoría',
      imagen: currentProduct.imagen || 'https://storage.googleapis.com/imagenesjerseyclub/placeholder.webp',
      descuento: parseFloat(currentProduct.descuento) || 0,
      tallas: currentProduct.tallas.split(',').map(t => t.trim()),
    };

    try {
      if (isEditing) {
        await updateProduct(currentProduct.id, productData);
        setSuccessMessage('Producto actualizado exitosamente');
      } else {
        await createProduct(productData);
        setSuccessMessage('Producto creado exitosamente');
      }
      setIsFormOpen(false);
      fetchProducts();
    } catch (err) {
      setError(`Error al ${isEditing ? 'actualizar' : 'crear'} el producto`);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Confirmar eliminación
  const handleDeleteClick = (product) => {
    setDeleteConfirm({ open: true, product });
  };

  // Ejecutar eliminación
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.product) return;

    setSubmitting(true);
    setError(null);

    try {
      await deleteProduct(deleteConfirm.product.id);
      setSuccessMessage('Producto eliminado exitosamente');
      setDeleteConfirm({ open: false, product: null });
      fetchProducts();
    } catch (err) {
      setError('Error al eliminar el producto. Por favor, intenta de nuevo.');
      console.error('Error deleting product:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Cancelar eliminación
  const handleDeleteCancel = () => {
    setDeleteConfirm({ open: false, product: null });
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-semibold text-gray-900">Administrar Productos</h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 uppercase tracking-wide">
                  {products.length} productos en base de datos
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-700">
                Gestiona el inventario de productos del Jersey Club EC.
              </p>
            </div>

            {/* Barra de búsqueda integrada */}
            <div className="mt-4 sm:mt-0 sm:ml-8 flex-grow max-w-md">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                  placeholder="Buscar por nombre, ID o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 sm:mt-0 sm:ml-8 sm:flex-none">
              <div className="flex space-x-3">
                {/* Botón principal - Agregar Producto */}
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar Producto
                </button>

                {/* Botón de Ajustes - Solo visible para administradores */}
                {isAdmin && (
                  <div className="relative">
                    <button
                      onClick={() => {
                        console.log('Botón de ajustes clickeado');
                        setShowSettingsMenu(!showSettingsMenu);
                      }}
                      className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Ajustes
                      <svg className="-mr-1 ml-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Menú desplegable */}
                    {showSettingsMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                        {/* Opciones del menú */}
                        <div className="py-1">
                          <button
                            onClick={() => {
                              handleCreate();
                              setShowSettingsMenu(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Crear Producto
                          </button>
                          <button
                            onClick={() => {
                              fetchProducts();
                              setShowSettingsMenu(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Actualizar Lista
                          </button>
                          <div className="border-t border-gray-100"></div>
                          <button
                            onClick={() => {
                              setProducts([]);
                              fetchProducts();
                              setShowSettingsMenu(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Recargar Inventario
                          </button>
                          <button
                            onClick={() => {
                              console.log('Productos:', products);
                              setShowSettingsMenu(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Ver Estadísticas
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes de éxito */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
            <div className="flex">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Mensajes de error */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Estado de carga */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Cargando productos...</span>
          </div>
        ) : (
          /* Tabla de productos */
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descuento
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="mt-2 text-sm">
                          {searchTerm ? `No se encontraron productos para "${searchTerm}"` : 'No hay productos registrados'}
                        </p>
                        {!searchTerm && (
                          <button
                            onClick={handleCreate}
                            className="mt-4 text-indigo-600 hover:text-indigo-500 font-medium"
                          >
                            Crear el primer producto
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={product.imagen || 'https://storage.googleapis.com/imagenesjerseyclub/placeholder.webp'}
                                alt={product.nombre}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://storage.googleapis.com/imagenesjerseyclub/placeholder.webp';
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.nombre}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {product.descripcion || 'Sin descripción'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                            {product.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${parseFloat(product.precio).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stock} unidades
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.descuento > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                              -{product.descuento}%
                            </span>
                          ) : (
                            <span className="text-gray-400">
                              {product.descuento ? `Val: ${product.descuento}` : 'Sin desc.'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => navigate('/admin/ordenes-compra', { state: { product: product } })}
                            className="bg-green-50 text-green-700 hover:bg-green-100 p-2 rounded-lg mr-2 transition-colors border border-green-200"
                            title="Reponer Stock (Orden de Compra)"
                          >
                            <svg className="h-4 w-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-xs font-bold uppercase tracking-wider">Stock</span>
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors"
                          >
                            <svg className="h-5 w-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="ml-1">Editar</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <svg className="h-5 w-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="ml-1">Eliminar</span>
                          </button>
                        </td>
                      </tr>

                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* Modal de formulario */}
        {
          isFormOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div
                  className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                  aria-hidden="true"
                  onClick={() => setIsFormOpen(false)}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Modal */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <form onSubmit={handleSubmit}>
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                        {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
                      </h3>

                      <div className="space-y-4">
                        {/* Nombre */}
                        <div>
                          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                            Nombre <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="nombre"
                            id="nombre"
                            value={currentProduct.nombre}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${formErrors.nombre
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                              }`}
                            placeholder="Ej: Camiseta Barcelona 2024"
                          />
                          {formErrors.nombre && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.nombre}</p>
                          )}
                        </div>

                        {/* Descripción */}
                        <div>
                          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                            Descripción
                          </label>
                          <textarea
                            name="descripcion"
                            id="descripcion"
                            rows={3}
                            value={currentProduct.descripcion}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Descripción del producto..."
                          />
                        </div>

                        {/* Precio y Stock */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
                              Precio ($) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              name="precio"
                              id="precio"
                              step="0.01"
                              min="0"
                              value={currentProduct.precio}
                              onChange={handleInputChange}
                              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${formErrors.precio
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                }`}
                              placeholder="0.00"
                            />
                            {formErrors.precio && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.precio}</p>
                            )}
                          </div>
                          <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                              Stock <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              name="stock"
                              id="stock"
                              min="0"
                              value={currentProduct.stock}
                              onChange={handleInputChange}
                              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${formErrors.stock
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                }`}
                              placeholder="0"
                            />
                            {formErrors.stock && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.stock}</p>
                            )}
                          </div>
                        </div>


                        {/* Descuento y Categoría */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="descuento" className="block text-sm font-medium text-gray-700">
                              Descuento (%) <span className="text-gray-400 text-xs">(Opcional)</span>
                            </label>
                            <input
                              type="number"
                              name="descuento"
                              id="descuento"
                              min="0"
                              max="100"
                              value={currentProduct.descuento}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="0"
                            />
                          </div>

                          <div>
                            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                              Categoría <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="categoryId"
                              id="categoryId"
                              value={currentProduct.categoryId}
                              onChange={handleInputChange}
                              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${formErrors.categoria
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                }`}
                            >
                              <option value="">Selecciona una categoría</option>
                              {CATEGORIAS.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                              ))}
                            </select>
                            {formErrors.categoria && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.categoria}</p>
                            )}
                          </div>
                        </div>

                        {/* Imagen URL */}
                        <div>
                          <label htmlFor="imagen" className="block text-sm font-medium text-gray-700">
                            URL de imagen
                          </label>
                          <input
                            type="text"
                            name="imagen"
                            id="imagen"
                            value={currentProduct.imagen}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="/assets/images/producto.webp"
                          />
                        </div>

                        {/* Tallas */}
                        <div>
                          <label htmlFor="tallas" className="block text-sm font-medium text-gray-700">
                            Tallas (separadas por coma)
                          </label>
                          <input
                            type="text"
                            name="tallas"
                            id="tallas"
                            value={currentProduct.tallas}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="S,M,L,XL"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {submitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Guardando...
                          </>
                        ) : (
                          isEditing ? 'Actualizar' : 'Crear'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        disabled={submitting}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )
        }

        {/* Modal de confirmación de eliminación */}
        {
          deleteConfirm.open && (
            <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                  className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                  aria-hidden="true"
                  onClick={handleDeleteCancel}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Modal contenedor */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                          Eliminar producto
                        </h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            ¿Estás seguro de que deseas eliminar <strong>{deleteConfirm.product?.nombre}</strong>?
                            Esta acción no se puede deshacer.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={handleDeleteConfirm}
                      disabled={submitting}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors"
                    >
                      {submitting ? 'Eliminando...' : 'Eliminar'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteCancel}
                      disabled={submitting}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </div >
    </div >
  );
}
