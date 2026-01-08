import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// ==================== PRODUCTOS ====================

// Obtener todos los productos
export const getProducts = async () => {
  const response = await axios.get(`${API_URL}/productos`);
  return response.data;
};

// Crear un nuevo producto
export const createProduct = async (productData) => {
  const response = await axios.post(`${API_URL}/productos`, productData);
  return response.data;
};

// Eliminar un producto
export const deleteProduct = async (id) => {
  const response = await axios.delete(`${API_URL}/productos/${id}`);
  return response.data;
};

// Obtener producto por ID
export const getProductById = async (id) => {
  const response = await axios.get(`${API_URL}/productos/${id}`);
  return response.data;
};

// ==================== USUARIOS ====================

// Obtener todos los usuarios
export const getUsuarios = async () => {
  const response = await axios.get(`${API_URL}/usuarios`);
  return response.data;
};

// Crear un nuevo usuario
export const createUsuario = async (userData) => {
  const response = await axios.post(`${API_URL}/usuarios`, userData);
  return response.data;
};

// Actualizar un usuario existente
export const updateUsuario = async (id, userData) => {
  const response = await axios.put(`${API_URL}/usuarios/${id}`, userData);
  return response.data;
};

// Eliminar un usuario
export const deleteUsuario = async (id) => {
  const response = await axios.delete(`${API_URL}/usuarios/${id}`);
  return response.data;
};

// Obtener usuario por ID
export const getUsuarioById = async (id) => {
  const response = await axios.get(`${API_URL}/usuarios/${id}`);
  return response.data;
};

// ==================== ORDENES ====================

// Obtener todas las órdenes
export const getOrdenes = async () => {
  const response = await axios.get(`${API_URL}/ordenes`);
  return response.data;
};

// Crear una nueva orden
export const createOrden = async (ordenData) => {
  const response = await axios.post(`${API_URL}/ordenes`, ordenData);
  return response.data;
};

// Actualizar una orden existente
export const updateOrden = async (id, ordenData) => {
  const response = await axios.put(`${API_URL}/ordenes/${id}`, ordenData);
  return response.data;
};

// Eliminar una orden
export const deleteOrden = async (id) => {
  const response = await axios.delete(`${API_URL}/ordenes/${id}`);
  return response.data;
};

// Obtener órdenes de compra
export const getOrdenesCompra = async () => {
  const response = await axios.get(`${API_URL}/ordenes/compra`);
  return response.data;
};

// Obtener órdenes de venta
export const getOrdenesVenta = async () => {
  const response = await axios.get(`${API_URL}/ordenes/venta`);
  return response.data;
};

// ==================== PRODUCTOS POR CATEGORÍA ====================

// Obtener productos por categoría
export const getProductsByCategory = async (categoryId) => {
  const response = await axios.get(`${API_URL}/productos/categoria/${categoryId}`);
  return response.data;
};

// ==================== AUTENTICACIÓN ====================

// Función para hacer login
export const loginUser = async ({ email, password }) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data; // Devuelve { user, token }
};