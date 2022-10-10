<template>
  <section class="p-4 is-flex-grow-1">
    <div class="container has-text-centered">
      <div class="box p-6">
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

export default defineComponent({
  data() {
    return {}
  },
  beforeRouteEnter(to, from) {
    let store = useUserStore()
    if (store.oauth) {
      let redirect = to.query.redirect as string
      return redirect || '/'
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
.box {
  max-width: 50vw;
  margin: 20vh auto;
}
</style>