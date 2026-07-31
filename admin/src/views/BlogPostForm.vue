<template>
  <AdminLayout>
    <div class="w-full">
      <FormSection
        :title="isEditing ? 'Editar Artículo de Blog' : 'Redactar Nuevo Artículo de Salud'"
        :loading="saving"
        :submitText="isEditing ? 'Actualizar Artículo' : 'Publicar Artículo'"
        @submit="guardar"
        @cancel="cancelar"
      >
        <div v-if="errorMsg" class="rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 mb-4">
          {{ errorMsg }}
        </div>

        <div class="space-y-5 text-xs">
          <!-- Título y Estado -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div class="sm:col-span-2">
              <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Título del Artículo *</label>
              <input
                v-model="form.titulo"
                type="text"
                required
                placeholder="Ej. 5 Consejos Clave para una Alimentación Balanceada en 2026"
                class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs font-bold text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Estado de Publicación *</label>
              <select
                v-model="form.estado"
                required
                class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="Publicado">Publicado</option>
                <option value="Borrador">Borrador</option>
                <option value="Archivado">Archivado</option>
              </select>
            </div>
          </div>

          <!-- Imagen de Portada y Autor -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Imagen de Portada</label>
              
              <!-- Input oculto para subir archivo -->
              <input
                ref="fileInputPortada"
                type="file"
                accept="image/*"
                class="hidden"
                @change="subirFotoPortada"
              />

              <!-- Preview de la foto o botón de subida -->
              <div v-if="form.imagen_url" class="relative group mt-1">
                <img :src="form.imagen_url" alt="Portada" class="h-28 w-full rounded-xl object-cover border border-gray-200 dark:border-gray-700" />
                <button
                  type="button"
                  @click="form.imagen_url = ''"
                  class="absolute top-2 right-2 rounded-lg bg-red-600 px-2 py-1 text-[10px] font-bold text-white shadow-md hover:bg-red-700 transition-colors"
                >
                  Eliminar foto
                </button>
              </div>

              <div v-else class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-4 text-center dark:border-gray-700 hover:border-brand-500 transition-colors">
                <button
                  type="button"
                  @click="fileInputPortada.click()"
                  :disabled="uploadingPortada"
                  class="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3.5 py-2 text-xs font-semibold text-brand-600 dark:bg-brand-950/50 dark:text-brand-300 hover:bg-brand-100 transition-colors"
                >
                  <span v-if="uploadingPortada">Subiendo...</span>
                  <span v-else>Elegir foto</span>
                </button>
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Autor *</label>
              <input
                v-model="form.autor"
                type="text"
                required
                placeholder="Dra. Alexa Lora"
                class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <!-- Resumen Breve -->
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Resumen Breve</label>
            <textarea
              v-model="form.resumen"
              rows="2"
              placeholder="Escribe una breve introducción para motivar a tus pacientes a leer el artículo..."
              class="w-full rounded-xl border border-gray-300 bg-transparent px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            ></textarea>
          </div>

          <!-- Editor Visual -->
          <div>
            <label class="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Contenido del Artículo *</label>

            <!-- Input oculto para insertar imágenes en el editor -->
            <input
              ref="fileInputEditor"
              type="file"
              accept="image/*"
              class="hidden"
              @change="subirFotoEditor"
            />

            <!-- Barra de Herramientas Visual -->
            <div class="rounded-t-xl border border-gray-300 bg-gray-100 p-2 flex flex-wrap items-center gap-1.5 dark:border-gray-700 dark:bg-gray-800">
              <button
                type="button"
                @click="execCmd('bold')"
                title="Negrita"
                class="px-2.5 py-1 text-xs font-bold rounded hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all"
              >
                <b>B</b>
              </button>
              <button
                type="button"
                @click="execCmd('italic')"
                title="Cursiva"
                class="px-2.5 py-1 text-xs italic rounded hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all"
              >
                <i>I</i>
              </button>
              <div class="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
              <button
                type="button"
                @click="execCmd('formatBlock', 'h2')"
                title="Título Sección"
                class="px-2.5 py-1 text-xs font-bold text-brand-600 dark:text-brand-400 rounded hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all"
              >
                Título H2
              </button>
              <button
                type="button"
                @click="execCmd('formatBlock', 'h3')"
                title="Subtítulo"
                class="px-2.5 py-1 text-xs font-semibold rounded hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all"
              >
                Subtítulo H3
              </button>
              <div class="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
              <button
                type="button"
                @click="execCmd('insertUnorderedList')"
                title="Lista con Viñetas"
                class="px-2.5 py-1 text-xs rounded hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all"
              >
                • Lista
              </button>
              <button
                type="button"
                @click="execCmd('formatBlock', 'blockquote')"
                title="Cita Destacada"
                class="px-2.5 py-1 text-xs italic rounded hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all"
              >
                “Cita”
              </button>
              <div class="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
              
              <!-- Botón Subir Foto -->
              <button
                type="button"
                @click="fileInputEditor.click()"
                :disabled="uploadingEditor"
                title="Subir foto desde tu computadora"
                class="px-2.5 py-1 text-xs rounded bg-brand-50 text-brand-600 font-semibold hover:bg-brand-100 dark:bg-brand-950/50 dark:text-brand-300 transition-all"
              >
                <span v-if="uploadingEditor">Subiendo...</span>
                <span v-else>Insertar foto</span>
              </button>

              <button
                type="button"
                @click="execCmd('removeFormat')"
                title="Limpiar Formato"
                class="ml-auto px-2 py-1 text-[10px] text-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Limpiar formato
              </button>
            </div>

            <!-- Lienzo de Redacción Visual -->
            <div
              ref="editorRef"
              contenteditable="true"
              @input="onEditorInput"
              class="editor-content min-h-[260px] rounded-b-xl border border-t-0 border-gray-300 bg-white p-4 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 leading-relaxed font-sans prose dark:prose-invert max-w-none"
            ></div>
          </div>
        </div>
      </FormSection>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '../components/layout/AdminLayout.vue'
