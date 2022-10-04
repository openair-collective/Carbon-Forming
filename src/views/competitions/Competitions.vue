<template>
  <section class="is-flex is-flex-direction-column">
    <header class="header p-4 has-background-white">
      <h1 class="title is-4">
        Competitions
        <router-link 
          v-if="canCreate"
          :to="{ name: 'comp-new' }"
          class="button is-info is-small is-outlined ml-2"
        >
          New Competition
        </router-link>
      </h1>
    </header>
    <article class="article p-4 is-flex-grow-1 has-background-white-bis">
      <competition-list v-if="list" :list="list" />
      <loading v-else />
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { useCompetitionsStore } from '@/store/competitions'
import { canCreateCompetition } from '@/helpers/authHelper'
import Loading from '@/components/Loading.vue'
import CompetitionList from '@/components/CompetitionList.vue'

export default defineComponent({
  components: { Loading, CompetitionList },
  computed: {
    ...mapStores(useCompetitionsStore, useUserStore),
    ...mapState(useCompetitionsStore, ['list']),
    ...mapState(useUserStore, {
        canCreate(store) {
          return store.guild && canCreateCompetition(store.guild)
        }
      })
  },
  created() {
    if (!this.list) {
      this.competitionsStore.fetchList()
    }
  }
})

</script>

<style scoped>
  .box {
    cursor:pointer;
  }
</style>
