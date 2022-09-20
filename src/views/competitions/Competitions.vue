<template>
  <section>
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
    <article class="article p-4 has-background-white-bis">
      <div 
        v-if="list"
        class="columns is-multiline"
      >
        <div 
          v-for="(comp, i) in list" 
          :key="i"
          class="column is-one-third"
        > 
          <div
            @click="$router.push({ name: 'comp-show', params: { id: comp.id } })" 
            class="box"
          >
            <router-link :to="{ name: 'comp-show', params: { id: comp.id } }"> 
              <h3 class="title is-3">{{ comp.name }}</h3>
              <h4 class="subtitle is-4">$X,XXX in prizes to be won</h4>
            </router-link>
            <div class="duration mt-6">
              <p v-if="comp.start_date && comp.end_date" >
                {{ kDayMonth(comp.start_date) }} - {{ kDayMonthYear(comp.end_date) }}
              </p>
              <p v-else>
                Time TBD
              </p>
            </div>
            <div class="clock"></div>
          </div>
        </div>
      </div>
      <loading v-else />
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapStores } from 'pinia'
import { dayMonth, dayMonthYear } from '@/utils/date'
import { useUserStore } from '@/store/user'
import { useCompetitionsStore } from '@/store/competitions'
import { canCreateCompetition } from '@/helpers/authHelper'
import Loading from '@/components/Loading.vue'

export default defineComponent({
  components: { Loading },
  data() {
    return {
      kDayMonth: dayMonth,
      kDayMonthYear: dayMonthYear
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
