<template>
  <section 
    v-if="team" 
    class="p-4"
  >
    <header class="mb-4">
      <nav class="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li>
            <router-link :to="{ name: 'team-show', params: { id: $route.params.id }}">
              &lt; Back
            </router-link>
          </li>
        </ul>
      </nav>
      <h1 class="title is-3">Edit Team</h1>
    </header>
    <article>
      <team-form
        v-if="team"
        :team="team"
        @cancel="onCancel"
      />
    </article>
  </section>
  <div v-else-if="error" class="notification is-error">>
    {{ error }}
  </div>
  <loading v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team } from '@/types'
import Loading from '@/components/Loading.vue'
import TeamForm from '@/components/team/TeamForm.vue'
import { useTeamsStore } from '@/store/teams'
import { mapStores } from 'pinia'
import { ERROR_PAGE_LOAD } from '@/consts'
import log from '@/services/logger'

const MODULE_ID = 'views/teams/TeamEdit'

export default defineComponent({
  components: { TeamForm, Loading },
  data() {
    return {
      team: undefined as Team | undefined,
      error: ''
    }
  },
  computed: {
    ...mapStores(useTeamsStore)
  },
  created() {
    const id = this.$route.params.id as string
    this.setTeamByID(id)
  },
  methods: {
    setTeamByID(id:string) {
      this.teamsStore.getTeamById(id)
        .then(result => {
          if (result) {
            this.team = result
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
      if (this.team){
        const id = this.$route.params.id
        this.$router.replace({ name: 'team-show', params: { id: this.team.id }})
      }
    }
  }
})

</script>

<style scoped>
</style>