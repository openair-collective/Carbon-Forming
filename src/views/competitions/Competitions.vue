<template>
  <section class="is-flex is-flex-direction-column">
    <header class="header">
      <div class="hero is-medium">
        <div class="hero-body">
          <p class="title">
            Welcome to Carbon Hackers
          </p>
          <p class="subtitle">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec at consectetur neque. Sed rhoncus nisi eget elementum commodo. Nunc ut euismod lacus. Pellentesque tortor risus, blandit et purus convallis, ornare ullamcorper lacus.</p>
          <router-link 
            v-if="canCreate && (currentCompetitions.length || pastCompetitions.length)"
            :to="{ name: 'comp-new' }"
            class="button is-info"
          >
            Create Competition
        </router-link>
        </div>
      </div>
    </header>
    <article class="article p-4 is-flex-grow-1 has-background-white-bis">
      <loading v-if="isLoading" />
      <div v-else-if="hasComps" class="list">
        <competition-list 
            :list="currentCompetitions"
            :listType="eListType.column"
            :showEnterButton="true"
          />
        <h2
          v-if="pastCompetitions && pastCompetitions.length"
          class="title is-5 my-4 px-4"
        >
          Past Competitions
        </h2>
        <competition-list
          :list="pastCompetitions"
          :listType="eListType.column"
          :showEnterButton="true"
        />
      </div>
      <div 
        v-else
        class="is-flex is-flex-direction-column is-align-items-center is-justify-content-center"
      >
        <p class="mb-2">No competitions yet.</p>
        <router-link
          v-if="canCreate"
          :to="{ name: 'comp-new' }"
          class="button is-info"
        >
          Create Your First Competition
        </router-link>
      </div>
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { useCompetitionsStore } from '@/store/competitions'
import { canEditCompetitions } from '@/helpers/authHelper'
import { fsTimestampToDate, dayMonth, dayMonthYear } from '@/utils/date'
import Loading from '@/components/Loading.vue'
import CompetitionList from '@/components/competition/CompetitionList.vue'
import { PAGING_SIZE } from '@/consts'
import { Competition } from '@/types'
import { ListType } from '@/enums'
import { COMP_STATES, getCompState } from '@/helpers/compHelper'

export default defineComponent({
  components: { Loading, CompetitionList },
  data() {
    return {
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
          return store.oauth && canEditCompetitions(store.oauth)
        }
      }),
    currentCompetitions():Competition[] {
      let result = [] as Competition[]
      if (this.list) {
        result = this.list.filter(c => getCompState(c) !== COMP_STATES.JUDGED)
      }
      return result.sort((a,b) => {
        const aEnd = a.end_date ? fsTimestampToDate(a.end_date).getTime() : 0
        const bEnd = b.end_date ? fsTimestampToDate(b.end_date).getTime() : 0
        return aEnd - bEnd
      })
    },
    pastCompetitions() {
      let result = [] as Competition[]
      if (this.list) {
        result = this.list.filter(c => getCompState(c) === COMP_STATES.JUDGED)
      }
      return result
    },
    hasComps():boolean {
      return this.currentCompetitions.length > 0 || this.pastCompetitions.length > 0
    }
  },
  async created() {
    if (!this.competitionsStore.list) {
      this.competitionsStore.fetch()
    }
  }
})

</script>

<style scoped>
  .list {
    margin-top: -100px;
  }
  .hero {
    background-color:#A6A4A4;
  }
</style>
