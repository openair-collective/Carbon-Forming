<template>
  <div
    class="is-flex" 
    :class="{ 
      'is-flex-direction-column': listType === eListType.column,
      'is-flex-direction-row': listType === eListType.grid
    }">
    <div  
      v-for="(comp, i) in list" 
      :key="i"
      @click="$router.push({ name: 'comp-show', params: { id: comp.id } })" 
      class="box box--comp p-6"
      :class="{
        'is-flex-grow-1': listType === eListType.column,
        'mb-4 mr-4': listType === eListType.grid
      }"
    >
      <div 
        class="is-flex is-justify-content-space-between"
        :class="{ 
          'is-flex-direction-column' : listType === eListType.grid,
          'is-flex-direction-row': listType === eListType.column
        }"
      >
        <router-link 
          :to="{ name: 'comp-show', params: { id: comp.id } }"
          class="mb-4"
        > 
          <div
            v-if="getCompState(comp) === eCompStates.IN_PROGRESS"
            class="tag mb-4 is-primary is-light"
          >
            Open Competition
          </div>
          <h3 class="title is-3">{{ comp.name }}</h3>
          <template v-if="showEnterButton">
            <button
              v-if="getCompState(comp) === eCompStates.IN_PROGRESS || getCompState(comp) === eCompStates.UNAVAILABLE"
              @click.stop.prevent="onEnterCompetition(comp)"
              class="button is-info"
              :disabled="getCompState(comp) === eCompStates.UNAVAILABLE"
            >
              Enter this competition
            </button>
            <button
              v-else-if="getCompState(comp) === eCompStates.FINISHED"
              @click.stop.prevent=""
              class="button is-info"
              disabled
            >
              Judging in Progress
            </button>
            <router-link
              v-else-if="getCompState(comp) === eCompStates.JUDGED"
              :to="{name: 'comp-results', params: { id: comp.id }}"
              class="button is-info"
            >
              View Results
            </router-link>
          </template>
        </router-link>
        <div>
          <p 
            v-if="comp.start_date && comp.end_date"
            class="mb-3"
          >
            {{ kDayMonth(kfsTimestampToDate(comp.start_date)) }} - {{ kDayMonthYear(kfsTimestampToDate(comp.end_date)) }}
          </p>
          <p v-else>
            Time TBD
          </p>
          <p v-if="getCompState(comp) === eCompStates.FINISHED" class="is-size-3">Competition finished</p>
          <countdown-timer 
            v-else-if="comp.start_date" 
            :start_date="kfsTimestampToDate(comp.start_date)"
            :end_date="kfsTimestampToDate(comp.end_date)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Competition } from '@/types'
import { dayMonth, dayMonthYear, fsTimestampToDate } from '@/utils/date'
import { mapStores } from 'pinia'
import { useModalStore } from '@/store/modal'
import CountdownTimer from '@/components/CountdownTimer.vue'
import { ListType } from '@/enums'
import { 
  getCompState, 
  COMP_STATES 
} from '@/helpers/compHelper'

export default defineComponent({
  components: { CountdownTimer },
  props: {
    list: {
      type: Array as PropType<Competition[]>,
      required: true
    },
    showEnterButton: {
      type:Boolean,
      default: false
    },
    listType: {
      type: Number as PropType<ListType>,
      default: ListType.grid
    }
  },
  data() {
    return {
      eListType: ListType,
      eCompStates: COMP_STATES,
      kDayMonth: dayMonth,
      kDayMonthYear: dayMonthYear,
      kfsTimestampToDate: fsTimestampToDate
    }
  },
  computed: {
    ...mapStores(useModalStore)
  },
  methods: {
    getCompState,
    onEnterCompetition(comp:Competition) {
      this.$router.push({
        name: 'comp-enter',
        params: { id: comp.id }
      })
    }
  }
})
</script>

<style scoped>
  .box--comp {
    cursor:pointer;
  }
</style>