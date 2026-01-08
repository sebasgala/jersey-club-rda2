// Mínima implementación de ejemplo; ajusta la URL según tu API
export const getUsuarioById = async (id) => {
  if (!id) throw new Error('id requerido');
  const res = await fetch(`/api/usuarios/${id}`);
  if (!res.ok) {
    const msg = await res.text().catch(() => 'Error al obtener usuario');
    throw new Error(msg || 'Error al obtener usuario');
  }
  const data = await res.json();
  // Normaliza si tu API envía {status, data}
  return data?.data ?? data;
};
