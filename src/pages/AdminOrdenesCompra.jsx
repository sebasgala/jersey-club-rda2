import React, { useState, useEffect, useCallback } from 'react';
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
  productos: [],
  total: '',
  estado: 'pendiente',
  fechaEntrega: '',
  notas: '',
  tipo: 'compra',
};

export default function AdminOrdenesCompra() {
  // Estados principales - DEBEN estar antes de cualquier return condicional
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
  
  // Estado para productos seleccionados
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // Estado para confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, order: null });

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

  // Cargar productos disponibles
  const fetchProductos = useCallback(async () => {
    try {
      const response = await getProducts();
      setProductos(response.data || response || []);
    } catch (err) {
      console.error('Error fetching productos:', err);
    }
  }, []);

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
    const total = selectedProducts.reduce((sum, p) => sum + (p.cantidad * p.precioCompra), 0);
    setCurrentOrder(prev => ({ ...prev, total: total.toFixed(2) }));
  }, [selectedProducts]);

  useEffect(() => {
    calculateTotal();
  }, [calculateTotal]);

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    if (!currentOrder.proveedor.trim()) errors.proveedor = 'El proveedor es requerido';
    if (selectedProducts.length === 0) errors.productos = 'Debe seleccionar al menos un producto';
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

  // Agregar producto a la orden
  const handleAddProduct = (productId) => {
    if (!productId) return;
    const product = productos.find(p => p.id === parseInt(productId));
    if (product && !selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(prev => [...prev, { 
        ...product, 
        cantidad: 1,
        precioCompra: product.precio || 0
      }]);
    }
  };

  // Actualizar cantidad de producto
  const handleProductQuantityChange = (productId, cantidad) => {
    setSelectedProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, cantidad: parseInt(cantidad) || 1 } : p
    ));
  };

  // Actualizar precio de compra
  const handleProductPriceChange = (productId, precio) => {
    setSelectedProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, precioCompra: parseFloat(precio) || 0 } : p
    ));
  };

  // Eliminar producto de la selección
  const handleRemoveProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Abrir formulario para crear
  const handleCreate = () => {
    setCurrentOrder(initialOrderState);
    setSelectedProducts([]);
    setIsEditing(false);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Abrir formulario para editar
  const handleEdit = (order) => {
    setCurrentOrder({
      id: order.id,
      proveedor: order.proveedor || '',
      productos: order.productos || [],
      total: order.total || '',
      estado: order.estado || 'pendiente',
      fechaEntrega: order.fechaEntrega || '',
      notas: order.notas || '',
      tipo: 'compra',
    });
    
    // Cargar productos seleccionados
    if (Array.isArray(order.productos)) {
      setSelectedProducts(order.productos.map(p => ({
        id: p.id || p.productoId,
        nombre: p.nombre || productos.find(prod => prod.id === p.id)?.nombre || 'Producto',
        cantidad: p.cantidad || 1,
        precioCompra: p.precioCompra || p.precio || 0
      })));
    } else {
      setSelectedProducts([]);
    }
    
    setIsEditing(true);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Validar y guardar orden (crear o actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);

    const orderData = {
      ...currentOrder,
      tipo: 'compra',
      productos: selectedProducts.map(p => ({
        id: p.id,
        nombre: p.nombre,
        cantidad: p.cantidad,
        precioCompra: p.precioCompra
      })),
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
                          <div className="text-sm text-gray-900">
                            {Array.isArray(order.productos) ? (
                              <span>{order.productos.length} producto(s)</span>
                            ) : (
                              <span>-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(order.fecha)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${parseFloat(order.total || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeColor(order.estado)}`}>
                            {order.estado || 'pendiente'}
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

                      {/* Selección de productos */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Productos <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2 mb-2">
                          <select
                            onChange={(e) => {
                              handleAddProduct(e.target.value);
                              e.target.value = '';
                            }}
                            className="flex-1 rounded-md border-gray-300 shadow-sm sm:text-sm"
                          >
                            <option value="">Seleccionar producto...</option>
                            {productos.filter(p => !selectedProducts.find(sp => sp.id === p.id)).map(p => (
                              <option key={p.id} value={p.id}>{p.nombre} - ${p.precio}</option>
                            ))}
                          </select>
                        </div>
                        {formErrors.productos && <p className="text-sm text-red-600">{formErrors.productos}</p>}

                        {/* Lista de productos seleccionados */}
                        {selectedProducts.length > 0 && (
                          <div className="border rounded-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Producto</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Cantidad</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Precio Compra</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Subtotal</th>
                                  <th className="px-3 py-2"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {selectedProducts.map(p => (
                                  <tr key={p.id}>
                                    <td className="px-3 py-2 text-sm">{p.nombre}</td>
                                    <td className="px-3 py-2">
                                      <input
                                        type="number"
                                        min="1"
                                        value={p.cantidad}
                                        onChange={(e) => handleProductQuantityChange(p.id, e.target.value)}
                                        className="w-20 rounded-md border-gray-300 shadow-sm sm:text-sm"
                                      />
                                    </td>
                                    <td className="px-3 py-2">
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={p.precioCompra}
                                        onChange={(e) => handleProductPriceChange(p.id, e.target.value)}
                                        className="w-24 rounded-md border-gray-300 shadow-sm sm:text-sm"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-sm font-medium">
                                      ${(p.cantidad * p.precioCompra).toFixed(2)}
                                    </td>
                                    <td className="px-3 py-2">
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveProduct(p.id)}
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Total y Estado */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="total" className="block text-sm font-medium text-gray-700">
                            Total ($)
                          </label>
                          <input
                            type="number"
                            name="total"
                            id="total"
                            step="0.01"
                            min="0"
                            value={currentOrder.total}
                            readOnly
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm"
                          />
                        </div>

                        <div>
                          <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                            Estado
                          </label>
                          <select
                            name="estado"
                            id="estado"
                            value={currentOrder.estado}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="procesando">Procesando</option>
                            <option value="enviado">Enviado</option>
                            <option value="recibido">Recibido</option>
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