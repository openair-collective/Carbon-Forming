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
        :class="{ 'is-flex-direction-column-reverse' : listType === eListType.grid }"
      >
        <div class="column">
          <router-link 
            :to="{ name: 'comp-show', params: { id: comp.id } }"
            class="mb-4"
          >
            <p class="title is-3 mb-4 is-size-4-mobile">{{ comp.name }}</p>
            <div class="is-size-6 mb-0">
              <p 
                v-if="comp.start_date && comp.end_date"
                class="title mb-4"
                :class="{ 
                  'is-5' : listType === eListType.column,
                  'is-6' : listType === eListType.grid 
                }"
              >
                Dates: {{ kDayMonth(kfsTimestampToDate(comp.start_date)) }} - {{ kDayMonthYear(kfsTimestampToDate(comp.end_date)) }}
              </p>
              <p v-else>
                Time TBD
              </p>
              <p v-if="getCompState(comp) === eCompStates.FINISHED" class="is-size-3">Competition finished</p>
            </div>
            <div class="description mb-4">
              {{ getExcerpt(comp) }}
            </div>
            <template v-if="showEnterButton">
              <button
                v-if="getCompState(comp) === eCompStates.IN_PROGRESS || getCompState(comp) === eCompStates.UNAVAILABLE"
                @click.stop.prevent="onEnterCompetition(comp)"
                class="button is-primary"
                :disabled="getCompState(comp) === eCompStates.UNAVAILABLE"
              >
                Join this collaboration
              </button>
              <button
                v-else-if="getCompState(comp) === eCompStates.FINISHED"
                @click.stop.prevent=""
                class="button is-primary"
                disabled
              >
                Collaboration Finished
              </button>
            </template>
          </router-link>
        </div>
        <div v-if="comp.image" class="column">
          <figure class="image is-4x3">
            <img :src="comp.image.url">
          </figure>
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
    },
    getExcerpt(comp:Competition):string {
      let result = ''
      let div = document.createElement("div")
      div.innerHTML = comp.description
      let first_paragraph = div.querySelector('p')
      if (first_paragraph) {
        result = first_paragraph.textContent || first_paragraph.innerText || ''
      }
      if (!result) {
        result = div.textContent || div.innerText || ""
        if (result) {
          result = result.slice(0, 250) + '...'
        }
      }
      return result
    }
  }
})
</script>

<style lang="scss" scoped>
  .box--comp {
    padding: 2.25rem;
    cursor:pointer;
    border: 1px solid #E0E0E0;
  }
  .is-grid .box--comp {
    width: 400px;
  }
  .description {
    font-size: 1em;
    color: #1A1A1A;
  }
  figure {
    border-radius: .5em;
    overflow: hidden;
  }
  @include until($tablet) {
    .columns {
      display: flex;
      flex-direction: column-reverse;
    }
	}
</style>