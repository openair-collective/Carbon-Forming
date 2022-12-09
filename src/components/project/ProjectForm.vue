<template>
  <section class="section">
    <form @submit.prevent="submitProjectForm" :disabled="isSaving">
      <project-input 
        :project="clone"
        ref="project_input"
        @remove-image="removeImage"
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
  </section>
  <section class="section mt-6">
    <div
      v-if="project.id"
      class="p-4 has-background-light"
    >
      <h3 class="title is-5">Delete Project</h3>
      <p><strong>Warning:</strong> Deleting a Project is irreversible. All associated data will also be deleted.</p>
      <button
        class="button is-danger mt-3"
        @click="confirmDelete(project)"
      >
        Delete Project
      </button>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team, Project } from '@/types'
import { LogLevel } from '@/enums'
import { mapStores } from 'pinia'
import { useTeamsStore } from '@/store/teams'
import { useProjectsStore } from '@/store/projects'
import { useModalStore } from '@/store/modal'
import { useFlashStore } from '@/store/flash'
import ProjectInput from '@/components/project/ProjectInput.vue'
import Notification from '@/components/Notification.vue'

import log from '@/services/logger'
const MODULE_ID = 'components/project/ProjectForm'

const PROJECT_PARTIAL = {

} as Project

function projectFactory():Project {
  return {
    id: '',
    name: '',
    terms: false,
    design_doc_url: '',
    materials: [],
    team: undefined,
    image: null
  }
}

export default defineComponent({
  name: 'project-form',
  emits: ['cancel', 'project-saved', 'project-deleted'],
  components: { Notification, ProjectInput },
  props: {
    team: {
      type: Object as () => Team,
      required: true
    },
    project: {
      type: Object as () => Project,
      default() {
        return projectFactory()
      }
    }
  },
  data() {
    return {
      clone: Object.assign(
        {},
        projectFactory(),
        { team: this.team } 
      ) as Project, // clone so we can modify
      isSaving: false,
      inputRef: undefined as InstanceType<typeof ProjectInput>|undefined
    }
  },
  computed: {
    ...mapStores(useTeamsStore, useProjectsStore, useFlashStore, useModalStore),
    disableSubmit():boolean {
      return !this.clone.name || !this.clone.terms
    }
  },
  mounted() {
    this.inputRef = this.$refs.project_input as InstanceType<typeof ProjectInput>
  },
  methods: {
    removeImage() {
      this.flashStore.$reset()
      if (this.inputRef && this.clone.image && confirm("Are you sure you want to remove the image?")) {
        this.isSaving = true
        this.projectsStore.removeProjectImage(this.project)
          .then(result => {
            if (result) {
              this.flashStore.$patch({ message: 'image removed', level: LogLevel.success })
              Object.assign(this.project, result)
              this.clone = { ...this.project }
            }
          })
          .catch(error => {
            this.flashStore.$patch({ message: 'Error removing Design Doc. Please try again.', level: LogLevel.error })
          })
          .finally(()=> {
            this.isSaving = false
          })
      }
    },
    submitProjectForm() {
      this.isSaving = true
      this.flashStore.$reset()
      if (this.inputRef) {
        if (this.inputRef.hasValidMaterials && this.inputRef.hasValidImage) {
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
          if (!this.inputRef.hasValidImage) {
            error = "The project image is not in the required format."
          }
          this.flashStore.$patch({ message: error, level: LogLevel.error })
          this.isSaving = false
        }
      }
    },
    confirmDelete(project:Project) {
      this.modalStore.options = {
        title: '',
        component: 'Confirm',
        meta: {
          message: `Are you sure you want to delete ${project.name}?`,
          confirm: () => { this.deleteProject(project) },
          confirmLabel: 'Yes, I want to delete this project',
          cancelLabel: 'No, don\'t delete',
          danger: true
        }
      }
    },
    deleteProject(project:Project) {
      this.projectsStore.deleteProject(project)
        .then(result => {
            this.$emit("project-deleted")
          })
          .catch(error => {
            this.flashStore.$patch({ message: 'Error deleting project. Please try again.', level: LogLevel.error })
            log.error(MODULE_ID, error)
          })
          .finally(() => {
            this.isSaving = false
          })
    }
  }
})
</script>
