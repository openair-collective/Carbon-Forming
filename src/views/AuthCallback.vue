<template>
  <h1>Logging you in...</h1>
  <div v-if="error">{{ error }}</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import auth from '@/services/auth'
import { mapStores } from 'pinia'
import { useUserStore } from '@/store/user'

function getURLParameter(name:string): string | null {
  const url = window.location
  const params = new URLSearchParams(url.search)
  return params.get(name)
}

export default defineComponent({
  data() {
    return {
      code: getURLParameter('code'),
      error: getURLParameter('error'),
      state: getURLParameter('state')
    }
  },
  computed: {
    ...mapStores(useUserStore),
  },
  mounted() {
    if (this.code && this.state) {
      this.userStore.exchangeToken(this.code, this.state)
        .then(
          result => {
            this.$router.push({ name: 'home'})
          },
          error => {
            this.error = error
          }
        )
    }
    else {
      this.$router.push({ name: 'login' })
    }
  }
})

</script>

<style scoped>
</style>