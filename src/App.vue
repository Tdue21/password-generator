<script setup lang="ts">
import PasswordGenerator from './components/PasswordGenerator.vue'
</script>

<template>
  <PasswordGenerator />
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

@media (max-width: 480px) {
  body {
    padding: 12px;
    align-items: flex-start;
    padding-top: 20px;
  }
}
</style>
