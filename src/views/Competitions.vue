<template>
  <h1>Competitions</h1>
  <div v-if="!list">
    <p>Loading competitions</p>
  </div>
  <ol v-else>
    <li v-for="(comp, i) in list" :key="i">{{ comp.name }}</li>
  </ol>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapStores } from 'pinia';
import { useCompetitionStore } from '@/store/competition';

export default defineComponent({
  data() {
    return {}
  },
  computed: {
    ...mapStores(useCompetitionStore),
    ...mapState(useCompetitionStore, ['list'])
  },
  mounted() {
    if (!this.list) {
      this.competitionStore.fetchList()
    }
  }
})

</script>

<style scoped>
</style>
