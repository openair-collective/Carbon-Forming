<template>
  <div
    class="is-flex is-flex-wrap-wrap"
    :class="{ 'is-grid' : listType === eListType.grid}"
  >
    <div  
      v-for="(comp, i) in list" 
      :key="i"
      @click="$router.push({ name: 'comp-show', params: { id: comp.id } })" 
      class="box box--comp mb-4 elevation-0"
      :class="{ 'mr-4' : listType === eListType.grid }"
    >
      <div 
        class="columns"
        :class="{ 'is-flex-direction-column' : listType === eListType.grid }"
      >
        <div class="column">
          <router-link 
            :to="{ name: 'comp-show', params: { id: comp.id } }"
            class="mb-4"
          >
            <p class="title is-3 is-size-4-mobile">{{ comp.name }}</p>
            <p v-if="showDescription" v-html="comp.description" class="subtitle is-6" />
            <template v-if="showEnterButton">
              <button
                v-if="getCompState(comp) === eCompStates.IN_PROGRESS || getCompState(comp) === eCompStates.UNAVAILABLE"
                @click.stop.prevent="onEnterCompetition(comp)"
                class="button is-primary"
                :disabled="getCompState(comp) === eCompStates.UNAVAILABLE"
              >
                Enter this competition
              </button>
              <button
                v-else-if="getCompState(comp) === eCompStates.FINISHED"
                @click.stop.prevent=""
                class="button is-primary"
                disabled
              >
                Judging in Progress
              </button>
              <router-link
                v-else-if="getCompState(comp) === eCompStates.JUDGED"
                :to="{name: 'comp-results', params: { id: comp.id }}"
                class="button is-primary"
              >
                View Results
              </router-link>
            </template>
          </router-link>
        </div>
        <div class="column is-narrow">
          <p 
            v-if="comp.start_date && comp.end_date"
            class="title is-4 mb-3"
            :class="{ 
              'is-4' : listType === eListType.column,
              'is-6' : listType === eListType.grid 
            }"
          >
            {{ kDayMonth(kfsTimestampToDate(comp.start_date)) }} - {{ kDayMonthYear(kfsTimestampToDate(comp.end_date)) }}
          </p>
          <p v-else>
            Time TBD
          </p>
          <p v-if="getCompState(comp) === eCompStates.FINISHED" class="is-size-3">Competition finished</p>
          <countdown-timer 
            v-else-if="comp.start_date" 
            :class="{ 'is-small' : listType === eListType.grid }"
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
    showDescription: {
      type:Boolean,
      default: true
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
    padding: 2rem;
    cursor:pointer;
    border: 1px solid #E0E0E0;
  }
  .is-grid .box--comp {
    width: 400px;
  }
</style>