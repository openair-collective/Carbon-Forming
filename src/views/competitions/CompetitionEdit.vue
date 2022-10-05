<template>
  <section class="p-4">
    <header class="mb-4">
      <nav class="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li>
            <router-link :to="{ name: 'comp-show', params: { id: $route.params.id }}">
              &lt; Back
            </router-link>
          </li>
        </ul>
      </nav>
      <h1 class="title is-3">Edit Competition</h1>
    </header>
    <article>
      <div v-if="errors.list">
      </div>
      <competition-form
        v-else-if="competition"
        :competition="competition"
        @cancel="onCancel"
      />
      <loading v-else />
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Competition } from '@/types'
import CompetitionForm from '@/components/competition/CompetitionForm.vue'
import Loading from '@/components/Loading.vue'
import { mapState, mapStores } from 'pinia'
import { useCompetitionsStore } from '@/store/competitions'
import log from '@/services/logger'

const MODULE_ID = 'views/CompetitionNew'

export default defineComponent({
  components: { CompetitionForm, Loading },
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
      this.$router.replace({ name: 'comp-show', params: { id: this.$route.params.id }})
    }
  }
})

</script>

<style scoped>
</style>