<template>
  <main>
    <section class="p-4">
      <h1 class="title is-3">Create Competition</h1>
      <competition-form
        :competition="competition"
        @comp-saved="onSaved"
        @cancel="onCancel"
      />
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Competition } from '@/types'
import CompetitionForm from '@/components/CompetitionForm.vue'
import log from '@/services/logger'

const MODULE_ID = 'views/CompetitionNew'

export default defineComponent({
  components: { CompetitionForm },
  computed: {
    competition():Competition {
      return {
        name: '',
      } as Competition
    }
  },
  methods: {
    onCancel() {
      this.$router.replace({ name: 'competitions'})
    },
    onSaved(comp:Competition) {
        if (comp) {
          this.$router.push({ name: 'comp-show', params: { id: comp.id }})
        }
        else {
          log.warn(MODULE_ID, '#onSaved > Error creating Competition')
        }
    }
  }
})

</script>

<style scoped>
</style>