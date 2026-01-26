import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getOrdenesCompra, createOrden, updateOrden, deleteOrden, getProducts } from '../models/httpClient';

/**
 * AdminOrdenesCompra - Página de administración CRUD de órdenes de compra de stock
 * 
 * Características:
 * - Listar órdenes de compra en tabla responsive
 * - Crear nuevas órdenes de compra con selección de productos
 * - Editar órdenes existentes
 * - Eliminar órdenes con confirmación
 * - Conexión con productos para selección
 * - Manejo de errores visible
 * - Estados de carga
 */

const initialOrderState = {
  proveedor: '',
  items: [],
  total: 0,
  estado: 'pendiente',
  fechaEntrega: '',
  notas: '',
  tipo: 'compra',
};

export default function AdminOrdenesCompra() {
  // Estados principales
  const [ordenes, setOrdenes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Estados del formulario
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(initialOrderState);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Estado para búsqueda de productos
  const [productSearch, setProductSearch] = useState('');

  // Estado para confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, order: null });

  const location = useLocation();

  // Cargar órdenes de compra
  const fetchOrdenes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOrdenesCompra();
      setOrdenes(response.data || response || []);
    } catch (err) {
      setError('Error al cargar las órdenes de compra. Por favor, intenta de nuevo.');
      console.error('Error fetching ordenes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Agregar producto a la orden
  const handleAddProduct = useCallback((product) => {
    if (!product) return;

    // Evitar duplicados
    if (currentOrder.items.find(item => String(item.id) === String(product.id))) {
      return;
    }

    const newItem = {
      id: product.id,
      nombre: product.nombre || product.title,
      cantidad: 1,
      precioCompra: product.precio || product.price || 0,
      stockActual: product.stock || 0
    };

    setCurrentOrder(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setProductSearch(''); // Limpiar búsqueda
  }, [currentOrder.items]);

  // Cargar productos disponibles
  const fetchProductos = useCallback(async () => {
    try {
      const response = await getProducts();
      setProductos(response.data || response || []);

      // Manejar producto entrante por navegación (Reponer Stock desde AdminProductos)
      if (location.state?.product) {
        const product = location.state.product;
        console.log('📦 Producto recibido por navegación:', product);

        // Simular apertura de formulario y agregar producto
        setIsFormOpen(true);
        handleAddProduct(product);

        // Limpiar estado de ubicación para evitar que se repita al refrescar
        window.history.replaceState({}, document.title);
      }
    } catch (err) {
      console.error('Error fetching productos:', err);
    }
  }, [location.state, handleAddProduct]);

  useEffect(() => {
    fetchOrdenes();
    fetchProductos();
  }, [fetchOrdenes, fetchProductos]);

  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Calcular total automáticamente
  const calculateTotal = useCallback(() => {
    const total = (currentOrder.items || []).reduce((sum, item) => {
      const price = typeof item.precioCompra === 'string'
        ? parseFloat(item.precioCompra.replace('$', ''))
        : (item.precioCompra || 0);
      return sum + (item.cantidad * price);
    }, 0);
    setCurrentOrder(prev => ({ ...prev, total: total.toFixed(2) }));
  }, [currentOrder.items]);

  useEffect(() => {
    calculateTotal();
  }, [calculateTotal]);

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    if (!currentOrder.proveedor?.trim()) errors.proveedor = 'El proveedor es requerido';
    if (!currentOrder.items || currentOrder.items.length === 0) errors.productos = 'Debe seleccionar al menos un producto';
    if (!currentOrder.total || currentOrder.total <= 0) errors.total = 'El total debe ser mayor a 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentOrder(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Actualizar cantidad de producto
  const handleProductQuantityChange = (productId, cantidad) => {
    const qty = parseInt(cantidad) || 0;
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.map(item =>
        String(item.id) === String(productId) ? { ...item, cantidad: qty } : item
      )
    }));
  };

  // Actualizar precio de compra
  const handleProductPriceChange = (productId, precio) => {
    const p = parseFloat(precio) || 0;
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.map(item =>
        String(item.id) === String(productId) ? { ...item, precioCompra: p } : item
      )
    }));
  };

  // Eliminar producto de la selección
  const handleRemoveProduct = (productId) => {
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => String(item.id) !== String(productId))
    }));
  };

  // Abrir formulario para crear
  const handleCreate = () => {
    setCurrentOrder(initialOrderState);
    setIsEditing(false);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Abrir formulario para editar
  const handleEdit = (order) => {
    setCurrentOrder({
      id: order.id,
      proveedor: order.proveedor || '',
      items: order.items || order.productos || [], // Compatibilidad
      total: order.total || 0,
      estado: order.estado || 'pendiente',
      fechaEntrega: order.fechaEntrega || '',
      notas: order.notas || '',
      tipo: 'compra',
    });

    setIsEditing(true);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Guardar orden
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);

    // Mapear shippingData para cumplir validación del backend
    const orderData = {
      ...currentOrder,
      items: currentOrder.items,
      paymentMethod: 'Factura Transferencia', // Por defecto para compras
      shippingData: {
        fullName: `Proveedor: ${currentOrder.proveedor}`,
        address: 'Bodega Principal',
        city: 'Quito',
        phone: 'N/A',
        email: 'N/A'
      },
      tipo: 'compra',
      total: parseFloat(currentOrder.total),
      fecha: new Date().toISOString(),
    };

    try {
      if (isEditing) {
        await updateOrden(currentOrder.id, orderData);
        setSuccessMessage('Orden de compra actualizada exitosamente');
      } else {
        await createOrden(orderData);
        setSuccessMessage('Orden de compra creada exitosamente');
      }
      setIsFormOpen(false);
      fetchOrdenes();
    } catch (err) {
      setError(isEditing
        ? 'Error al actualizar la orden de compra. Por favor, intenta de nuevo.'
        : 'Error al crear la orden de compra. Por favor, intenta de nuevo.'
      );
      console.error('Error saving order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Confirmar eliminación
  const handleDeleteClick = (order) => {
    setDeleteConfirm({ open: true, order });
  };

  // Ejecutar eliminación
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.order) return;

    setSubmitting(true);
    setError(null);

    try {
      await deleteOrden(deleteConfirm.order.id);
      setSuccessMessage('Orden de compra eliminada exitosamente');
      setDeleteConfirm({ open: false, order: null });
      fetchOrdenes();
    } catch (err) {
      setError('Error al eliminar la orden de compra. Por favor, intenta de nuevo.');
      console.error('Error deleting order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Cancelar eliminación
  const handleDeleteCancel = () => {
    setDeleteConfirm({ open: false, order: null });
  };

  // Obtener color del badge según estado
  const getEstadoBadgeColor = (estado) => {
    switch (estado) {
      case 'recibido': return 'bg-green-100 text-green-800';
      case 'enviado': return 'bg-blue-100 text-blue-800';
      case 'procesando': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Órdenes de Compra de Stock</h1>
          <p className="mt-2 text-gray-600">Gestiona las órdenes de compra de productos para tu inventario</p>
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
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Cargando órdenes de compra...</span>
          </div>
        ) : (
          /* Tabla de órdenes */
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Orden
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proveedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Productos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ordenes.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="mt-2 text-sm">No hay órdenes de compra registradas</p>
                        <button onClick={handleCreate} className="mt-4 text-green-600 hover:text-green-500 font-medium">
                          Crear la primera orden de compra
                        </button>
                      </td>
                    </tr>
                  ) : (
                    ordenes.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                              <div className="text-sm text-gray-500">Compra</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.proveedor || 'Sin proveedor'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">
                            {Array.isArray(order.items) ? (
                              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">
                                {order.items.length} ítems
                              </span>
                            ) : Array.isArray(order.productos) ? (
                              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">
                                {order.productos.length} productos
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(order.fecha)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-base font-bold text-gray-900">
                            ${parseFloat(order.total || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getEstadoBadgeColor(order.estado)}`}>
                            {order.estado?.toUpperCase() || 'PENDIENTE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEdit(order)} className="text-green-600 hover:text-green-900 mr-4 transition-colors">
                            <svg className="h-5 w-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="ml-1">Editar</span>
                          </button>
                          <button onClick={() => handleDeleteClick(order)} className="text-red-600 hover:text-red-900 transition-colors">
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

        {/* Botón para agregar nueva orden */}
        <div className="mt-8">
          <button
            onClick={handleCreate}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Orden de Compra
          </button>
        </div>

        {/* Modal de formulario */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsFormOpen(false)}></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                      {isEditing ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
                    </h3>

                    <div className="space-y-4">
                      {/* Proveedor y Fecha de Entrega */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="proveedor" className="block text-sm font-medium text-gray-700">
                            Proveedor <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="proveedor"
                            id="proveedor"
                            value={currentOrder.proveedor}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${formErrors.proveedor ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="Nombre del proveedor"
                          />
                          {formErrors.proveedor && <p className="mt-1 text-sm text-red-600">{formErrors.proveedor}</p>}
                        </div>

                        <div>
                          <label htmlFor="fechaEntrega" className="block text-sm font-medium text-gray-700">
                            Fecha Estimada de Entrega
                          </label>
                          <input
                            type="date"
                            name="fechaEntrega"
                            id="fechaEntrega"
                            value={currentOrder.fechaEntrega}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                          />
                        </div>
                      </div>

                      {/* Selección de productos mejorada con búsqueda */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Buscar Productos para Restock <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="fa fa-search text-gray-400"></i>
                          </div>
                          <input
                            type="text"
                            placeholder="Buscar por nombre o ID..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          />

                          {/* Resultados de búsqueda */}
                          {productSearch.trim().length > 1 && (
                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                              {productos
                                .filter(p => (
                                  (p.nombre || p.title || '').toLowerCase().includes(productSearch.toLowerCase()) ||
                                  (String(p.id).toLowerCase().includes(productSearch.toLowerCase()))
                                ))
                                .slice(0, 10)
                                .map(product => (
                                  <div
                                    key={product.id}
                                    onClick={() => handleAddProduct(product)}
                                    className="cursor-pointer hover:bg-green-50 px-4 py-2 flex items-center justify-between border-b last:border-0"
                                  >
                                    <div className="flex items-center">
                                      {product.imagen && (
                                        <img src={product.imagen || product.image} alt="" className="h-8 w-8 object-contain mr-3 rounded" />
                                      )}
                                      <div>
                                        <div className="font-medium text-gray-900">{product.nombre || product.title}</div>
                                        <div className="text-xs text-gray-500">ID: {product.id} | Cat: {product.categoria}</div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-bold text-gray-900">${product.precio || product.price}</div>
                                      <div className={`text-xs ${product.stock <= 5 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                        Stock: {product.stock}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              {productos.filter(p => (p.nombre || p.title || '').toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                                <div className="px-4 py-2 text-sm text-gray-500">No se encontraron productos</div>
                              )}
                            </div>
                          )}
                        </div>
                        {formErrors.productos && <p className="mt-1 text-sm text-red-600 font-medium">{formErrors.productos}</p>}
                      </div>

                      {/* Lista de productos seleccionados */}
                      {currentOrder.items && currentOrder.items.length > 0 && (
                        <div className="mt-4 border rounded-xl overflow-hidden shadow-sm">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Producto</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Stock Act.</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Cantidad</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">P. Compra</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Subtotal</th>
                                <th className="px-4 py-3"></th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {currentOrder.items.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.nombre}</td>
                                  <td className="px-4 py-3 text-center text-sm text-gray-500">{item.stockActual}</td>
                                  <td className="px-4 py-3 text-center">
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.cantidad}
                                      onChange={(e) => handleProductQuantityChange(item.id, e.target.value)}
                                      className="w-20 mx-auto rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all"
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end">
                                      <span className="mr-1 text-gray-500">$</span>
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={item.precioCompra}
                                        onChange={(e) => handleProductPriceChange(item.id, e.target.value)}
                                        className="w-24 rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                      />
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                                    ${(item.cantidad * (typeof item.precioCompra === 'string' ? parseFloat(item.precioCompra.replace('$', '')) : item.precioCompra || 0)).toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveProduct(item.id)}
                                      className="text-red-400 hover:text-red-600 transition-colors"
                                    >
                                      <i className="fa fa-trash"></i>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-green-50">
                              <tr>
                                <td colSpan="4" className="px-4 py-3 text-right text-sm font-bold text-gray-700">TOTAL ORDEN:</td>
                                <td className="px-4 py-3 text-right text-lg font-black text-green-700">${currentOrder.total}</td>
                                <td></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}

                      {/* Total y Estado */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="hidden">
                          <label htmlFor="total" className="block text-sm font-medium text-gray-700">Total ($)</label>
                          <input type="number" name="total" id="total" value={currentOrder.total} readOnly />
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                          <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado de Operación</label>
                          <select
                            name="estado"
                            id="estado"
                            value={currentOrder.estado}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="procesando">En Proceso/Pedido</option>
                            <option value="enviado">Despachado por Proveedor</option>
                            <option value="recibido">✅ Recibido y Cargado a Stock</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </div>
                      </div>

                      {/* Notas */}
                      <div>
                        <label htmlFor="notas" className="block text-sm font-medium text-gray-700">
                          Notas
                        </label>
                        <textarea
                          name="notas"
                          id="notas"
                          rows={2}
                          value={currentOrder.notas}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                          placeholder="Notas adicionales..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {submitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      disabled={submitting}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {deleteConfirm.open && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleDeleteCancel}></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

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
                        Eliminar orden de compra
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          ¿Estás seguro de que deseas eliminar la orden de compra <strong>#{deleteConfirm.order?.id}</strong>?
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
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {submitting ? 'Eliminando...' : 'Eliminar'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCancel}
                    disabled={submitting}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}