<template>
  <form @submit.prevent="submitProjectForm" :disabled="saving">
    <div class="field"> 
      <label class="label">Project Name</label>
      <div class="control">
        <input class="input" type="text" v-model="project.name" required>
      </div>
    </div>
    <hr/>
    <h2 class="title is-4">Bill of Materials</h2>
    <hr/>
    <h2 class="title is-4">Design Document</h2>
    <hr/>
    <h2 class="title is-4">Share your project on the OpenAir GitHub</h2>
    <p class="mb-2">By sharing your project on the OpenAir GitHub you will help to drive innovation and progress in Carbon Dioxide Removal and Storage technology.</p>
    <div class="field"> 
      <div class="control">
        <label class="checkbox">
          <input type="checkbox" v-model="project.terms" required>
            By ticking this checkbox you agree to have your project posted on the OpenAir Github under the <a href="#">open source licence</a>
          </label>
      </div>
    </div>
    <hr/>
    <div class="field is-grouped is-grouped-right">
      <div class="control">
        <button @click="$emit('cancel')" class="button is-outlined">
          Cancel
        </button>
      </div>
      <div class="control">
        <button type="submit" class="button is-primary">
          {{ project.id === undefined ? 'Create Project' : 'Update Project' }}
        </button>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team, Project } from '@/types'
import log from '@/services/logger'
import { mapStores } from 'pinia'
import { useTeamsStore } from '@/store/teams'

const MODULE_ID = 'components/TeamForm'

export default defineComponent({
  props: {
    team: {
      type: Object as () => Team,
      required: true
    },
    project: {
      type: Object as () => Project,
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
    ...mapStores(useTeamsStore)
  },
  methods: {
    submitProjectForm() {
      this.saving = true
      this.teamsStore.saveTeamProject(this.team, this.project)
        .then(result => {
          this.$emit("project-saved", result)
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
