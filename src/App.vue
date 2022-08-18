<template>
  <nav-bar/>
  <article class="article">
    <router-view />
  </article>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavBar from '@/components/NavBar.vue'

export default defineComponent({
  name: "app",
  components: {
    NavBar
  }
})
</script>

<style scoped>
.article {
  padding: 2em;
}
</style>
