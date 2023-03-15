<template>
  <section class="is-flex-grow-1">
    <div class="container has-text-centered">
      <div class="box p-6">
        <flash class="mb-4" />
        <h1 class="title is-4">Log in with your OpenAir Discord account</h1>
        <button class="button is-primary mb-4" @click="login">Log in with Discord</button>
      </div>
      <a href="#" class="is-underlined">Don't have an OpenAir Discord account? Click here to create one.</a>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import auth from '@/services/auth'
import { useUserStore } from '@/store/user'
import Flash from '@/components/Flash.vue'
import { KEY_REDIRECT_PATH } from '@/consts'

export default defineComponent({
  components: { Flash },
  beforeRouteEnter(to, from) {
    const redirect = to.query.redirect as string
    let store = useUserStore()
    if (store.oauth) {
      return redirect || '/'
    }
    else {
      sessionStorage.setItem(KEY_REDIRECT_PATH, redirect || from.path)
    }
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