const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
export const SERVER_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

function getHeaders(isFormData = false) {
  const headers = {}
  if (!isFormData) headers['Content-Type'] = 'application/json'
  const token = localStorage.getItem('admin_token')
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function request(method, path, body = null) {
  const options = { method, headers: getHeaders(false) }
  if (body) options.body = JSON.stringify(body)
  const res = await fetch(`${API_BASE}${path}`, options)

  if (res.status === 401) {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_logged')
    window.location.href = '/login'
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud')
  return data
}

// Petición multipart/form-data (para subida de archivos)
async function requestForm(method, path, formData) {
  const res = await fetch(`${API_BASE}${path}`, { 
    method, 
    headers: getHeaders(true),
    body: formData 
  })

  if (res.status === 401) {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_logged')
    window.location.href = '/login'
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud')
  return data
}

// --- Autenticación ---
export const authApi = {
  login: (credentials) => request('POST', '/auth/login', credentials),
}

// --- Ingresos y Tesorería ---
export const ingresosApi = {
  getAll:  ()         => request('GET',    '/ingresos'),
  getById: (id)       => request('GET',    `/ingresos/${id}`),
  create:  (body)     => request('POST',   '/ingresos', body),
  update:  (id, body) => request('PUT',    `/ingresos/${id}`, body),
  delete:  (id)       => request('DELETE', `/ingresos/${id}`),
}

// --- Blog Gestor CMS ---
export const blogApi = {
  getPublic:    ()         => request('GET',       '/blog'),
  getBySlug:   (slug)     => request('GET',       `/blog/post/${slug}`),
  getAllAdmin:  ()         => request('GET',       '/blog/admin/all'),
  getById:     (id)        => request('GET',       `/blog/admin/${id}`),
  create:      (body)      => request('POST',      '/blog', body),
  update:      (id, body)  => request('PUT',       `/blog/${id}`, body),
  delete:      (id)        => request('DELETE',    `/blog/${id}`),
  uploadImagen: (formData) => requestForm('POST',  '/blog/upload-imagen', formData),
}

// --- Usuarios ---
export const usuariosApi = {
  getAll:  ()         => request('GET',    '/usuarios'),
  getById: (id)       => request('GET',    `/usuarios/${id}`),
  create:  (body)     => request('POST',   '/usuarios', body),
  update:  (id, body) => request('PUT',    `/usuarios/${id}`, body),
  delete:  (id)       => request('DELETE', `/usuarios/${id}`),
}

// --- Productos ---
export const productosApi = {
  getAll:  ()              => request('GET',    '/productos'),
  getById: (id)            => request('GET',    `/productos/${id}`),
  create:  (formData)      => requestForm('POST',   '/productos', formData),
  update:  (id, formData)  => requestForm('PUT',    `/productos/${id}`, formData),
  delete:  (id)            => request('DELETE', `/productos/${id}`),
}

// --- Categorias ---
export const categoriasApi = {
  getAll:  ()         => request('GET',    '/categorias'),
  getById: (id)       => request('GET',    `/categorias/${id}`),
  create:  (body)     => request('POST',   '/categorias', body),
  update:  (id, body) => request('PUT',    `/categorias/${id}`, body),
  delete:  (id)       => request('DELETE', `/categorias/${id}`),
}

// --- Pedidos ---
export const pedidosApi = {
  getAll:       ()             => request('GET',    '/pedidos'),
  getById:      (identifier)   => request('GET',    `/pedidos/${identifier}`),
  create:       (body)         => request('POST',   '/pedidos', body),
  updateEstado: (id, estado)   => request('PUT',    `/pedidos/${id}/estado`, { estado_pedido: estado }),
  updateNotas:  (id, notas)    => request('PUT',    `/pedidos/${id}/notas`, { notas }),
  delete:       (id)           => request('DELETE', `/pedidos/${id}`),
}

// --- Citas ---
export const citasApi = {
  getAll:  ()         => request('GET',    '/citas'),
  getById: (id)       => request('GET',    `/citas/${id}`),
  create:  (body)     => request('POST',   '/citas', body),
  update:  (id, body) => request('PUT',    `/citas/${id}`, body),
  delete:  (id)       => request('DELETE', `/citas/${id}`),
}

// --- Clientes ---
export const clientesApi = {
  getAll:  ()         => request('GET',    '/clientes'),
  getById: (id)       => request('GET',    `/clientes/${id}`),
  create:  (body)     => request('POST',   '/clientes', body),
  update:  (id, body) => request('PUT',    `/clientes/${id}`, body),
  delete:  (id)       => request('DELETE', `/clientes/${id}`),
}

// --- Dashboard ---
export const dashboardApi = {
  getResumenDiario: () => request('GET', '/dashboard/resumen-diario'),
}

// --- Menus Semanales ---
export const menusApi = {
  getByCliente: (clienteId)   => request('GET',    `/menus/cliente/${clienteId}`),
  getById:      (id)          => request('GET',    `/menus/${id}`),
  create:       (body)        => request('POST',   '/menus', body),
  update:       (id, body)    => request('PUT',    `/menus/${id}`, body),
  delete:       (id)          => request('DELETE', `/menus/${id}`),
}

// --- Expedientes Clínicos y Mediciones ---
export const expedientesApi = {
  getByCliente:    (clienteId)   => request('GET', `/expedientes/cliente/${clienteId}`),
  updateNotas:     (clienteId, body) => request('PUT', `/expedientes/cliente/${clienteId}`, body),
  createMedicion:  (body)        => request('POST', '/expedientes/mediciones', body),
  updateMedicion:  (id, body)    => request('PUT', `/expedientes/mediciones/${id}`, body),
  deleteMedicion:  (id)          => request('DELETE', `/expedientes/mediciones/${id}`),
}

// --- Zonas de Envío ---
export const zonasEnvioApi = {
  getAll:  ()         => request('GET',    '/zonas-envio'),
  getById: (id)       => request('GET',    `/zonas-envio/${id}`),
  create:  (body)     => request('POST',   '/zonas-envio', body),
  update:  (id, body) => request('PUT',    `/zonas-envio/${id}`, body),
  delete:  (id)       => request('DELETE', `/zonas-envio/${id}`),
}

// --- Asistente de IA (Gemini) ---
export const iaApi = {
  sintetizarNotas: (body) => request('POST', '/ia/sintetizar-notas', body),
  chatAsistente:   (body) => request('POST', '/ia/chat-asistente', body),
}

// --- Órdenes de Compra y Envíos ---
export const ordenesApi = {
  getAll:            ()         => request('GET',    '/ordenes'),
  getById:           (id)       => request('GET',    `/ordenes/${id}`),
  create:            (body)     => request('POST',   '/ordenes', body),
  updateEstadoOrden: (id, body) => request('PUT',    `/ordenes/${id}/estado-orden`, body),
  updateEstadoEnvio: (id, body) => request('PUT',    `/ordenes/${id}/estado-envio`, body),
  delete:            (id)       => request('DELETE', `/ordenes/${id}`),
}
