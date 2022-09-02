<template>
  <section class="p-4">
    <h1 class="title is-2">Competitions</h1>
    <div v-if="!list">
      <p>Loading competitions</p>
    </div>
    <ol v-else>
      <li v-for="(comp, i) in list" :key="i">{{ comp.name }}</li>
    </ol>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapStores } from 'pinia';
import { useCompetitionsStore } from '@/store/competitions';

export default defineComponent({
  data() {
    return {}
  },
  computed: {
    ...mapStores(useCompetitionsStore),
    ...mapState(useCompetitionsStore, ['list'])
  },
  mounted() {
    if (!this.list) {
      this.competitionsStore.fetchList()
    }
  }
})

</script>

<style scoped>
</style>
