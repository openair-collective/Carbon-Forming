<template>
  <nav-bar v-if="profile" />
  <article class="article">
    <router-view />
  </article>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { mapState } from 'pinia'
import { useUserStore } from '@/store/user'

const MODULE_ID = 'app'

export default defineComponent({
  name: "app",
  components: {
    NavBar
  },
  computed: {
    ...mapState(useUserStore, ['profile'])
  }
})
</script>

<style scoped>
.article {
  padding: 2em;
}
</style>
