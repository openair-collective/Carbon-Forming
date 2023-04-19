<template>
  <section class="my-2">
    <header class="header mb-6">
      <div class="columns is-vcentered">
        <div class="column">
          <figure class="image">
            <img :src="logo_img" />
          </figure>
        </div>
        <div class="column">
          <h2 class="title is-4 mb-2 has-text-white">The carbon capture collaboration platform</h2>
          <p class="has-text-white">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sit amet blandit est. Suspendisse posuere purus vel sollicitudin finibus.</p>
        </div>
      </div>
    </header>
    <loading v-if="isLoading" />
    <div v-if="hasComps">
      <div v-if="currentCompetitions && currentCompetitions.length" class="has-text-centered mt-6 mb-4" >
        <div class="tag is-medium is-rounded">
          Current Collaborations
        </div>
      </div>
      <competition-list 
          :list="currentCompetitions"
          :listType="eListType.column"
          :showEnterButton="true"
        />
      <div
        v-if="pastCompetitions && pastCompetitions.length"
        class="tag is-medium is-dark my-3"
      >
        Past Competitions
      </div>
      <competition-list
        :list="pastCompetitions"
        :listType="eListType.column"
        :showEnterButton="true"
      />
      <div 
        v-if="canEdit"
        class="is-flex is-flex-direction-column is-align-items-center is-justify-content-center my-6"
      >
        <router-link
          :to="{ name: 'comp-new' }"
          class="button is-info"
        >
          Create a Competition
        </router-link>
      </div>
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
      logo_img,
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
  figure img {
    max-width: 371px;
  }
  .tag:not(body) {
    background-color: $black;
    color: $white-ter;
    border: 2px solid $white-ter;
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
