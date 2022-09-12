<template>
  <main>
    <section class="p-4">
      <h1 class="title is-3">Edit Competition</h1>
      <div v-if="errors.list">
      </div>
      <competition-form
        v-else-if="competition"
        :competition="competition"
        @comp-saved="onSaved"
        @cancel="onCancel"
      />
      <div v-else>
        Loading...
      </div>
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Competition } from '@/types'
import CompetitionForm from '@/components/CompetitionForm.vue'
import { mapState, mapStores } from 'pinia'
import { useCompetitionsStore } from '@/store/competitions'
import log from '@/services/logger'

const MODULE_ID = 'views/CompetitionNew'

export default defineComponent({
  components: { CompetitionForm },
  data() {
    return {
      competition: undefined as Competition|undefined,
      errors: {
        list: ''
      }
    }
  },
  computed: { 
    ...mapStores(useCompetitionsStore),
    ...mapState(useCompetitionsStore, ['list'])
  },
  created() {
    const id = this.$route.params.id as string
    if (!this.list || !this.list.length) {
      this.competitionsStore.fetchList()
        .then(()=> this.setCompetitonByID(id))
        .catch(error => {
          this.errors.list = 'Competition cannot be edited at this time. <PROMPT>'
        })
    }
    else {
      this.setCompetitonByID(id)
    }
  },
  methods: {
    setCompetitonByID(id:string) {
      this.competition = this.list &&  this.list.find(t => t.id === id)
    },
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