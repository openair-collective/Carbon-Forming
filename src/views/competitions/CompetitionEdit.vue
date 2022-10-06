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
      <div 
        v-if="error"
        class="notification is-error">
      >
      {{ error }}
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
import { ERROR_PAGE_LOAD } from '@/consts'
import log from '@/services/logger'

const MODULE_ID = 'views/CompetitionNew'

export default defineComponent({
  components: { CompetitionForm, Loading },
  data() {
    return {
      competition: undefined as Competition | undefined,
      error: ''
    }
  },
  computed: { 
    ...mapStores(useCompetitionsStore),
    ...mapState(useCompetitionsStore, ['list'])
  },
  created() {
    const id = this.$route.params.id as string
    this.setCompetitonByID(id)
  },
  methods: {
    setCompetitonByID(id:string) {
      this.competitionsStore.getCompetitionById(id)
        .then(result => {
          if (result) {
            this.competition = result
          }
          else {
            this.error = ERROR_PAGE_LOAD
          }
        })
        .catch(error => {
          this.error = ERROR_PAGE_LOAD
        })
    },
    onCancel() {
      this.$router.replace({ name: 'comp-show', params: { id: this.$route.params.id }})
    }
  }
})

</script>

<style scoped>
</style>