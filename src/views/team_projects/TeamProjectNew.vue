<template>
  <nav class="breadcrumb" aria-label="breadcrumbs">
    <ul>
      <li>
      <router-link :to="{ name: 'team-show', params: { id: team.id }}">
          &lt; Back to projects
        </router-link>
      </li>
    </ul>
  </nav>
  <section>
    <h1 class="title is-3">Add Team Idea</h1>
    <project-form
      :team="team"
      @project-saved="onProjectSaved"
      @cancel="onCancel"
      class="p-4"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team, Project } from '@/types'
import { LogLevel } from '@/enums'
import { ERROR_AUTH } from '@/consts'
import ProjectForm from '@/components/project/ProjectForm.vue'
import { canEditTeamWithId } from '@/helpers/authHelper'
import { mapStores} from 'pinia'
import { useUserStore } from '@/store/user'
import { useFlashStore } from '@/store/flash'

export default defineComponent({
  components: { ProjectForm },
  props: {
    team: {
      type: Object as () => Team,
      required: true
    }
  },
  computed: {
    ...mapStores(useUserStore, useFlashStore)
  },
  created() {
    const profile = this.userStore.profile
    if (!profile || !canEditTeamWithId(profile, this.team.id)) {
      this.$router.push({name: 'team-show', params: { id: this.team.id }})
        .then(() => {
          this.flashStore.$patch({ message: ERROR_AUTH, level: LogLevel.warning })
        })
    }
  },
  methods: {
    onCancel() {
      const id = this.$route.params.id
      this.$router.replace({ name: 'team-show', params: { id: id }})
    },
    onProjectSaved(project:Project) {
      const id = this.$route.params.id
      this.$router.replace({ 
        name: 'team-project-show', 
        params: { id: id, project_id: project.id }
      })
    }
  }
})

</script>

<style scoped>
</style>