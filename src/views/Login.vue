<template>
  <main>
    <section class="p-4">
      <h1 class="title is-3">Welcome to Carbon Hackers</h1>
      <button class="button is-primary mb-4" @click="login">Log in with Discord</button>
      <br/>
      <a href="#">Don't have an OpenAir Discord account? Click here to create one.</a>
    </section>
  </main>
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