<template>
  <section
    v-if="competition"
    class="section is-flex is-flex-direction-column p-0"
  >
    <header class="header pb-5">
      <div 
        v-if="competition.image && competition.image.url"
        class="competition-image has-background-grey-dark mb-5"
        :style="{ '--background-image': `url('${ competition.image.url }')` }">
        <img :src="competition.image.url" />
      </div>
      <div class="columns px-5">
        <div class="column is-8">
          <h1 class="title is-3">
            {{ competition.name }}
          </h1>
          <div class="buttons">
            <button
              v-if="competitionState === eCompStates.FINISHED"
              @click.stop.prevent=""
              class="button is-primary"
              disabled
            >
              Collaboration finished
            </button>
            <router-link 
              v-if="canEdit"
              :to="{ name: 'comp-edit', params: {id: competition.id }}"
              class="button is-info"
            >
              Edit this Collaboration
            </router-link>
          </div>
        </div>
        <div class="column">
          <div v-if="competition.start_date && competition.end_date"> 
            <h2 class="title is-5 mb-4">
              {{ kDayMonth(kfsTimestampToDate(competition.start_date)) }} - {{ kDayMonthYear(kfsTimestampToDate(competition.end_date)) }}
            </h2>
            <countdown-timer
              class="is-small"
              v-if="competitionState !== eCompStates.FINISHED"
              :start_date="kfsTimestampToDate(competition.start_date)"
              :end_date="kfsTimestampToDate(competition.end_date)"
            />
          </div>
        </div>
      </div>
    </header>
    <div class="px-5 my-5">
      <div class="columns">
        <div class="column is-8">
          <text-editor-content :value="competition.description" />
        </div>
        <div class="column"></div>
      </div>
    </div>
  </section>
  <loading v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Competition } from '@/types'
import { LogLevel, UserRole } from '@/enums'
import { mapStores } from 'pinia'
import { useUserStore } from '@/store/user'
import { useCompetitionsStore } from '@/store/competitions'
import { useModalStore } from '@/store/modal'
import { useFlashStore } from '@/store/flash'
import { dayMonth, dayMonthYear, fsTimestampToDate } from '@/utils/date'
import { isEmpty } from '@/utils/object'
import Loading from '@/components/Loading.vue'
import CountdownTimer from '@/components/CountdownTimer.vue'
import TextEditorContent from '@/components/TextEditorContent.vue'
import { ERROR_NOT_FOUND } from '@/consts'
import { 
  COMP_STATES, 
  getCompState 
} from  '@/helpers/compHelper'
import log from '@/services/logger'

const MODULE_ID ='views/competition'

export default defineComponent({
  components: { Loading, CountdownTimer, TextEditorContent},
  data() {
    return {
      eCompStates: COMP_STATES,
      kDayMonth: dayMonth,
      kDayMonthYear: dayMonthYear,
      kfsTimestampToDate: fsTimestampToDate,
      competition: null as Competition|null,
      competitionState: COMP_STATES.UNAVAILABLE,
      isSaving: false
    }
  },
  computed: { 
    ...mapStores(useCompetitionsStore, useUserStore, useModalStore, useFlashStore),
    canEdit():boolean {
      return this.userStore.role === UserRole.admin
    }
  },
  async created() {
    const id = this.$route.params.id as string
    this.setCompetitonByID(id)
  },
  methods: {
    getCompState,
    isEmpty,
    setCompetitonByID(id:string) {
      this.competitionsStore.getCompetitionById(id)
        .then(result => {
          if (result) {
            this.competition = result
            this.competitionState = getCompState(this.competition)
          }
          else {
            throw new Error('Collaboration not found.')
          }
        })
        .catch(error => {
          this.$router.replace({ name: 'collaborations'})
            .then(()=> {
              this.flashStore.$patch({ 
                message: ERROR_NOT_FOUND,
                level: LogLevel.error
              })
            })
        })
    }
  }
})

</script>

<style lang="scss" scoped>

.header {
  border-bottom: 1px solid $white-ter;
}

.competition-image {
  position: relative;
  height: 200px;
  text-align: center;
  overflow: hidden;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

@supports (filter: grayscale(1)) and (filter: blur(8px)) { 
  .competition-image::before {
    position: absolute;
    z-index: 0;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    content: ' ';
    display: block;
    background-image: var(--background-image);
    background-size: 300%;
    background-position: center;
    background-repeat: no-repeat;
    filter: grayscale(1) blur(8px) brightness(.25);
  }
}
.competition-image img {
  max-height: 100%;
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
}
</style>