import FormSection from '../components/common/FormSection.vue'
import { blogApi } from '../api'

const route = useRoute()
const router = useRouter()

const isEditing = computed(() => !!route.params.id)
const saving = ref(false)
const errorMsg = ref('')
const editorRef = ref(null)

const fileInputPortada = ref(null)
const fileInputEditor = ref(null)
const uploadingPortada = ref(false)
const uploadingEditor = ref(false)

const form = ref({
  titulo: '',
  resumen: '',
  contenido_html: '',
  imagen_url: '',
  autor: 'Dra. Alexa Lora',
  fecha_publicacion: new Date().toISOString().split('T')[0],
  estado: 'Publicado'
})

onMounted(async () => {
  if (isEditing.value) {
    try {
      const data = await blogApi.getById(route.params.id)
      if (data) {
        form.value = {
          titulo: data.titulo || '',
          resumen: data.resumen || '',
          contenido_html: data.contenido_html || '',
          imagen_url: data.imagen_url || '',
          autor: data.autor || 'Dra. Alexa Lora',
          fecha_publicacion: data.fecha_publicacion || new Date().toISOString().split('T')[0],
          estado: data.estado || 'Publicado'
        }
        await nextTick()
        if (editorRef.value) {
          editorRef.value.innerHTML = form.value.contenido_html
        }
      }
    } catch (err) {
      errorMsg.value = 'Error al cargar los datos del artículo.'
    }
  }
})

const onEditorInput = () => {
  if (editorRef.value) {
    form.value.contenido_html = editorRef.value.innerHTML
  }
}

