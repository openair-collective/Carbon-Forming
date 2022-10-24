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
            v-if="acceptingEntries(comp)"
            class="tag mb-4 is-primary is-light"
          >
            Open Competition
          </div>
          <h3 class="title is-3">{{ comp.name }}</h3>
          <button 
            v-if="showEnterButton"
            @click.stop.prevent="onEnterCompetition(comp)"
            class="button"
            :class="{
              'is-info': acceptingEntries(comp),
              'is-light': !acceptingEntries(comp)
            }"
            :disabled="!acceptingEntries(comp)"
          >
            Enter this competition
          </button>
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
          <p v-if="compEnded(comp)" class="is-size-3">Competition finished</p>
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
import { acceptingEntries, compEnded } from '@/helpers/compHelper'

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
      kDayMonth: dayMonth,
      kDayMonthYear: dayMonthYear,
      kfsTimestampToDate: fsTimestampToDate
    }
  },
  computed: {
    ...mapStores(useModalStore)
  },
  methods: {
    acceptingEntries,
    compEnded,
    onEnterCompetition(comp:Competition) {
      this.modalStore.options = {
        component: 'EnterCompetition',
        title: '',
        fullscreen: true,
        meta: {
          competition: comp
        }
      }
    }
  }
})
</script>

<style scoped>
  .box--comp {
    cursor:pointer;
  }
</style>