<template>
  <form @submit.prevent="submitForm" :disabled="saving">
    <div class="field"> 
      <label class="label">Name</label>
      <div class="control">
        <input class="input" type="text" v-model="competition.name" required>
      </div>
    </div>
    <div class="field"> 
      <label class="label">Description</label>
      <div class="control">
        <textarea class="textarea" v-model="competition.description"></textarea>
      </div>
    </div>
    <div class="field is-grouped is-grouped-right">
      <div class="control">
        <button @click="$emit('cancel')" class="button is-outlined">
          Cancel
        </button>
      </div>
      <div class="control">
        <button type="submit" class="button is-primary">
          {{ competition.id === undefined ? 'Create Competition' : 'Update Competition' }}
        </button>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Competition } from '@/types'
import { mapStores } from 'pinia'
import { useCompetitionsStore } from '@/store/competitions'
import log from '@/services/logger'

const MODULE_ID = 'components/CompetitionForm'

export default defineComponent({
  props: {
    competition: {
      type: Object as () => Competition,
      required: true
    }
  },
  data() {
    return {
      error: '',
      saving: false
    }
  },
  computed: {
    ...mapStores(useCompetitionsStore)
  },
  methods: {
    submitForm() {
      this.saving = true
      this.competitionsStore.saveCompetition(this.competition)
        .then(result => {
          this.$emit("comp-saved", result)
        })
        .catch(error => {
          log.error(MODULE_ID, error)
        })
        .finally(() => {
          this.saving = false
        })
    }
  }
})
</script>
