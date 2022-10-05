<template>
  <div>
    <notification 
      v-if="success || error"
      :error="error" 
      :success="success" 
      @remove="clearMessages" />
    <form @submit.prevent="submitProjectForm" :disabled="isSaving">
      <project-input 
        :project="clone"
        @remove-design-doc="removeDesignDoc"
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
import { Team, Project, Material, FileUpload } from '@/types'
import { mapStores } from 'pinia'
import { useTeamsStore } from '@/store/teams'
import { useProjectsStore } from '@/store/projects'
import ProjectInput from './project/ProjectInput.vue'
import Notification from '@/components/Notification.vue'

import log from '@/services/logger'
const MODULE_ID = 'components/ProjectForm'

function initMaterial():Material {
  return {
    name: '',
    cost: 0.00,
    quantity: 1,
    link: ''
  }
}

export default defineComponent({
  components: { Notification, ProjectInput },
  props: {
    team: {
      type: Object as () => Team,
      required: true
    },
    project: {
      type: Object as () => Project,
      default: {
        name: '',
        terms: false,
        design_doc: null as FileUpload | null,
        design_doc_url: '',
        materials: [] as Material[]
      }
    }
  },
  data() {
    return {
      clone: { ...this.project } as Project,
      success: '',
      error: '',
      isSaving: false,
      inputRef: undefined as InstanceType<typeof ProjectInput>|undefined
    }
  },
  computed: {
    ...mapStores(useTeamsStore, useProjectsStore),
    disableSubmit():boolean {
      return !this.clone.name || !this.clone.terms
    }
  },
  created() {
    if (!this.clone.materials || !this.clone.materials.length) {
      this.clone.materials = [initMaterial()]
    }
  },
  mounted() {
    this.inputRef = this.$refs.project_input as InstanceType<typeof ProjectInput>
  },
  methods: {
    clearMessages() {
      this.success = ''
      this.error = ''
    },
    submitProjectForm() {
      this.isSaving = true
      this.clearMessages()
      if (this.inputRef) {
        if (this.inputRef.hasValidMaterials && this.inputRef.hasValidDesignDoc) {
          this.teamsStore.saveTeamProject(this.team, this.clone, this.inputRef.docFile)
            .then(result => {
              Object.assign(this.project, result)
              this.clone = { ...this.project }
              this.success = 'Project saved'
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
          if (!this.inputRef.hasValidMaterials) {
            this.error = this.error + "Some materials are missing required fields."
          }
          if (!this.inputRef.hasValidDesignDoc) {
            this.error = this.error + `The Design Document file size cannot exceed ${this.inputRef.kDocMaxFileSize}kb.`
          }
        }
      }
    },
    removeDesignDoc() {
      this.clearMessages()
      if (this.inputRef && this.clone.design_doc && confirm("Are you sure you want to remove the Document?")) {
        this.isSaving = true
        this.inputRef.removeDesignDoc()
          .then(result => {
            if (result) {
              this.success = 'Design document removed'
              Object.assign(this.project, result)
              this.clone = { ...this.project }
            }
          })
          .catch(error => {
            this.error = 'Error removing Design Doc. Please try again.'
          })
          .finally(()=> {
            this.isSaving = false
          })
      }
    }
  }
})
</script>
