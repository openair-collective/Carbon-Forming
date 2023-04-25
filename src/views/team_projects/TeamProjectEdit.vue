<template>
  <nav class="breadcrumb" aria-label="breadcrumbs">
    <ul>
      <li>
        <router-link :to="{ name: 'team-project-show', params: { project_id: $route.params.project_id }}">
          &lt; Back
        </router-link>
      </li>
    </ul>
  </nav>
  <section>
    <h1 class="title is-3">Edit Project</h1>
    <project-form
      v-if="project"
      :team="team"
      :project="project"
      @cancel="onCancel"
      @project-deleted="onProjectDeleted"
      @project-saved="scrollTop"
      @project-error="scrollTop"
    />
    <loading v-else />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team, Project } from '@/types'
import { LogLevel } from '@/enums'
import { ERROR_AUTH } from '@/consts'
import { mapStores } from 'pinia'
import { useTeamsStore } from '@/store/teams'
import { useUserStore } from '@/store/user'
import { useFlashStore } from '@/store/flash'
import { canEditTeamWithId } from '@/helpers/authHelper'
import { scrollTop } from '@/utils/window'
import ProjectForm from '@/components/project/ProjectForm.vue'
import Loading from '@/components/Loading.vue'

const MODULE_ID = 'views/TeamProjectEdit'

export default defineComponent({
  components: { ProjectForm, Loading },
  props: {
    team: {
      type: Object as () => Team,
      required: true
    }
  },
  data() {
    return {
      project: undefined as Project|undefined,
    }
  },
  computed: {
    ...mapStores(useTeamsStore, useUserStore, useFlashStore)
  },
  async created() {
    const profile = this.userStore.profile
    let project_id = this.$route.params.project_id as string
    if (profile && canEditTeamWithId(profile, this.team.id)) {
      this.project = await this.teamsStore.getTeamProjectById(this.team, project_id)
    }
    else {
      this.$router.push({name: 'team-project-show', params: { project_id }})
        .then(() => {
          this.flashStore.$patch({ message: ERROR_AUTH, level: LogLevel.warning })
        })
    }
  },
  methods: {
    scrollTop,
    onCancel() {
      const project_id = this.$route.params.project_id
      this.$router.replace({ name: 'team-project-show', params: { project_id }})
    },
    onProjectDeleted() {
      this.$router.replace({ name: 'team-show', params: { id: this.team.id }})
        .then(()=> {
          this.flashStore.$patch({ 
            message: 'Project deleted',
            level: LogLevel.success
          })
        })
    }
  }
})

</script>

<style scoped>
</style>