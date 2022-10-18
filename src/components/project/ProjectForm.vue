<template>
  <div>
    <form @submit.prevent="submitProjectForm" :disabled="isSaving">
      <project-input 
        :project="clone"
        ref="project_input" 
      />
      <hr/>
      <div class="field is-grouped is-grouped-right">
        <div class="control">
          <a @click.prevent="$emit('cancel')" class="button is-outlined">
            Cancel
          </a>
        </div>
        <div class="control">
          <button 
            type="submit" 
            class="button is-primary"
            :class="{'is-loading': isSaving}"
            :disabled="disableSubmit"
          >
            Save Project
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team, Project } from '@/types'
import { LogLevel } from '@/enums'
import { mapStores } from 'pinia'
import { useTeamsStore } from '@/store/teams'
import { useProjectsStore } from '@/store/projects'
import { useFlashStore } from '@/store/flash'
import ProjectInput from '@/components/project/ProjectInput.vue'
import Notification from '@/components/Notification.vue'

import log from '@/services/logger'
const MODULE_ID = 'components/project/ProjectForm'

const PROJECT_PARTIAL = {
  id: '',
  name: '',
  terms: false,
  design_doc_url: '',
  materials: [],
  team: undefined
} as Project

export default defineComponent({
  components: { Notification, ProjectInput },
  props: {
    team: {
      type: Object as () => Team,
      required: true
    },
    project: {
      type: Object as () => Project,
      default: PROJECT_PARTIAL
    }
  },
  data() {
    return {
      clone: {
        ...PROJECT_PARTIAL,
        ...this.project,
        ...{ team: this.team } 
      } as Project,
      isSaving: false,
      inputRef: undefined as InstanceType<typeof ProjectInput>|undefined
    }
  },
  computed: {
    ...mapStores(useTeamsStore, useProjectsStore, useFlashStore),
    disableSubmit():boolean {
      return !this.clone.name || !this.clone.terms
    }
  },
  mounted() {
    this.inputRef = this.$refs.project_input as InstanceType<typeof ProjectInput>
  },
  methods: {
    submitProjectForm() {
      this.isSaving = true
      this.flashStore.$reset()
      if (this.inputRef) {
        if (this.inputRef.hasValidMaterials) {
          this.teamsStore.saveTeamProject(this.team, this.clone, this.inputRef.docFile)
            .then(result => {
              Object.assign(this.project, result)
              this.clone = { ...this.project }
              this.flashStore.$patch({ message: 'Project saved', level: LogLevel.success })
              this.$emit("project-saved", this.project)
            })
            .catch(error => {
              log.error(MODULE_ID, error)
            })
            .finally(() => {
              this.isSaving = false
            })
        }
        else {
          let error = ''
          if (!this.inputRef.hasValidMaterials) {
            error = "Some materials are missing required fields."
          }
          this.flashStore.$patch({ message: error, level: LogLevel.error })
        }
      }
    }
  }
})
</script>
