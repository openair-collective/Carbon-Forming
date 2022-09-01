<template>
  <h1>Welcome to Carbon Hackers</h1>
  <button @click="login">Log in with Discord</button>
  <br/>
  <a href="#">Don't have an OpenAir Discord account? Click here to create one.</a>
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