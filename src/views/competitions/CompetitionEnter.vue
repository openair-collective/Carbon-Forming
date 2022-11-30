<template>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Competition } from '@/types'
import { useUserStore } from '@/store/user'
import { useModalStore } from '@/store/modal'
import { mapStores } from 'pinia'

export default defineComponent({
  props: {
    competition: {
      type: Object as () => Competition,
      required: true
    }
  },
  computed: {
    ...mapStores(useUserStore, useModalStore)
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      const that = (vm as any)
      that.openWizard()
    })
  },
  methods: {
    openWizard() {
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
  }
})
</script>