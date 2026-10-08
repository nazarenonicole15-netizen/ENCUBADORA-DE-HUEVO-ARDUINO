<script setup>
import { useToast } from '../composables/useToast'

const { toasts, dismissToast } = useToast()

const icons = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
  error:   `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>`,
  info:    `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 8.25h.008v.008H12V8.25z" /></svg>`
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item"
          :class="[`toast-${toast.type}`, { 'toast-closing': toast.closing }]"
          role="alert"
        >
          <!-- Icon -->
          <span class="toast-icon" v-html="icons[toast.type]"></span>

          <!-- Message -->
          <p class="toast-message">{{ toast.message }}</p>

          <!-- Close Button -->
          <button class="toast-close" @click="dismissToast(toast.id)" aria-label="Cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Progress bar -->
          <div class="toast-progress" :class="`toast-progress-${toast.type}`"></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 400px;
  width: calc(100vw - 3rem);
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1rem 1.25rem 1rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.15);
  position: relative;
  overflow: hidden;
  pointer-events: all;
  animation: toast-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* Types */
.toast-success {
  background: linear-gradient(135deg, #1B5E20ee, #2E7D32ee);
  color: #E8F5E9;
}
.toast-error {
  background: linear-gradient(135deg, #B71C1Cee, #C62828ee);
  color: #FFEBEE;
}
.toast-warning {
  background: linear-gradient(135deg, #F57F17ee, #F9A825ee);
  color: #fff8e1;
}
.toast-info {
  background: linear-gradient(135deg, #0D47A1ee, #1565C0ee);
  color: #E3F2FD;
}

/* Icon */
.toast-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  margin-top: 1px;
}
.toast-icon :deep(svg) {
  width: 22px;
  height: 22px;
}

/* Message */
.toast-message {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.5;
  flex: 1;
}

/* Close */
.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.6;
  color: inherit;
  padding: 0;
  margin-top: 2px;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
}
.toast-close:hover {
  opacity: 1;
}

/* Progress bar */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  border-radius: 0 0 12px 12px;
  animation: toast-progress 4s linear forwards;
}
.toast-progress-success { background: rgba(255,255,255,0.5); }
.toast-progress-error   { background: rgba(255,255,255,0.5); }
.toast-progress-warning { background: rgba(255,255,255,0.6); }
.toast-progress-info    { background: rgba(255,255,255,0.5); }

@keyframes toast-progress {
  from { width: 100%; }
  to   { width: 0%; }
}

/* Transition */
.toast-enter-active {
  animation: toast-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
.toast-leave-active {
  animation: toast-out 0.4s ease-in forwards;
}
.toast-move {
  transition: transform 0.3s ease;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}
@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
}
</style>
