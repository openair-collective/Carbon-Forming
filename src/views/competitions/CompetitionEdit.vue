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
      <competition-form
        v-if="competition"
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
import { LogLevel } from '@/enums'
import CompetitionForm from '@/components/competition/CompetitionForm.vue'
import Loading from '@/components/Loading.vue'
import { mapState, mapStores } from 'pinia'
import { useCompetitionsStore } from '@/store/competitions'
import { useUserStore } from '@/store/user'
import { useFlashStore } from '@/store/flash'
import { ERROR_NOT_FOUND, ERROR_AUTH } from '@/consts'
import { canEditCompetitions } from '@/helpers/authHelper'
import log from '@/services/logger'

const MODULE_ID = 'views/CompetitionNew'

export default defineComponent({
  components: { CompetitionForm, Loading },
  data() {
    return {
      competition: undefined as Competition | undefined,
    }
  },
  computed: { 
    ...mapStores(useCompetitionsStore, useUserStore, useFlashStore),
    ...mapState(useCompetitionsStore, ['list'])
  },
  created() {
    const id = this.$route.params.id as string
    this.setCompetitonByID(id)
  },
  methods: {
    setCompetitonByID(id:string) {
      const guild = this.userStore.guild
      if (guild && canEditCompetitions(guild)) {
        this.competitionsStore.getCompetitionById(id)
          .then(result => {
            if (result) {
              this.competition = result
            }
            else {
              throw new Error('Competition not found.')
            }
          })
          .catch(error => {
            this.$router.replace({ name: 'competitions'})
              .then(()=> {
                this.flashStore.$patch({ 
                  message: ERROR_NOT_FOUND,
                  level: LogLevel.error
                })
              })
          })
      }
      else {
        this.$router.push({name: 'comp-show', params: { id }})
          .then(() => {
            this.flashStore.$patch({ message: ERROR_AUTH, level: LogLevel.warning })
          })
      }
    },
    onCancel() {
      this.$router.replace({ name: 'comp-show', params: { id: this.$route.params.id }})
    }
  }
})

</script>

<style scoped>
</style>