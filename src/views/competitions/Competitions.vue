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
        <div 
          v-for="comp in currentCompetitions"
          :key="comp.id"
          @click="$router.push({ name: 'comp-show', params: { id: comp.id } })" 
          class="box p-6"
        >
          <div class="is-flex is-flex-direction-row is-justify-content-space-between">
            <div>
              <router-link :to="{ name: 'comp-show', params: { id: comp.id } }">
                <h2 class="title is-3">{{ comp.name }}</h2>
              </router-link>
              <h3 class="subtitle">A sentence about this competition</h3>
              <button class="button is-primary">Enter this competition</button>
            </div>
            <div>
              <p v-if="comp.start_date && comp.end_date" class="is-size-5" >
                {{ kDayMonth(kfsTimestampToDate(comp.start_date)) }} - {{ kDayMonthYear(kfsTimestampToDate(comp.end_date)) }}
              </p>
              <countdown-timer 
                :start_date="kfsTimestampToDate(comp.start_date)"
                :end_date="kfsTimestampToDate(comp.end_date)" 
              />
            </div>
          </div>
        </div>
        <div class="my-4 px-4">Past Competitions</div>
        <div 
          v-for="comp in pastCompetitions"
          :key="comp.id"
          @click="$router.push({ name: 'comp-show', params: { id: comp.id } })" 
          class="box p-6"
        >
          <div class="is-flex is-flex-direction-row is-justify-content-space-between">
            <div>
              <router-link :to="{ name: 'comp-show', params: { id: comp.id } }">
                <h2 class="title is-3">{{ comp.name }}</h2>
              </router-link>
              <h3 class="subtitle">A sentence about this competition</h3>
              <button class="button is-primary">Enter this competition</button>
            </div>
            <div>
              <p v-if="comp.start_date && comp.end_date" class="is-size-5" >
                {{ kDayMonth(kfsTimestampToDate(comp.start_date)) }} - {{ kDayMonthYear(kfsTimestampToDate(comp.end_date)) }}
              </p>
              <p class="is-size-3">Competition finished</p>
            </div>
          </div>
        </div>
      </div>
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
import { fsTimestampToDate, dayMonth, dayMonthYear } from '@/utils/date'
import Loading from '@/components/Loading.vue'
import CountdownTimer from '@/components/CountdownTimer.vue'
import { PAGING_SIZE } from '@/consts'
import { Competition } from '@/types'

export default defineComponent({
  components: { Loading, CountdownTimer },
  data() {
    return {
      paginate: false,
      loading: false,
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
