<template>
  <div class="is-flex is-flex-wrap-wrap">
    <div  
      v-for="(comp, i) in list" 
      :key="i"
      @click="$router.push({ name: 'comp-show', params: { id: comp.id } })" 
      class="box box--comp mb-4 mr-4"
    >
      <router-link :to="{ name: 'comp-show', params: { id: comp.id } }"> 
        <h3 class="title is-3">{{ comp.name }}</h3>
        <h4 class="subtitle is-4">$X,XXX in prizes to be won</h4>
      </router-link>
      <div class="duration mt-6 mb-4">
        <p v-if="comp.start_date && comp.end_date" >
          {{ kDayMonth(kfsTimestampToDate(comp.start_date)) }} - {{ kDayMonthYear(kfsTimestampToDate(comp.end_date)) }}
        </p>
        <p v-else>
          Time TBD
        </p>
      </div>
      <countdown-timer 
        v-if="comp.start_date" 
        :start_date="kfsTimestampToDate(comp.start_date)"
        :end_date="kfsTimestampToDate(comp.end_date)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Competition } from '@/types'
import { dayMonth, dayMonthYear, fsTimestampToDate } from '@/utils/date'
import CountdownTimer from '@/components/CountdownTimer.vue'

export default defineComponent({
  components: { CountdownTimer },
  props: {
    list: {
      type: Array as PropType<Competition[]>,
      required: true
    }
  },
  data() {
    return {
      kDayMonth: dayMonth,
      kDayMonthYear: dayMonthYear,
      kfsTimestampToDate: fsTimestampToDate
    }
  }
})
</script>

<style scoped>
  .box--comp {
    cursor:pointer;
  }
</style>