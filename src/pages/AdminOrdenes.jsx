import React, { useState, useEffect, useCallback } from 'react';
import {
  getOrdenes,
  createOrden,
  updateOrden,
  deleteOrden,
} from '../models/httpClient';

/**
 * AdminOrdenes - Página de administración CRUD de órdenes/pedidos
 * 
 * Características:
 * - Listar órdenes en tabla responsive
 * - Crear nuevas órdenes
 * - Editar órdenes existentes
 * - Eliminar órdenes con confirmación
 * - Manejo de errores visible
 * - Estados de carga
 */

const initialOrderState = {
  userId: '',
  productos: '',
  total: '',
  estado: 'pendiente',
  direccionEnvio: '',
  metodoPago: 'efectivo',
  notas: '',
};

export default function AdminOrdenes() {
  // Estados principales - DEBEN estar antes de cualquier return condicional
  const [ordenes, setOrdenes] = useState([]);
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

  // Cargar órdenes
  const fetchOrdenes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOrdenes();
      setOrdenes(response.data || response || []);
    } catch (err) {
      setError('Error al cargar las órdenes. Por favor, intenta de nuevo.');
      console.error('Error fetching ordenes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrdenes();
  }, [fetchOrdenes]);

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
    if (!currentOrder.userId) errors.userId = 'El ID de usuario es requerido';
    if (!currentOrder.total || currentOrder.total <= 0) errors.total = 'El total debe ser mayor a 0';
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
    // Limpiar error del campo al escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
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
      userId: order.userId || '',
      productos: Array.isArray(order.productos) ? JSON.stringify(order.productos) : (order.productos || ''),
      total: order.total || '',
      estado: order.estado || 'pendiente',
      direccionEnvio: order.direccionEnvio || '',
      metodoPago: order.metodoPago || 'efectivo',
      notas: order.notas || '',
    });
    setIsEditing(true);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Guardar orden (crear o actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);

    const orderData = {
      ...currentOrder,
      userId: parseInt(currentOrder.userId, 10),
      total: parseFloat(currentOrder.total),
      fecha: currentOrder.fecha || new Date().toISOString(),
    };

    // Intentar parsear productos si es JSON
    try {
      if (typeof orderData.productos === 'string' && orderData.productos.trim()) {
        orderData.productos = JSON.parse(orderData.productos);
      }
    } catch (e) {
      // Si no es JSON válido, dejarlo como string
    }

    try {
      if (isEditing) {
        await updateOrden(currentOrder.id, orderData);
        setSuccessMessage('Orden actualizada exitosamente');
      } else {
        await createOrden(orderData);
        setSuccessMessage('Orden creada exitosamente');
      }
      setIsFormOpen(false);
      fetchOrdenes();
    } catch (err) {
      setError(isEditing 
        ? 'Error al actualizar la orden. Por favor, intenta de nuevo.'
        : 'Error al crear la orden. Por favor, intenta de nuevo.'
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
      setSuccessMessage('Orden eliminada exitosamente');
      setDeleteConfirm({ open: false, order: null });
      fetchOrdenes();
    } catch (err) {
      setError('Error al eliminar la orden. Por favor, intenta de nuevo.');
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
            <span className="ml-3 text-gray-600">Cargando órdenes...</span>
          </div>
        ) : (
          /* Tabla de órdenes */
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <p className="mt-2 text-sm">No hay órdenes registradas</p>
                        <button
                          onClick={handleCreate}
                          className="mt-4 text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                          Crear la primera orden
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
                              <div className="text-sm text-gray-500">
                                {order.metodoPago || 'Sin método'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Usuario #{order.userId}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {order.direccionEnvio || 'Sin dirección'}
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
                          <button
                            onClick={() => handleEdit(order)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors"
                          >
                            <svg className="h-5 w-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="ml-1">Editar</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(order)}
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

        {/* Botón para agregar nueva orden */}
        <div className="mt-8">
          <button
            onClick={handleCreate}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Agregar Nueva Orden
          </button>
        </div>

        {/* Modal de formulario */}
        {isFormOpen && (
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
                      {isEditing ? 'Editar Orden' : 'Nueva Orden'}
                    </h3>

                    <div className="space-y-4">
                      {/* Usuario ID y Total */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                            ID Usuario <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="userId"
                            id="userId"
                            value={currentOrder.userId}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                              formErrors.userId 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                            }`}
                            placeholder="123"
                          />
                          {formErrors.userId && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.userId}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="total" className="block text-sm font-medium text-gray-700">
                            Total ($) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="total"
                            id="total"
                            step="0.01"
                            min="0"
                            value={currentOrder.total}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                              formErrors.total 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                            }`}
                            placeholder="0.00"
                          />
                          {formErrors.total && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.total}</p>
                          )}
                        </div>
                      </div>

                      {/* Estado y Método de Pago */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                            Estado
                          </label>
                          <select
                            name="estado"
                            id="estado"
                            value={currentOrder.estado}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="procesando">Procesando</option>
                            <option value="enviado">Enviado</option>
                            <option value="completado">Completado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="metodoPago" className="block text-sm font-medium text-gray-700">
                            Método de Pago
                          </label>
                          <select
                            name="metodoPago"
                            id="metodoPago"
                            value={currentOrder.metodoPago}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="efectivo">Efectivo</option>
                            <option value="tarjeta">Tarjeta</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="paypal">PayPal</option>
                          </select>
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
                          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                            formErrors.direccionEnvio 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                          }`}
                          placeholder="Dirección completa de envío..."
                        />
                        {formErrors.direccionEnvio && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.direccionEnvio}</p>
                        )}
                      </div>

                      {/* Productos (JSON) */}
                      <div>
                        <label htmlFor="productos" className="block text-sm font-medium text-gray-700">
                          Productos (JSON)
                        </label>
                        <textarea
                          name="productos"
                          id="productos"
                          rows={3}
                          value={currentOrder.productos}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono text-xs"
                          placeholder='[{"id": 1, "cantidad": 2, "precio": 29.99}]'
                        />
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
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Notas adicionales..."
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
        )}

        {/* Modal de confirmación de eliminación */}
        {deleteConfirm.open && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                aria-hidden="true"
                onClick={handleDeleteCancel}
              ></div>

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
                        Eliminar orden
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          ¿Estás seguro de que deseas eliminar la orden <strong>#{deleteConfirm.order?.id}</strong>? 
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
        )}
      </div>
    </div>
  );
}