<script setup>
import ToastNotification from './components/ToastNotification.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
</script>

<template>
  <router-view></router-view>
  <!-- Global notification systems -->
  <ToastNotification />
  <ConfirmDialog />
</template>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>
