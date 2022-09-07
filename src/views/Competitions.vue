<template>
  <section class="p-4">
    <h1 class="title is-2">Competitions</h1>
    <div v-if="!list">
      <p>Loading competitions</p>
    </div>
    <ul v-else>
      <li v-for="(comp, i) in list" :key="i">
        <router-link class="button is-text" :to="{ name: 'competition', params: { id: comp.id } }">
          {{ comp.name }}
        </router-link>
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapStores } from 'pinia';
import { useCompetitionsStore } from '@/store/competitions';

export default defineComponent({
  computed: {
    ...mapStores(useCompetitionsStore),
    ...mapState(useCompetitionsStore, ['list'])
  },
  mounted() {
    this.competitionsStore.fetchList()
  }
})

</script>

<style scoped>
</style>
