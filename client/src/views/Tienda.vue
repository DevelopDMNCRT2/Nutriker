<template>
  <div class="tienda-container">
    <!-- Header de la Tienda -->
    <header class="tienda-header">
      <div class="header-content">
        <h1 class="tienda-title">Tienda NutriKer</h1>
        <p class="tienda-subtitle">Suplementos, guías y productos seleccionados por la Dra. Karla para potenciar tu salud.</p>
      </div>

      <!-- Botón Flotante / Acceso al Carrito -->
      <button @click="cartStore.toggleCart(true)" class="btn-carrito">
        🛒 Carrito
        <span v-if="cartStore.cartCount > 0" class="carrito-badge">{{ cartStore.cartCount }}</span>
      </button>
    </header>

    <!-- Filtros y Búsqueda -->
    <div class="tienda-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar producto por nombre..."
        class="input-search"
      />
    </div>

    <!-- Estado de Carga -->
    <div v-if="loading" class="loading-state">
      <p>Cargando catálogo de productos...</p>
    </div>

    <!-- Sin Productos -->
    <div v-else-if="productosFiltrados.length === 0" class="empty-state">
      <p>No se encontraron productos disponibles en la tienda.</p>
    </div>

    <!-- Grid de Productos -->
    <div v-else class="productos-grid">
      <div v-for="producto in productosFiltrados" :key="producto.id" class="producto-card">
        <div class="producto-image-wrapper">
          <img
            v-if="producto.imagen_principal"
            :src="producto.imagen_principal"
            :alt="producto.nombre"
            class="producto-img"
          />
          <div v-else class="producto-no-img">Sin imagen</div>
        </div>

        <div class="producto-info">
          <h3 class="producto-nombre">{{ producto.nombre }}</h3>
          <p class="producto-descripcion">{{ producto.descripcion || 'Producto oficial NutriKer' }}</p>

          <div class="producto-meta">
            <span class="producto-precio">${{ Number(producto.precio).toFixed(2) }}</span>
            <span class="producto-stock" :class="{ 'sin-stock': Number(producto.stock) <= 0 }">
              {{ Number(producto.stock) > 0 ? 'Disponible' : 'Agotado' }}
            </span>
          </div>

          <button
            @click="cartStore.addToCart(producto)"
            :disabled="Number(producto.stock) <= 0"
            class="btn-agregar"
          >
            {{ Number(producto.stock) > 0 ? 'Agregar al Carrito' : 'Agotado' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal / Sidebar de Carrito y Checkout -->
    <div v-if="cartStore.isCartOpen" class="cart-overlay" @click.self="cartStore.toggleCart(false)">
      <div class="cart-drawer">
        <div class="cart-header">
          <h2>Tu Carrito de Compras</h2>
          <button @click="cartStore.toggleCart(false)" class="btn-close">&times;</button>
        </div>

        <!-- Confirmación de Compra Exitosa -->
        <div v-if="ordenCompletada" class="checkout-success">
          <h3>¡Pedido Confirmado!</h3>
          <p>Tu orden <strong>#{{ ordenCompletada.id }}</strong> ha sido registrada exitosamente.</p>
          <p class="text-sm">Te hemos enviado un correo de confirmación. Gracias por tu compra en NutriKer.</p>
          <button @click="cerrarConfirmacion" class="btn-confirmar-ok">Aceptar</button>
        </div>

        <template v-else>
          <!-- Ítems del Carrito -->
          <div v-if="cartStore.items.length === 0" class="cart-empty">
            <p>Tu carrito está vacío.</p>
          </div>

          <div v-else class="cart-content">
            <div class="cart-items-list">
              <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
                <img v-if="item.imagen_principal" :src="item.imagen_principal" class="item-thumb" />
                <div class="item-details">
                  <span class="item-title">{{ item.nombre }}</span>
                  <span class="item-price">${{ item.precio.toFixed(2) }}</span>
                </div>
                <div class="item-qty">
                  <button @click="cartStore.updateQuantity(item.id, item.cantidad - 1)">-</button>
                  <span>{{ item.cantidad }}</span>
                  <button @click="cartStore.updateQuantity(item.id, item.cantidad + 1)">+</button>
                </div>
                <button @click="cartStore.removeFromCart(item.id)" class="item-remove">&times;</button>
              </div>
            </div>

            <!-- Selección de Zona de Envío -->
            <div class="checkout-section">
              <label class="form-label">Zona de Envío *</label>
              <select v-model="zonaSeleccionadaId" class="form-select">
                <option value="">Selecciona tu zona de envío</option>
                <option v-for="zona in zonasEnvio" :key="zona.id" :value="zona.id">
                  {{ zona.nombre }} (${{ Number(zona.costo).toFixed(2) }}) — {{ zona.tiempo_entrega }}
                </option>
              </select>
            </div>

            <!-- Resumen de Costos -->
            <div class="cart-summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>${{ cartStore.cartSubtotal.toFixed(2) }}</span>
              </div>
              <div class="summary-row">
                <span>Envío:</span>
                <span>${{ costoEnvio.toFixed(2) }}</span>
              </div>
              <div class="summary-row total-row">
                <span>Total:</span>
                <span>${{ totalPedido.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Botón para Iniciar Checkout -->
            <button
              v-if="!mostrandoFormCheckout"
              @click="mostrandoFormCheckout = true"
              :disabled="!zonaSeleccionadaId"
              class="btn-checkout-start"
            >
              {{ zonaSeleccionadaId ? 'Proceder al Pago / Checkout' : 'Selecciona una zona de envío' }}
            </button>

            <!-- Formulario de Datos del Cliente -->
            <form v-else @submit.prevent="procesarCheckout" class="checkout-form">
              <h3>Datos de Envío y Contacto</h3>

              <div v-if="errorCheckout" class="checkout-error">
                {{ errorCheckout }}
              </div>

              <div class="form-group">
                <label>Nombre Completo *</label>
                <input v-model="formCheckout.nombre" type="text" required placeholder="Ej. Ana María López" />
              </div>

              <div class="form-group">
                <label>Correo Electrónico *</label>
                <input v-model="formCheckout.email" type="email" required placeholder="correo@ejemplo.com" />
              </div>

              <div class="form-group">
                <label>Teléfono de Contacto (10 dígitos) *</label>
                <input
                  v-model="formCheckout.telefono"
                  type="tel"
                  maxlength="10"
                  required
                  placeholder="Ej. 5555123456"
                  @input="formCheckout.telefono = formCheckout.telefono.replace(/\D/g, '').slice(0, 10)"
                />
              </div>

              <div class="form-group">
                <label>Dirección Completa de Entrega *</label>
                <textarea v-model="formCheckout.direccion" required rows="2" placeholder="Calle, número, zona y referencias..."></textarea>
              </div>

              <div class="form-actions">
                <button type="button" @click="mostrandoFormCheckout = false" class="btn-cancelar">Volver</button>
                <button type="submit" :disabled="enviandoCheckout" class="btn-confirmar-compra">
                  {{ enviandoCheckout ? 'Procesando...' : 'Confirmar Pedido' }}
                </button>
              </div>
            </form>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()

const productos = ref([])
const zonasEnvio = ref([])
const loading = ref(true)
const searchQuery = ref('')

const zonaSeleccionadaId = ref('')
const mostrandoFormCheckout = ref(false)
const enviandoCheckout = ref(false)
const errorCheckout = ref('')
const ordenCompletada = ref(null)

const formCheckout = ref({
  nombre: '',
  email: '',
  telefono: '',
  direccion: ''
})

const fetchDatos = async () => {
  try {
    loading.value = true
    const [prodsData, zonasData] = await Promise.all([
      api.get('/public/productos').catch(() => []),
      api.get('/public/zonas-envio').catch(() => [])
    ])
    productos.value = prodsData
    zonasEnvio.value = zonasData
  } catch (error) {
    console.error('Error al cargar tienda:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDatos()
})

const productosFiltrados = computed(() => {
  if (!searchQuery.value.trim()) return productos.value
  const q = searchQuery.value.toLowerCase().trim()
  return productos.value.filter(p => p.nombre && p.nombre.toLowerCase().includes(q))
})

const zonaSeleccionada = computed(() => {
  return zonasEnvio.value.find(z => z.id === zonaSeleccionadaId.value)
})

const costoEnvio = computed(() => {
  return zonaSeleccionada.value ? Number(zonaSeleccionada.value.costo) : 0
})

const totalPedido = computed(() => {
  return cartStore.cartSubtotal + costoEnvio.value
})

const procesarCheckout = async () => {
  try {
    enviandoCheckout.value = true
    errorCheckout.value = ''

    if (!zonaSeleccionadaId.value) {
      errorCheckout.value = 'Por favor selecciona una zona de envío.'
      enviandoCheckout.value = false
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formCheckout.value.email.trim())) {
      errorCheckout.value = 'Por favor ingresa un correo electrónico válido (ej. usuario@dominio.com).'
      enviandoCheckout.value = false
      return
    }

    const telefonoLimpio = formCheckout.value.telefono.replace(/\D/g, '')
    if (telefonoLimpio.length !== 10) {
      errorCheckout.value = 'El número de teléfono debe contener exactamente 10 dígitos.'
      enviandoCheckout.value = false
      return
    }

    const payload = {
      cliente_nombre: formCheckout.value.nombre.trim(),
      cliente_email: formCheckout.value.email.trim(),
      cliente_telefono: telefonoLimpio,
      direccion_entrega: formCheckout.value.direccion.trim(),
      ciudad: 'Ciudad de Guatemala',
      zona_envio_id: zonaSeleccionadaId.value,
      metodo_pago: 'Tarjeta de Crédito/Débito',
      items: cartStore.items.map(i => ({
        producto_id: i.id,
        producto_nombre: i.nombre,
        cantidad: i.cantidad,
        precio_unitario: i.precio
      }))
    }

    const res = await api.post('/public/checkout', payload)
    ordenCompletada.value = res.orden || res || { id: 'N/A' }
    cartStore.clearCart()
  } catch (err) {
    errorCheckout.value = err.response?.data?.error || err.response?.data?.detalle || err.message || 'Error al procesar el pedido.'
  } finally {
    enviandoCheckout.value = false
  }
}

const cerrarConfirmacion = () => {
  ordenCompletada.value = null
  mostrandoFormCheckout.value = false
  cartStore.toggleCart(false)
}
</script>

<style scoped>
.tienda-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.tienda-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.tienda-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-main, #111827);
}

.tienda-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.btn-carrito {
  position: relative;
  background-color: var(--color-primary, #10b981);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.carrito-badge {
  background-color: #ef4444;
  color: white;
  border-radius: 9999px;
  padding: 0.15rem 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.tienda-bar {
  margin-bottom: 2rem;
}

.input-search {
  width: 100%;
  max-width: 400px;
  padding: 0.6rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #d1d5db;
  outline: none;
  font-size: 0.875rem;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: #6b7280;
}

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.producto-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.producto-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

.producto-image-wrapper {
  height: 180px;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.producto-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.producto-no-img {
  color: #9ca3af;
  font-size: 0.85rem;
}

.producto-info {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.producto-nombre {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.producto-descripcion {
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 1rem;
  flex: 1;
}

.producto-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.producto-precio {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-primary, #10b981);
}

.producto-stock {
  font-size: 0.75rem;
  font-weight: 600;
  color: #059669;
  background: #ecfdf5;
  padding: 0.2rem 0.5rem;
  border-radius: 0.375rem;
}

.producto-stock.sin-stock {
  color: #dc2626;
  background: #fef2f2;
}

.btn-agregar {
  width: 100%;
  background-color: var(--color-primary, #10b981);
  color: white;
  border: none;
  padding: 0.6rem;
  border-radius: 0.6rem;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-agregar:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

/* Modal Carrito */
.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: flex;
  justify-content: flex-end;
}

.cart-drawer {
  width: 100%;
  max-width: 440px;
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  overflow-y: auto;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 0.75rem;
}

.item-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 0.5rem;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 0.85rem;
  font-weight: 600;
}

.item-price {
  font-size: 0.8rem;
  color: #10b981;
  font-weight: 700;
}

.item-qty {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.item-qty button {
  width: 24px;
  height: 24px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 0.25rem;
  cursor: pointer;
}

.item-remove {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 1.2rem;
  cursor: pointer;
}

.checkout-section {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.form-select {
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  font-size: 0.85rem;
}

.cart-summary {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
}

.total-row {
  font-weight: 800;
  font-size: 1rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 0.5rem;
}

.btn-checkout-start {
  width: 100%;
  padding: 0.75rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-checkout-start:disabled {
  background: #9ca3af;
}

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkout-form h3 {
  font-size: 0.95rem;
  font-weight: 700;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-cancelar {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 0.5rem;
  cursor: pointer;
}

.btn-confirmar-compra {
  flex: 2;
  padding: 0.6rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 700;
  cursor: pointer;
}

.checkout-success {
  text-align: center;
  padding: 2rem 1rem;
}

.checkout-success h3 {
  color: #10b981;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.btn-confirmar-ok {
  margin-top: 1.5rem;
  padding: 0.6rem 2rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 700;
  cursor: pointer;
}

.checkout-error {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
}
</style>
