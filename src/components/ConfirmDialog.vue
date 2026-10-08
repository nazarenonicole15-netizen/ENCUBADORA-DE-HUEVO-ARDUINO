<script setup>
import { useConfirm } from '../composables/useConfirm'

const { dialogState, handleConfirm, handleCancel } = useConfirm()

const typeConfig = {
  warning: {
    iconBg: '#FFF8E1',
    iconColor: '#F9A825',
    confirmClass: 'btn-warning',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>`
  },
  danger: {
    iconBg: '#FFEBEE',
    iconColor: '#C62828',
    confirmClass: 'btn-danger',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>`
  },
  info: {
    iconBg: '#E3F2FD',
    iconColor: '#1565C0',
    confirmClass: 'btn-info',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 8.25h.008v.008H12V8.25z" />
    </svg>`
  }
}

const currentConfig = () => typeConfig[dialogState.value.type] || typeConfig.warning
</script>

<template>
  <Teleport to="body">
    <Transition name="backdrop">
      <div
        v-if="dialogState.visible"
        class="confirm-backdrop"
        @click.self="handleCancel"
        role="dialog"
        aria-modal="true"
      >
        <Transition name="dialog">
          <div class="confirm-dialog" v-if="dialogState.visible">
            <!-- Icon -->
            <div class="confirm-icon-wrapper" :style="{ background: currentConfig().iconBg }">
              <span
                class="confirm-icon"
                :style="{ color: currentConfig().iconColor }"
                v-html="currentConfig().icon"
              ></span>
            </div>

            <!-- Content -->
            <div class="confirm-content">
              <h3 class="confirm-title">{{ dialogState.title }}</h3>
              <p class="confirm-message">{{ dialogState.message }}</p>
            </div>

            <!-- Actions -->
            <div class="confirm-actions">
              <button class="confirm-btn btn-cancel" @click="handleCancel">
                {{ dialogState.cancelText }}
              </button>
              <button
                class="confirm-btn"
                :class="currentConfig().confirmClass"
                @click="handleConfirm"
              >
                {{ dialogState.confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Backdrop */
.confirm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(13, 71, 161, 0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9990;
  padding: 1rem;
}

/* Dialog card */
.confirm-dialog {
  background: #fff;
  border-radius: 20px;
  padding: 2rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 24px 64px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  text-align: center;
}

/* Icon */
.confirm-icon-wrapper {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.confirm-icon {
  width: 32px;
  height: 32px;
  display: flex;
}
.confirm-icon :deep(svg) {
  width: 32px;
  height: 32px;
}

/* Content */
.confirm-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.confirm-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #263238;
}
.confirm-message {
  margin: 0;
  font-size: 0.95rem;
  color: #546E7A;
  line-height: 1.6;
}

/* Actions */
.confirm-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
  margin-top: 0.5rem;
}
.confirm-btn {
  flex: 1;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}
.btn-cancel {
  background: #F5F7FA;
  color: #546E7A;
  border: 1px solid #e0e0e0;
}
.btn-cancel:hover {
  background: #ECEFF1;
}
.btn-warning {
  background: linear-gradient(135deg, #F9A825, #FFC107);
  color: #fff;
  box-shadow: 0 4px 12px rgba(249,168,37,0.4);
}
.btn-warning:hover {
  background: linear-gradient(135deg, #F57F17, #F9A825);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(249,168,37,0.5);
}
.btn-danger {
  background: linear-gradient(135deg, #C62828, #E53935);
  color: #fff;
  box-shadow: 0 4px 12px rgba(198,40,40,0.4);
}
.btn-danger:hover {
  background: linear-gradient(135deg, #B71C1C, #C62828);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(198,40,40,0.5);
}
.btn-info {
  background: linear-gradient(135deg, #1565C0, #1976D2);
  color: #fff;
  box-shadow: 0 4px 12px rgba(21,101,192,0.4);
}
.btn-info:hover {
  background: linear-gradient(135deg, #0D47A1, #1565C0);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(21,101,192,0.5);
}

/* Transitions */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.dialog-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dialog-leave-active {
  transition: all 0.25s ease-in;
}
.dialog-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}
.dialog-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>