const execCmd = (command, value = null) => {
  if (!editorRef.value) return
  editorRef.value.focus()

  if (command === 'formatBlock') {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      let parentNode = selection.getRangeAt(0).commonAncestorContainer
      if (parentNode.nodeType === 3) parentNode = parentNode.parentNode // Nodo de texto

      const targetTag = value.toUpperCase()
      let currentBlock = parentNode
      let isAlreadyTarget = false

      while (currentBlock && currentBlock !== editorRef.value) {
        if (currentBlock.nodeName === targetTag) {
          isAlreadyTarget = true
          break
        }
        currentBlock = currentBlock.parentNode
      }

      if (isAlreadyTarget) {
        document.execCommand('formatBlock', false, 'p')
      } else {
        document.execCommand('formatBlock', false, value)
      }
    } else {
      document.execCommand('formatBlock', false, value)
    }
  } else {
    document.execCommand(command, false, value)
  }

  onEditorInput()
}

const subirFotoPortada = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    uploadingPortada.value = true
    errorMsg.value = ''
    const formData = new FormData()
    formData.append('imagen', file)

    const res = await blogApi.uploadImagen(formData)
    if (res && res.url) {
      form.value.imagen_url = res.url
    }
  } catch (err) {
    errorMsg.value = 'Error al subir la foto de portada: ' + err.message
  } finally {
    uploadingPortada.value = false
    if (fileInputPortada.value) fileInputPortada.value.value = ''
  }
}

const subirFotoEditor = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    uploadingEditor.value = true
    errorMsg.value = ''
    const formData = new FormData()
    formData.append('imagen', file)

    const res = await blogApi.uploadImagen(formData)
    if (res && res.url) {
      execCmd('insertImage', res.url)
    }
  } catch (err) {
    errorMsg.value = 'Error al subir la foto del artículo: ' + err.message
  } finally {
    uploadingEditor.value = false
    if (fileInputEditor.value) fileInputEditor.value.value = ''
  }
}

const guardar = async () => {
  try {
    saving.value = true
    errorMsg.value = ''

    if (editorRef.value) {
      form.value.contenido_html = editorRef.value.innerHTML
    }

    if (!form.value.titulo || !form.value.contenido_html || form.value.contenido_html.trim() === '') {
      errorMsg.value = 'Por favor ingresa el título y el contenido del artículo.'
      return
    }

    if (isEditing.value) {
      await blogApi.update(route.params.id, form.value)
    } else {
      await blogApi.create(form.value)
    }

    router.push('/blog')
  } catch (err) {
    errorMsg.value = err.message || 'Error al guardar el artículo.'
  } finally {
    saving.value = false
  }
}

const cancelar = () => {
  router.push('/blog')
}
</script>

<style>
.editor-content h2 {
  font-size: 1.25rem !important; /* 20px */
  font-weight: 700 !important;
  color: #111827 !important;
  margin-top: 0.75rem !important;
  margin-bottom: 0.5rem !important;
  display: block !important;
}

.editor-content h3 {
  font-size: 1.05rem !important; /* 17px */
  font-weight: 600 !important;
  color: #1f2937 !important;
  margin-top: 0.5rem !important;
  margin-bottom: 0.25rem !important;
  display: block !important;
}

.editor-content ul {
  list-style-type: disc !important;
  padding-left: 1.25rem !important;
  margin-top: 0.5rem !important;
  margin-bottom: 0.5rem !important;
}

.editor-content li {
  margin-bottom: 0.25rem !important;
}

.editor-content blockquote {
  border-left: 4px solid #10b981 !important;
  padding-left: 0.75rem !important;
  font-style: italic !important;
  color: #4b5563 !important;
  margin-top: 0.5rem !important;
  margin-bottom: 0.5rem !important;
}

.editor-content img {
  max-width: 100% !important;
  border-radius: 0.75rem !important;
  margin-top: 0.75rem !important;
  margin-bottom: 0.75rem !important;
}

.dark .editor-content h2 {
  color: #ffffff !important;
}

.dark .editor-content h3 {
  color: #f3f4f6 !important;
}

.dark .editor-content blockquote {
  color: #9ca3af !important;
}
</style>
