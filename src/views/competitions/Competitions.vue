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
      <loading v-if="loading" />
      <div class="has-text-centered mt-4">
        <button
          v-if="paginate && !loading"
          @click="fetchMore"
          class="button is-primary"
        >
          Show More
        </button>
        <div v-else-if="!paginate" class="tag is-medium">You’ve reached the end of the list</div>
      </div>
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
import CompetitionList from '@/components/competition/CompetitionList.vue'
import { PAGING_SIZE } from '@/consts'

export default defineComponent({
  components: { Loading, CompetitionList },
  data() {
    return {
      paginate: false,
      loading: false
    }
  },
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
    this.fetchMore()
  },
  methods: {
    fetchMore() {
      const after = this.list ? this.list[this.list.length -1] : undefined
      this.competitionsStore.fetch(after)
        .then(result => {
          this.paginate = !!result && result.length === PAGING_SIZE
        })
    }
  }
})

</script>

<style scoped>
  .box {
    cursor:pointer;
  }
</style>
