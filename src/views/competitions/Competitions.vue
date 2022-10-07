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
      <div class="is-flex is-flex-direction-column">
        <competition-list 
            :list="currentCompetitions"
            :listType="eListType.column"
            :showEnterButton="true"
          />
        <div class="my-4 px-4">Past Competitions</div>
        <competition-list
          :list="pastCompetitions"
          :listType="eListType.column"
        />
      </div>
      <loading v-if="!currentCompetitions || !pastCompetitions" />
      <div class="has-text-centered mt-4">
        <button
          v-if="paginate"
          @click="fetchMore"
          class="button is-primary"
          :class="{ 'is-loading': isLoading}"
          :disabled="isLoading"
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
import { fsTimestampToDate, dayMonth, dayMonthYear } from '@/utils/date'
import Loading from '@/components/Loading.vue'
import CompetitionList from '@/components/competition/CompetitionList.vue'
import { PAGING_SIZE } from '@/consts'
import { Competition } from '@/types'
import { ListType } from '@/enums'

export default defineComponent({
  components: { Loading, CompetitionList },
  data() {
    return {
      paginate: true,
      isLoading: false,
      eListType: ListType,
      kDayMonth: dayMonth,
      kDayMonthYear: dayMonthYear,
      kfsTimestampToDate: fsTimestampToDate
    }
  },
  computed: {
    ...mapStores(useCompetitionsStore, useUserStore),
    ...mapState(useCompetitionsStore, ['list']),
    ...mapState(useUserStore, {
        canCreate(store) {
          return store.guild && canCreateCompetition(store.guild)
        }
      }),
    currentCompetitions():Competition[] {
      let result = [] as Competition[]
      if (this.list) {
        let now = new Date().getTime()
        result = this.list.filter(c => c.end_date && fsTimestampToDate(c.end_date).getTime() > now)  
      }
      return result
    },
    pastCompetitions() {
      let result = [] as Competition[]
      if (this.list) {
        let now = new Date().getTime()
        result = this.list.filter(c => c.end_date && fsTimestampToDate(c.end_date).getTime() < now)  
      }
      return result
    }
  },
  created() {
    if (!this.competitionsStore.list) {
      this.fetchMore()
    }
    else if (this.competitionsStore.list.length < PAGING_SIZE) {
      this.paginate = false
    }
  },
  methods: {
    fetchMore() {
      this.isLoading = true
      const after = this.list ? this.list[this.list.length -1] : undefined
      this.competitionsStore.fetch(after)
        .then(result => {
          this.paginate = !!result && result.length === PAGING_SIZE
        })
        .finally(()=>{
          this.isLoading = false
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
