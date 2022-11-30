<template>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Competition } from '@/types'
import { useUserStore } from '@/store/user'
import { useModalStore } from '@/store/modal'
import { useFlashStore } from '@/store/flash'
import { mapStores } from 'pinia'
import { COMP_STATES, getCompState } from '@/helpers/compHelper'
import { LogLevel } from '@/enums'

export default defineComponent({
  props: {
    competition: {
      type: Object as () => Competition,
      required: true
    }
  },
  computed: {
    ...mapStores(useUserStore, useModalStore, useFlashStore)
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      const that = (vm as any)
      that.openWizard()
    })
  },
  methods: {
    openWizard() {
      const state = getCompState(this.competition)
      if (state === COMP_STATES.IN_PROGRESS) {
        if (this.userStore.isAuthenticated) {
          this.$router.replace({ 
              name: 'comp-show', 
              params: { id: this.competition.id }
            })
            .then(() => {
              this.modalStore.options = {
                component: 'EnterCompetition',
                title: '',
                fullscreen: true,
                meta: {
                  competition: this.competition
                }
              }
            })
        }
        else {
          this.$router.push({ 
            name: 'login'
          })
        }
      }
      else {
        this.$router.replace({ 
          name: 'comp-show', 
          params: { id: this.competition.id }
        })
        .then(() => {
          this.flashStore.$patch({
            message: 'This competition is not currently accepting submissions.',
            level: LogLevel.warning
          })
        })
      }
    }
  }
})
</script>