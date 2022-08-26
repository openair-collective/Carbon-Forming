<template>
  <h1>Login</h1>
  <button @click="login">Login</button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import auth from '@/services/auth'

export default defineComponent({
  data() {
    return {}
  },
  methods: {
    login() {
      auth.login()
    }
  }
})

</script>

<style scoped>
</style>