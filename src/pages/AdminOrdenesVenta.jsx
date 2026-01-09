import React, { useState, useEffect, useCallback } from 'react';
import { getOrdenes, createOrden, updateOrden, deleteOrden, getProducts, getUsuarios } from '../models/httpClient';

/**
 * AdminOrdenesVenta - Página de administración CRUD de órdenes de venta a clientes
 * 
 * Características:
 * - Listar órdenes de venta en tabla responsive
 * - Crear nuevas órdenes de venta
 * - Editar órdenes existentes
 * - Eliminar órdenes con confirmación
 * - Manejo de errores visible
 * - Estados de carga
 */

const initialOrderState = {
  userId: '',
  items: [], // Array de { id, nombre, precio, cantidad }
  total: 0,
  estado: 'pendiente',
  direccionEnvio: '',
  metodoPago: 'efectivo',
  notas: '',
  tipo: 'venta',
  nombreCliente: '',
  telefonoCliente: '',
  emailCliente: '',
};

export default function AdminOrdenesVenta() {
  // Estados principales - DEBEN estar antes de cualquier return condicional
  const [ordenes, setOrdenes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Estados del formulario
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(initialOrderState);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Estado para confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, order: null });

  // Estados de UI para búsqueda de productos y usuarios
  const [productSearch, setProductSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Cargar órdenes (filtrando solo las de tipo venta)
  const fetchOrdenes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOrdenes();
      const allOrders = response.data || response || [];
      // Filtrar solo órdenes de venta (tipo === 'venta' o sin tipo definido)
      const ventaOrders = allOrders.filter(o => o.tipo === 'venta' || !o.tipo);
      setOrdenes(ventaOrders);
    } catch (err) {
      setError('Error al cargar las órdenes de venta. Por favor, intenta de nuevo.');
      console.error('Error fetching ordenes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar productos disponibles
  const fetchProductos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProducts();
      const allProducts = response.data || response || [];
      setProductos(allProducts);
    } catch (err) {
      setError('Error al cargar los productos. Por favor, intenta de nuevo.');
      console.error('Error fetching productos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar usuarios
  const fetchUsuarios = useCallback(async () => {
    try {
      const response = await getUsuarios();
      const allUsers = response.data || response || [];
      setUsuarios(allUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, []);

  useEffect(() => {
    fetchOrdenes();
    fetchProductos();
    fetchUsuarios();
  }, [fetchOrdenes, fetchProductos, fetchUsuarios]);

  // Filtrar productos por búsqueda
  useEffect(() => {
    if (productSearch.trim() === '') {
      setFilteredProducts([]);
    } else {
      const filtered = productos.filter(p =>
        p.nombre.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.id.toString().includes(productSearch)
      );
      setFilteredProducts(filtered.slice(0, 10));
    }
  }, [productSearch, productos]);

  // Filtrar usuarios por búsqueda de email
  useEffect(() => {
    if (userSearch.trim() === '') {
      setFilteredUsers([]);
    } else {
      const filtered = usuarios.filter(u =>
        (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
        (u.nombre && u.nombre.toLowerCase().includes(userSearch.toLowerCase())) ||
        (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase()))
      );
      setFilteredUsers(filtered.slice(0, 5));
    }
  }, [userSearch, usuarios]);

  // Recalcular total automáticamente
  useEffect(() => {
    const newTotal = currentOrder.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    setCurrentOrder(prev => ({ ...prev, total: newTotal }));
  }, [currentOrder.items]);

  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    if (!currentOrder.userId && !currentOrder.nombreCliente) errors.userId = 'Se requiere un ID de usuario o nombre de cliente';
    if (currentOrder.items.length === 0) errors.items = 'Debes seleccionar al menos un producto';
    if (!currentOrder.direccionEnvio.trim()) errors.direccionEnvio = 'La dirección de envío es requerida';
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

  // Abrir formulario para crear
  const handleCreate = () => {
    setCurrentOrder(initialOrderState);
    setIsEditing(false);
    setFormErrors({});
    setUserSearch('');
    setIsFormOpen(true);
  };

  // Abrir formulario para editar
  const handleEdit = (order) => {
    setCurrentOrder({
      id: order.id,
      userId: order.userId || '',
      items: order.items || [],
      total: order.total || 0,
      estado: order.estado || 'pendiente',
      direccionEnvio: order.shippingData?.address || order.direccionEnvio || '',
      metodoPago: order.paymentMethod || order.metodoPago || 'efectivo',
      notas: order.notas || '',
      tipo: 'venta',
      nombreCliente: order.shippingData?.fullName || '',
      telefonoCliente: order.shippingData?.phone || '',
      emailCliente: order.shippingData?.email || '',
    });
    setIsEditing(true);
    setFormErrors({});
    setUserSearch(order.shippingData?.email || '');
    setIsFormOpen(true);
  };

  // Guardar orden (crear o actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);

    // Formatear datos para el backend (coincidir con server.js)
    const orderData = {
      userId: currentOrder.userId || 'admin-manual',
      items: currentOrder.items,
      total: currentOrder.total,
      paymentMethod: currentOrder.metodoPago,
      shippingData: {
        fullName: currentOrder.nombreCliente || `Cliente ID: ${currentOrder.userId}`,
        address: currentOrder.direccionEnvio,
        phone: currentOrder.telefonoCliente || '',
        email: currentOrder.emailCliente || '',
        city: 'Ecuador', // Valor por defecto
      },
      estado: currentOrder.estado,
      notas: currentOrder.notas,
      tipo: 'venta',
      fecha: currentOrder.fecha || new Date().toISOString(),
    };

    try {
      if (isEditing) {
        await updateOrden(currentOrder.id, orderData);
        setSuccessMessage('Orden de venta actualizada exitosamente');
      } else {
        await createOrden(orderData);
        setSuccessMessage('Orden de venta creada exitosamente');
      }
      setIsFormOpen(false);
      fetchOrdenes();
    } catch (err) {
      setError(isEditing
        ? 'Error al actualizar la orden de venta. Por favor, intenta de nuevo.'
        : 'Error al crear la orden de venta. Por favor, intenta de nuevo.'
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
      setSuccessMessage('Orden de venta eliminada exitosamente');
      setDeleteConfirm({ open: false, order: null });
      fetchOrdenes();
    } catch (err) {
      setError('Error al eliminar la orden de venta. Por favor, intenta de nuevo.');
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
      case 'completado': return 'bg-green-100 text-green-800';
      case 'enviado': return 'bg-blue-100 text-blue-800';
      case 'procesando': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Formatear fecha con fallback
  const formatDate = (dateString, fallback) => {
    const finalDate = dateString || fallback;
    if (!finalDate) return 'Sin fecha';
    try {
      const date = new Date(finalDate);
      return date.toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Órdenes de Venta a Clientes</h1>
          <p className="mt-2 text-gray-600">Gestiona las órdenes de venta registradas por clientes</p>
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Cargando órdenes de venta...</span>
          </div>
        ) : (
          /* Tabla de órdenes */
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Orden
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
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
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <p className="mt-2 text-sm">No hay órdenes de venta registradas</p>
                        <button onClick={handleCreate} className="mt-4 text-indigo-600 hover:text-indigo-500 font-medium">
                          Crear la primera orden de venta
                        </button>
                      </td>
                    </tr>
                  ) : (
                    ordenes.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                              <div className="text-sm text-gray-500">{order.metodoPago || 'Sin método'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Usuario #{order.userId}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{order.direccionEnvio || 'Sin dirección'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(order.fecha, order.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">${parseFloat(order.total || 0).toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeColor(order.estado)}`}>
                            {order.estado || 'pendiente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEdit(order)} className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors">
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
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Orden de Venta
          </button>
        </div>

        {/* Modal de formulario */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsFormOpen(false)}></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                      {isEditing ? 'Editar Orden de Venta' : 'Nueva Orden de Venta'}
                    </h3>

                    <div className="space-y-4">
                      {/* Buscador de Usuarios por Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Buscar Cliente por Email <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1 relative">
                          <input
                            type="text"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className={`block w-full rounded-md shadow-sm sm:text-sm ${formErrors.userId ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="ejemplo@correo.com"
                          />
                          {filteredUsers.length > 0 && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                              {filteredUsers.map(u => (
                                <button
                                  key={u.id}
                                  type="button"
                                  onClick={() => {
                                    setCurrentOrder(prev => ({
                                      ...prev,
                                      userId: u.id,
                                      nombreCliente: u.nombre || u.name || '',
                                      emailCliente: u.email || '',
                                      telefonoCliente: u.telefono || '',
                                      direccionEnvio: u.direccion || prev.direccionEnvio
                                    }));
                                    setUserSearch(u.email);
                                    setFilteredUsers([]);
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 border-b border-gray-100 last:border-0"
                                >
                                  <p className="text-sm font-medium text-gray-900">{u.email}</p>
                                  <p className="text-xs text-gray-500">{u.nombre || u.name || 'Sin nombre'}</p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {formErrors.userId && <p className="mt-1 text-sm text-red-600">{formErrors.userId}</p>}
                      </div>

                      {/* Info del pedido solo lectura / estado */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="total" className="block text-sm font-medium text-gray-700">
                            Total de la Orden
                          </label>
                          <div className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md shadow-sm text-sm font-bold text-gray-900">
                            ${currentOrder.total.toFixed(2)}
                          </div>
                          <p className="mt-1 text-xs text-gray-500 italic">Se calcula según productos</p>
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
                            <option value="completado">Completado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="metodoPago" className="block text-sm font-medium text-gray-700">
                            Método de Pago
                          </label>
                          <select
                            name="metodoPago"
                            id="metodoPago"
                            value={currentOrder.metodoPago}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                          >
                            <option value="efectivo">Efectivo</option>
                            <option value="tarjeta">Tarjeta</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="paypal">PayPal</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">ID Usuario Seleccionado</label>
                          <div className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500">
                            {currentOrder.userId || 'Ninguno'}
                          </div>
                        </div>
                      </div>

                      {/* Dirección de Envío */}
                      <div>
                        <label htmlFor="direccionEnvio" className="block text-sm font-medium text-gray-700">
                          Dirección de Envío <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="direccionEnvio"
                          id="direccionEnvio"
                          rows={2}
                          value={currentOrder.direccionEnvio}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${formErrors.direccionEnvio ? 'border-red-300' : 'border-gray-300'}`}
                          placeholder="Dirección completa de envío..."
                        />
                        {formErrors.direccionEnvio && <p className="mt-1 text-sm text-red-600">{formErrors.direccionEnvio}</p>}
                      </div>

                      {/* Clientes Info */}
                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <h4 className="text-sm font-bold text-gray-800 mb-3">Información del Cliente</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                            <input
                              type="text" name="nombreCliente" value={currentOrder.nombreCliente} onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" placeholder="Juan Perez"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input
                              type="text" name="telefonoCliente" value={currentOrder.telefonoCliente} onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" placeholder="0987654321"
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700">Email (opcional)</label>
                          <input
                            type="email" name="emailCliente" value={currentOrder.emailCliente} onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" placeholder="cliente@ejemplo.com"
                          />
                        </div>
                      </div>

                      {/* Selección de Productos (Mini Carrito) */}
                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <h4 className="text-sm font-bold text-gray-800 mb-3">Productos de la Orden</h4>

                        {/* Buscador de productos */}
                        <div className="mb-3 relative">
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </span>
                            <input
                              type="text"
                              placeholder="Buscar producto por nombre o ID..."
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              className="block w-full rounded-none rounded-r-md border-gray-300 shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>

                          {/* Resultados de búsqueda flotante */}
                          {filteredProducts.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {filteredProducts.map(p => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    const exists = currentOrder.items.find(item => item.id === p.id);
                                    if (p.stock <= 0) {
                                      // No hacer nada o mostrar un aviso (opcional)
                                      return;
                                    }
                                    if (exists) {
                                      if (exists.cantidad < p.stock) {
                                        setCurrentOrder(prev => ({
                                          ...prev,
                                          items: prev.items.map(item => item.id === p.id ? { ...item, cantidad: item.cantidad + 1 } : item)
                                        }));
                                      }
                                    } else {
                                      setCurrentOrder(prev => ({
                                        ...prev,
                                        items: [...prev.items, { id: p.id, nombre: p.nombre, precio: p.precio, cantidad: 1, imagen: p.imagen }]
                                      }));
                                    }
                                    setProductSearch('');
                                  }}
                                  disabled={p.stock <= 0}
                                  className={`w-full text-left px-4 py-2 flex items-center gap-3 border-b border-gray-100 last:border-0 ${p.stock <= 0 ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-indigo-50'}`}
                                >
                                  <img src={p.imagen} alt="" className="h-8 w-8 object-cover rounded" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{p.nombre}</p>
                                    <p className="text-xs text-gray-500">${p.precio} - ID: {p.id}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                      Stock: {p.stock || 0}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Lista de productos seleccionados */}
                        <div className="bg-gray-50 rounded-lg p-3 min-h-[100px]">
                          {currentOrder.items.length === 0 ? (
                            <p className="text-center text-gray-500 text-sm py-8">No has seleccionado productos</p>
                          ) : (
                            <ul className="divide-y divide-gray-200">
                              {currentOrder.items.map(item => (
                                <li key={item.id} className="py-2 flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <img src={item.imagen} alt="" className="h-8 w-8 rounded object-cover" />
                                    <div>
                                      <p className="text-sm font-medium">{item.nombre}</p>
                                      <p className="text-xs text-gray-500">${item.precio} c/u</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center border border-gray-300 rounded overflow-hidden h-7">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (item.cantidad > 1) {
                                            setCurrentOrder(prev => ({
                                              ...prev,
                                              items: prev.items.map(i => i.id === item.id ? { ...i, cantidad: i.cantidad - 1 } : i)
                                            }));
                                          }
                                        }}
                                        className="px-2 hover:bg-gray-200"
                                      >-</button>
                                      <span className="px-2 text-xs font-bold">{item.cantidad}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const p = productos.find(prod => prod.id === item.id);
                                          if (p && item.cantidad < p.stock) {
                                            setCurrentOrder(prev => ({
                                              ...prev,
                                              items: prev.items.map(i => i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i)
                                            }));
                                          }
                                        }}
                                        disabled={(() => {
                                          const p = productos.find(prod => prod.id === item.id);
                                          return !p || item.cantidad >= p.stock;
                                        })()}
                                        className="px-2 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                      >+</button>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setCurrentOrder(prev => ({ ...prev, items: prev.items.filter(i => i.id !== item.id) }))}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        {formErrors.items && <p className="mt-1 text-sm text-red-600">{formErrors.items}</p>}

                        {/* Resumen de total */}
                        <div className="mt-4 flex justify-between items-center bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                          <span className="text-sm font-bold text-indigo-900">Total a pagar:</span>
                          <span className="text-xl font-black text-indigo-700">${currentOrder.total.toFixed(2)}</span>
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
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
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
                        Eliminar orden de venta
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          ¿Estás seguro de que deseas eliminar la orden de venta <strong>#{deleteConfirm.order?.id}</strong>?
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