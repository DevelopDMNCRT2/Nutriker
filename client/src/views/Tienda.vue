<template>
  <div class="watercolor-tienda bg-white min-h-screen relative overflow-hidden">
    
    <!-- Elementos Flotantes Acuarela -->
    <img src="/img/watercolor_orange.jpg" alt="" class="floating-asset asset-orange spin-slow" />
    <img src="/img/watercolor_leaf.jpg" alt="" class="floating-asset asset-leaf float-slow" />
    <img src="/img/watercolor_leaf.jpg" alt="" class="floating-asset asset-leaf-2 float-slow-reverse" />

    <!-- Header Orgánico -->
    <header class="watercolor-header relative z-10">
      <div class="watercolor-header-content slide-up">
        <h1 class="watercolor-title">Nutre tu cuerpo,<br><span class="watercolor-text-peach">siente la frescura.</span></h1>
        <p class="watercolor-subtitle">Selección exclusiva de suplementos y guías de la Karla, pensados para acompañarte en cada paso de tu bienestar.</p>
        
        <div class="watercolor-search">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Encuentra tu producto ideal..."
            class="watercolor-input-search"
          />
        </div>
      </div>
      
      <div class="watercolor-header-actions slide-up">
        <button @click="cartStore.toggleCart(true)" class="watercolor-btn watercolor-btn-mint">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          Mi Bolsa <span v-if="cartStore.cartCount > 0" class="cart-badge">{{ cartStore.cartCount }}</span>
        </button>
      </div>
    </header>

    <!-- Transición de Onda -->
    <div class="wave-transition">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" class="wave-svg"><path fill="#fdfcfb" fill-opacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path></svg>
    </div>

    <div class="watercolor-container relative z-10 bg-soft">
      <div v-if="loading" class="watercolor-state">
        <p>Preparando frescura...</p>
      </div>

      <div v-else-if="productosFiltrados.length === 0" class="watercolor-state">
        <p>No encontramos productos que coincidan.</p>
      </div>

      <div v-else class="watercolor-grid">
        <div v-for="producto in productosFiltrados" :key="producto.id" class="watercolor-card slide-up">
          <div class="card-img-wrapper">
             <img v-if="producto.imagen_principal" :src="producto.imagen_principal" alt="" class="card-img" />
             <div v-else class="card-noimg">Natural</div>
          </div>

          <div class="card-content">
            <h3 class="card-title">{{ producto.nombre }}</h3>
            <p class="card-desc">{{ producto.descripcion || 'Aliado perfecto para tu salud y equilibrio diario.' }}</p>
            <div class="card-price">${{ Number(producto.precio).toFixed(2) }}</div>
            
            <button
              @click="cartStore.addToCart(producto)"
              :disabled="Number(producto.stock) <= 0"
              class="watercolor-btn"
              :class="Number(producto.stock) > 0 ? 'watercolor-btn-peach-outline' : 'watercolor-btn-disabled'"
            >
              {{ Number(producto.stock) > 0 ? 'Agregar a mi bolsa' : 'Agotado' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar Carrito (Drawer Acuarela) -->
    <div v-if="cartStore.isCartOpen" class="watercolor-overlay" @click.self="cartStore.toggleCart(false)">
      <div class="watercolor-drawer slide-left">
        <div class="drawer-header">
          <h2 class="drawer-title">Tu Bienestar</h2>
          <button @click="cartStore.toggleCart(false)" class="drawer-close">&times;</button>
        </div>

        <div class="drawer-body">
          <div v-if="ordenCompletada" class="success-state text-center">
            <h3 class="success-title">¡Todo listo!</h3>
            <p>Tu orden <strong>#{{ ordenCompletada.id }}</strong> ha sido confirmada con éxito.</p>
            <p class="mt-4">Pronto disfrutarás de tus productos.</p>
            <button @click="cerrarConfirmacion" class="watercolor-btn watercolor-btn-mint mt-6">Seguir explorando</button>
          </div>

          <template v-else>
            <div v-if="cartStore.items.length === 0" class="empty-state text-center">
              <p>Tu bolsa se siente muy ligera, agrega algo fresco.</p>
            </div>

            <div v-else class="cart-content">
              <div class="cart-items">
                <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
                  <div class="item-info">
                    <span class="item-name">{{ item.nombre }}</span>
                    <span class="item-price">${{ item.precio.toFixed(2) }}</span>
                  </div>
                  
                  <div class="item-actions">
                    <div class="qty-control">
                      <button @click="cartStore.updateQuantity(item.id, item.cantidad - 1)">-</button>
                      <span>{{ item.cantidad }}</span>
                      <button @click="cartStore.updateQuantity(item.id, item.cantidad + 1)">+</button>
                    </div>
                    <button @click="cartStore.removeFromCart(item.id)" class="item-remove">&times;</button>
                  </div>
                </div>
              </div>

              <!-- Zonas de Envío -->
              <div class="checkout-section mt-6">
                <select v-model="zonaSeleccionadaId" class="watercolor-select">
                  <option value="">Selecciona tu zona de entrega</option>
                  <option v-for="zona in zonasEnvio" :key="zona.id" :value="zona.id">
                    {{ zona.nombre }} (+${{ Number(zona.costo).toFixed(2) }})
                  </option>
                </select>
              </div>

              <div class="summary mt-6">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>${{ cartStore.cartSubtotal.toFixed(2) }}</span>
                </div>
                <div class="summary-row">
                  <span>Envío</span>
                  <span>${{ costoEnvio.toFixed(2) }}</span>
                </div>
                <div class="summary-row summary-total">
                  <span>Total a cuidar de ti</span>
                  <span>${{ totalPedido.toFixed(2) }}</span>
                </div>
              </div>

              <button
                v-if="!mostrandoFormCheckout"
                @click="mostrandoFormCheckout = true"
                :disabled="!zonaSeleccionadaId"
                class="watercolor-btn watercolor-btn-peach w-full mt-6"
              >
                {{ zonaSeleccionadaId ? 'Siguiente paso' : 'Elige una zona primero' }}
              </button>

              <!-- Formulario Suave -->
              <form v-else @submit.prevent="procesarCheckout" class="watercolor-form mt-8">
                <h3 class="form-title text-center mb-6">Detalles de Envío</h3>

                <div v-if="errorCheckout" class="error-msg text-center mb-4">
                  {{ errorCheckout }}
                </div>

                <div class="input-group">
                  <input v-model="formCheckout.nombre" type="text" required placeholder="Tu Nombre Completo" class="input-soft" />
                </div>

                <div class="input-group">
                  <input v-model="formCheckout.email" type="email" required placeholder="Tu Correo Electrónico" class="input-soft" />
                </div>

                <div class="input-group">
                  <input
                    v-model="formCheckout.telefono"
                    type="tel"
                    maxlength="10"
                    required
                    placeholder="Teléfono (10 dígitos)"
                    class="input-soft"
                    @input="formCheckout.telefono = formCheckout.telefono.replace(/\D/g, '').slice(0, 10)"
                  />
                </div>

                <div class="input-group">
                  <input v-model="formCheckout.direccion" type="text" required placeholder="Dirección Exacta de Entrega" class="input-soft" />
                </div>

                <div class="form-actions mt-8 flex justify-between">
                  <button type="button" @click="mostrandoFormCheckout = false" class="watercolor-btn watercolor-btn-gray w-half mr-2">Volver</button>
                  <button type="submit" :disabled="enviandoCheckout" class="watercolor-btn watercolor-btn-mint w-half ml-2">
                    {{ enviandoCheckout ? 'Procesando...' : 'Confirmar' }}
                  </button>
                </div>
              </form>
            </div>
          </template>
        </div>
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
      errorCheckout.value = 'Elige una zona de envío para continuar.'
      enviandoCheckout.value = false
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formCheckout.value.email.trim())) {
      errorCheckout.value = 'Ese correo no parece válido, revísalo por favor.'
      enviandoCheckout.value = false
      return
    }

    const telefonoLimpio = formCheckout.value.telefono.replace(/\D/g, '')
    if (telefonoLimpio.length !== 10) {
      errorCheckout.value = 'Necesitamos 10 dígitos en tu teléfono.'
      enviandoCheckout.value = false
      return
    }

    const payload = {
      paciente_nombre: formCheckout.value.nombre.trim(),
      paciente_email: formCheckout.value.email.trim(),
      paciente_telefono: telefonoLimpio,
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
    errorCheckout.value = err.response?.data?.error || err.response?.data?.detalle || err.message || 'Ups, algo salió mal.'
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
/* ── VARIABLES ACUARELA / ORGÁNICO ── */
.watercolor-tienda {
  --color-mint: #a7f3d0;
  --color-mint-hover: #6ee7b7;
  --color-peach: #fdba74;
  --color-peach-hover: #fb923c;
  --color-soft-bg: #fdfcfb;
  --color-text-main: #4a5568;
  --color-text-light: #718096;
  --font-serif: 'Lora', 'Merriweather', serif;
  --font-sans: 'Nunito', 'DM Sans', sans-serif;
  
  font-family: var(--font-sans);
  color: var(--color-text-main);
  background-color: #ffffff;
}

/* ── ANIMACIONES FLUIDAS ── */
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes float { 0% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } 100% { transform: translateY(0px) rotate(0deg); } }
@keyframes floatReverse { 0% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(15px) rotate(-5deg); } 100% { transform: translateY(0px) rotate(0deg); } }
@keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.slide-left { animation: slideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.float-slow { animation: float 8s ease-in-out infinite; }
.float-slow-reverse { animation: floatReverse 10s ease-in-out infinite; }
.spin-slow { animation: spinSlow 60s linear infinite; }

/* ── ELEMENTOS ACUARELA FLOTANTES ── */
.floating-asset {
  position: absolute;
  mix-blend-mode: multiply; /* Elimina fondo blanco de los jpg generados */
  opacity: 0.6;
  z-index: 0;
  pointer-events: none;
}
.asset-orange {
  top: -5%;
  right: -5%;
  width: 400px;
  filter: saturate(1.2) hue-rotate(-10deg);
}
.asset-leaf {
  top: 40%;
  left: -5%;
  width: 250px;
  filter: saturate(1.1);
}
.asset-leaf-2 {
  bottom: 10%;
  right: 5%;
  width: 180px;
  opacity: 0.4;
  transform: scaleX(-1);
}

/* ── UTILIDADES ── */
.bg-white { background: #ffffff; }
.bg-soft { background: var(--color-soft-bg); }
.text-center { text-align: center; }
.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
.mt-8 { margin-top: 2rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.w-full { width: 100%; }
.w-half { width: 48%; }
.flex { display: flex; }
.justify-between { justify-content: space-between; }
.watercolor-text-peach { color: var(--color-peach-hover); font-style: italic; }

/* ── BOTONES SUAVES ── */
.watercolor-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 2rem;
  border-radius: 99px;
  font-weight: 700;
  font-size: 0.95rem;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  border: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.watercolor-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.watercolor-btn-mint { background-color: var(--color-mint); color: #234e52; }
.watercolor-btn-mint:hover { background-color: var(--color-mint-hover); }

.watercolor-btn-peach { background-color: var(--color-peach); color: #7b341e; }
.watercolor-btn-peach:hover { background-color: var(--color-peach-hover); color: white; }

.watercolor-btn-peach-outline { background-color: white; color: var(--color-peach-hover); border: 2px solid var(--color-peach); }
.watercolor-btn-peach-outline:hover { background-color: var(--color-peach); color: white; }

.watercolor-btn-gray { background-color: #edf2f7; color: var(--color-text-main); }
.watercolor-btn-gray:hover { background-color: #e2e8f0; }

.watercolor-btn-disabled { background-color: #f7fafc; color: #a0aec0; cursor: not-allowed; box-shadow: none; }
.watercolor-btn-disabled:hover { transform: none; box-shadow: none; }

.cart-badge {
  background: white; color: var(--color-mint-hover);
  border-radius: 50%; padding: 0.1rem 0.5rem;
  font-size: 0.8rem; margin-left: 0.5rem;
}

/* ── HEADER ── */
.watercolor-header {
  padding: 8rem 10% 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 3rem;
}

.watercolor-title {
  font-family: var(--font-serif);
  font-size: clamp(2.5rem, 5vw, 4rem);
  color: var(--color-text-main);
  font-weight: 500;
  line-height: 1.15;
  margin-bottom: 1rem;
}

.watercolor-subtitle {
  font-size: 1.1rem;
  color: var(--color-text-light);
  max-width: 500px;
  line-height: 1.7;
  margin-bottom: 2rem;
}

.watercolor-input-search {
  width: 100%;
  max-width: 400px;
  padding: 1rem 1.8rem;
  border-radius: 99px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
  outline: none;
  font-size: 1rem;
  color: var(--color-text-main);
  transition: all 0.3s;
}
.watercolor-input-search:focus {
  background: white;
  border-color: var(--color-mint);
  box-shadow: 0 10px 40px rgba(167, 243, 208, 0.3);
}

/* ── ONDA SVG ── */
.wave-transition {
  width: 100%;
  line-height: 0;
  position: relative;
  z-index: 10;
  margin-bottom: -1px; /* fix rendering gap */
}
.wave-svg { width: 100%; height: auto; }

/* ── CONTENEDOR PRINCIPAL ── */
.watercolor-container {
  padding: 4rem 10% 8rem;
}

.watercolor-state {
  text-align: center;
  font-size: 1.2rem;
  color: var(--color-text-light);
  padding: 4rem 0;
  font-family: var(--font-serif);
  font-style: italic;
}

/* ── TARJETAS ORGÁNICAS ── */
.watercolor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 3rem;
}

.watercolor-card {
  background: white;
  border-radius: 30px;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s;
  box-shadow: 0 10px 40px rgba(0,0,0,0.03);
  position: relative;
  z-index: 20;
}
.watercolor-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(167, 243, 208, 0.2);
}

.card-img-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--color-soft-bg);
  padding: 15px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 4px 10px rgba(0,0,0,0.02);
}
.card-img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; }
.card-noimg { font-size: 0.8rem; color: var(--color-text-light); font-style: italic; }

.card-title {
  font-family: var(--font-serif);
  font-size: 1.4rem;
  color: var(--color-text-main);
  margin-bottom: 0.5rem;
}

.card-desc {
  font-size: 0.95rem;
  color: var(--color-text-light);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex: 1;
}

.card-price {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 1.5rem;
}

/* ── DRAWER ACUARELA ── */
.watercolor-overlay {
  position: fixed; inset: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 0.4s forwards;
}

.watercolor-drawer {
  width: 100%; max-width: 450px;
  background: #fdfcfb;
  height: 100vh;
  display: flex; flex-direction: column;
  box-shadow: -10px 0 50px rgba(0,0,0,0.05);
  border-radius: 30px 0 0 30px;
  overflow-y: auto;
}

.drawer-header {
  padding: 3rem 2rem 2rem;
  display: flex; justify-content: space-between; align-items: center;
}
.drawer-title {
  font-family: var(--font-serif);
  font-size: 2rem; color: var(--color-text-main); margin: 0;
}
.drawer-close {
  background: #edf2f7; border: none; color: var(--color-text-main);
  width: 40px; height: 40px; border-radius: 50%; font-size: 1.5rem;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.3s;
}
.drawer-close:hover { background: #e2e8f0; }

.drawer-body { padding: 0 2rem 3rem; flex: 1; display: flex; flex-direction: column; }

.empty-state {
  color: var(--color-text-light); font-style: italic; margin-top: 2rem;
}

.cart-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.5rem 0; border-bottom: 1px dashed #e2e8f0;
}
.item-name { font-weight: 600; font-size: 1.05rem; display: block; margin-bottom: 0.2rem; }
.item-price { color: var(--color-mint-hover); font-weight: 700; }
.qty-control {
  display: flex; align-items: center; gap: 0.8rem;
  background: white; border-radius: 99px; padding: 0.3rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}
.qty-control button {
  background: transparent; border: none; color: var(--color-text-main);
  width: 24px; height: 24px; cursor: pointer; font-weight: bold;
}
.item-remove {
  background: #fff5f5; color: #fc8181; border: none;
  width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
  margin-left: 1rem; transition: background 0.3s;
}
.item-remove:hover { background: #fed7d7; }

/* ── FORMULARIO SUAVE ── */
.watercolor-select {
  width: 100%; padding: 1.2rem;
  border-radius: 20px; border: none;
  background: white; box-shadow: 0 5px 20px rgba(0,0,0,0.02);
  color: var(--color-text-main); font-family: var(--font-sans); outline: none;
}

.summary-row {
  display: flex; justify-content: space-between; margin-bottom: 0.8rem; color: var(--color-text-light);
}
.summary-total {
  border-top: 1px dashed #e2e8f0; padding-top: 1.2rem; margin-top: 1rem;
  font-size: 1.3rem; font-weight: 700; color: var(--color-text-main);
}

.input-soft {
  width: 100%; padding: 1.2rem;
  border-radius: 20px; border: none;
  background: white; box-shadow: 0 5px 20px rgba(0,0,0,0.02);
  color: var(--color-text-main); font-family: var(--font-sans); outline: none;
  margin-bottom: 1.2rem; transition: box-shadow 0.3s;
}
.input-soft:focus { box-shadow: 0 8px 25px rgba(167, 243, 208, 0.4); }

.error-msg { color: #f56565; background: #fff5f5; padding: 1rem; border-radius: 15px; font-size: 0.9rem; }
.form-title { font-family: var(--font-serif); font-size: 1.5rem; color: var(--color-text-main); }
.success-title { font-family: var(--font-serif); font-size: 2.5rem; color: var(--color-mint-hover); margin-bottom: 1rem; }
</style>
