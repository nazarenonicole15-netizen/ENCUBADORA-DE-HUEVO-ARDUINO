import { ref } from 'vue'

/**
 * Global confirm dialog system.
 * Returns a Promise<boolean> — resolves true on confirm, false on cancel.
 */
const dialogState = ref({
  visible: false,
  title: '',
  message: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  type: 'warning', // 'warning' | 'danger' | 'info'
  resolve: null
})

export function useConfirm() {
  const showConfirm = (message, options = {}) => {
    return new Promise((resolve) => {
      dialogState.value = {
        visible: true,
        title: options.title || '¿Estás seguro?',
        message,
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        type: options.type || 'warning',
        resolve
      }
    })
  }

  const handleConfirm = () => {
    dialogState.value.visible = false
    if (dialogState.value.resolve) dialogState.value.resolve(true)
  }

  const handleCancel = () => {
    dialogState.value.visible = false
    if (dialogState.value.resolve) dialogState.value.resolve(false)
  }

  return { dialogState, showConfirm, handleConfirm, handleCancel }
}
