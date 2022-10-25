<template>
  <section>
    <nav class="breadcrumb" aria-label="breadcrumbs">
      <ul>
        <li>
          <router-link :to="{ name: 'team-projects', params: { id: $route.params.id }}">
            &lt; Back to projects
          </router-link>
        </li>
      </ul>
    </nav>
    <article class="article">
      <template v-if="project">
        <project-view :project="project" />
      </template>
      <loading v-else />
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { Team, Project } from '@/types'
import ProjectView from '@/components/project/Project.vue'
import Loading from '@/components/Loading.vue'
import { useTeamsStore } from '@/store/teams'
import { useUserStore } from '@/store/user'
import { useFlashStore } from '@/store/flash'
import { canEditTeamWithId } from '@/helpers/authHelper'
import { ERROR_NOT_FOUND } from '@/consts'
import { LogLevel } from '@/enums'
import log from '@/services/logger'

const MODULE_ID = 'views/team_projects/TeamProject'

export default defineComponent({
  components: { Loading, ProjectView },
  props: {
    team: {
      type: Object as () => Team,
      required: true
    }
  },
  data() {
    return {
      project: undefined as Project | undefined,
      error:''
    }
  },
  computed: {
    ...mapStores(useTeamsStore, useUserStore, useFlashStore),
    canEdit():boolean {
      let result = false
      if (this.userStore.profile) {
        result = canEditTeamWithId(this.userStore.profile, this.team.id)
      }
      return result
    }
  },
  created() {
    let project_id = this.$route.params.project_id as string
    this.teamsStore.getTeamProjectById(this.team, project_id)
      .then(result => {
        if (result) {
          this.project = result
        }
        else {
          throw new Error('Team not found.')
        }
      })
      .catch(error => {
        this.$router.replace({ name: 'team-projects', params: { id: this.team.id }})
          .then(()=> {
            this.flashStore.$patch({ 
              message: ERROR_NOT_FOUND,
              level: LogLevel.error
            })
          })
      })
  }
})

</script>

<style scoped>
</style>