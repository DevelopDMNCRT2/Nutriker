import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('nutriker_cart') || '[]'),
    isCartOpen: false,
  }),
  getters: {
    cartCount: (state) => state.items.reduce((total, item) => total + item.cantidad, 0),
    cartSubtotal: (state) => state.items.reduce((total, item) => total + (Number(item.precio) * item.cantidad), 0),
  },
  actions: {
    saveToStorage() {
      localStorage.setItem('nutriker_cart', JSON.stringify(this.items))
    },
    addToCart(producto, cantidad = 1) {
      const existing = this.items.find(i => i.id === producto.id)
      if (existing) {
        existing.cantidad += cantidad
      } else {
        this.items.push({
          id: producto.id,
          nombre: producto.nombre,
          precio: Number(producto.precio),
          imagen_principal: producto.imagen_principal || producto.imagen_url || null,
          cantidad: cantidad,
          stock: producto.stock !== undefined ? Number(producto.stock) : 99
        })
      }
      this.saveToStorage()
      this.isCartOpen = true
    },
    removeFromCart(id) {
      this.items = this.items.filter(i => i.id !== id)
      this.saveToStorage()
    },
    updateQuantity(id, cantidad) {
      const item = this.items.find(i => i.id === id)
      if (item) {
        if (cantidad <= 0) {
          this.removeFromCart(id)
        } else {
          item.cantidad = cantidad
          this.saveToStorage()
        }
      }
    },
    clearCart() {
      this.items = []
      this.saveToStorage()
    },
    toggleCart(value) {
      this.isCartOpen = value !== undefined ? value : !this.isCartOpen
    }
  }
})
