<template>
  <section class="my-2">
    <header class="header is-flex is-flex-direction-row">
      <h1 class="title is-3 has-text-white mr-4">
        Collaborations
      </h1>
      <router-link
          v-if="canEdit"
          :to="{ name: 'comp-new' }"
          class="button is-info is-small"
        >
          Create a Collaboration
      </router-link>
    </header>
    <loading v-if="isLoading" />
    <div v-if="hasComps">
      <competition-list 
          :list="currentCompetitions"
          :listType="currentCompetitions.length > 1 ? ListType.grid : ListType.column"
          :showEnterButton="true"
        />
      <h2
        v-if="pastCompetitions && pastCompetitions.length"
        class="title is-5 my-4 px-4"
      >
        Past Collaborations
      </h2>
      <competition-list
        :list="pastCompetitions"
        :listType="pastCompetitions.length > 1 ? ListType.grid : ListType.column"
        :showEnterButton="true"
      />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { useCompetitionsStore } from '@/store/competitions'
import { fsTimestampToDate, dayMonth, dayMonthYear } from '@/utils/date'
import Loading from '@/components/Loading.vue'
import CompetitionList from '@/components/competition/CompetitionList.vue'
import { PAGING_SIZE } from '@/consts'
import { Competition } from '@/types'
import { ListType, UserRole } from '@/enums'
import { COMP_STATES, getCompState } from '@/helpers/compHelper'
import logo_img from '@/images/cc_logo.png'

export default defineComponent({
  components: { Loading, CompetitionList },
  data() {
    return {
      ListType,
      logo_img,
      isLoading: false,
      kDayMonth: dayMonth,
      kDayMonthYear: dayMonthYear,
      kfsTimestampToDate: fsTimestampToDate
    }
  },
  computed: {
    ...mapStores(useCompetitionsStore, useUserStore),
    ...mapState(useCompetitionsStore, ['list']),
    canEdit():boolean {
      return this.userStore.isAuthenticated && this.userStore.role === UserRole.admin
    },
    currentCompetitions():Competition[] {
      let result = [] as Competition[]
      if (this.list) {
        result = this.list.filter(c => getCompState(c) !== COMP_STATES.FINISHED)
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
        result = this.list.filter(c => getCompState(c) === COMP_STATES.FINISHED)
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

<style lang="scss" scoped>
  .header {
    padding: 0 2.25rem;
  }
  figure img {
    max-width: 371px;
  }

  @include until($tablet) {
    .header {
      padding: 0 1rem;
    }
    .column {
      text-align: center;
    }
    figure img {
      max-width: 271px;
      margin: 0 auto;
    }
  }
</style>
