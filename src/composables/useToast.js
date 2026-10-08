import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

/**
 * Global toast notification system.
 * Usage: const { showToast } = useToast()
 *        showToast('Mensaje', 'success' | 'error' | 'warning' | 'info')
 */
export function useToast() {
  const showToast = (message, type = 'success', duration = 4000) => {
    const id = ++nextId
    toasts.value.push({ id, message, type, closing: false })

    setTimeout(() => dismissToast(id), duration)
    return id
  }

  const dismissToast = (id) => {
    const toast = toasts.value.find(t => t.id === id)
    if (toast) {
      toast.closing = true
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      }, 400) // match CSS transition
    }
  }

  return { toasts, showToast, dismissToast }
}
