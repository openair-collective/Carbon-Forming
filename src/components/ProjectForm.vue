<template>
  <div>
    <notification 
      v-if="success || error"
      :error="error" 
      :success="success" 
      @remove="clearMessages" />
    <form @submit.prevent="submitProjectForm" :disabled="isSaving">
      <div class="field"> 
        <label class="label">Project Name</label>
        <div class="control">
          <input class="input" type="text" v-model="clone.name" required>
        </div>
      </div>
      <hr/>
      <h2 class="title is-4">Bill of Materials</h2>
        <p class="mb-2">Please list all of the materials used in the construction of your project.</p>
        <div>
          <table class="table is-fullwidth">
            <thead>
              <tr>
                <th>Item Name*</th>
                <th style="width:15%">Price*</th>
                <th style="width:10%">Quantity*</th>
                <th>Purchase Link</th>
                <th style="width:15%"></th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(m, i) in clone.materials" 
                :key="'m'+ i"
              >
                <td><input type="text" class="input" v-model="m.name" /></td>
                <td>
                  <div class="field has-addons">
                    <p class="control">
                      <a class="button is-static">
                        $
                      </a>
                    </p>
                    <p class="control">
                      <input type="number" class="input" min="0.00" step="1.00" v-model="m.cost" />
                    </p>
                  </div>
                </td>
                <td><input type="number" class="input" v-model="m.quantity" min="1" /></td>
                <td><input type="text" class="input" v-model="m.link" /></td>
                <td>
                    <a
                      @click="removeMaterialAtIndex(i)"
                      class="button is-text"
                    >
                      {{ i == 0 ? 'Clear' : 'Remove' }}
                    </a>
                </td>
              </tr>
            </tbody>
            <a
              @click="addMaterial"
              class="button is-primary m-2"
            >
              + Add More Materials
            </a>
          </table>
        </div>
      <hr/>
      <h2 class="title is-4">Design Document</h2>
      <p class="mb-2">Please upload or link to a document that outlines the design of your project.</p>
      <div v-if="clone.design_doc" >
        <div class="field is-grouped">
          <div class="control">
            <button
              @click.prevent="removeDesignDoc"
              class="button is-warning"
            >
              Remove Document
            </button>
          </div>
          <div class="control">
            <a
              :href="clone.design_doc.url"
              target="_blank" 
              class="button is-outlined"
            >
              Preview Document
            </a>
          </div>
        </div>
      </div>
      <div v-else class="is-flex is-flex-direction-row">
        <div>
          <label class="label">Upload a document</label>
          <div class="file has-name">
            <label class="file-label">
              <input
                @change="onDesignDocFileChange"
                class="file-input" 
                type="file"
                accept="application/pdf"
                ref="file_design_doc"
                :disabled="!!clone.design_doc_url"
              > 
              <span class="file-cta">
                <span class="file-label">
                  {{ docFile ? 'Change Document' : 'Upload Document' }}
                </span>
              </span>
              <span v-if="docFile" class="file-name">
                {{ docFile.name }} ( {{ docFile.size / 100 }}kb )
              </span>
            </label>
          </div>
          <p class="help is-info">
            Accepts pdf files only.<br/> Maximum file size is {{ kDocMaxFileSize / 1000 }}kb.
          </p>
        </div>
        <div class="mx-6">
          <label class="label">or</label>
        </div>
        <div class="is-flex-grow-1">
          <div class="field"> 
            <label class="label">Design document link</label>
            <div class="control">
              <input
                class="input" 
                type="text"
                v-model="clone.design_doc_url"
                :disabled="!!docFile"
              >
            </div>
          </div>
        </div>
      </div>
      <hr/>
      <h2 class="title is-4">Share your project on the OpenAir GitHub</h2>
      <p class="mb-2">By sharing your project on the OpenAir GitHub you will help to drive innovation and progress in Carbon Dioxide Removal and Storage technology.</p>
      <div class="field"> 
        <div class="control">
          <label class="checkbox">
            <input type="checkbox" v-model="clone.terms" required>
              By ticking this checkbox you agree to have your project posted on the OpenAir Github under the <a href="#">open source licence</a>
            </label>
        </div>
      </div>
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
import { Team, Project, Material } from '@/types'
import log from '@/services/logger'
import { mapStores } from 'pinia'
import { useTeamsStore } from '@/store/teams'
import { useProjectsStore } from '@/store/projects'
import Notification from '@/components/Notification.vue'

const MODULE_ID = 'components/TeamForm'
const DESIGN_DOC_MAX_FILE_SIZE = 200 * 1000 // 200k

function initMaterial():Material {
  return {
    name: '',
    cost: 0.00,
    quantity: 1,
    link: ''
  }
}

export default defineComponent({
  components: { Notification },
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
      kDocMaxFileSize: DESIGN_DOC_MAX_FILE_SIZE,
      clone: { ...this.project } as Project,
      success: '',
      error: '',
      isSaving: false,
      docFile: undefined as File|undefined
    }
  },
  computed: {
    ...mapStores(useTeamsStore, useProjectsStore),
    disableSubmit():boolean {
      return !this.clone.name || !this.clone.terms
    },
    hasValidMaterials():boolean {
      const materialErrors = this.project.materials.filter(p => {
        return !p.name || !p.cost || !p.quantity
      })
      return materialErrors.length === 0
    },
    hasValidDesignDoc():boolean {
      let result = !!this.clone.design_doc_url
      if (this.docFile) {
        result = this.docFile.size < DESIGN_DOC_MAX_FILE_SIZE
      }
      return result
    }
  },
  created() {
    if (!this.clone.materials || !this.clone.materials.length) {
      this.clone.materials = [initMaterial()]
    }
  },
  methods: {
    clearMessages() {
      this.success = ''
      this.error = ''
    },
    onDesignDocFileChange(event:Event) {
      const files = (event.target as HTMLInputElement).files
      this.docFile = files && files.length ? files[0] : undefined
    },
    addMaterial() {
      this.clone.materials.push(initMaterial())
    },
    removeMaterialAtIndex(idx:number) {
      if (this.clone.materials.length === 1) {
        this.clone.materials = [initMaterial()]
      }
      else {
        this.clone.materials.splice(idx, 1)
      }
    },
    removeDesignDoc() {
      this.clearMessages()
      if (this.clone.design_doc && confirm("Are you sure you want to remove the Document?")) {
        this.isSaving = true
        this.projectsStore.removeProjectDesignDoc(this.clone)
          .then(result => {
            if (result) {
              this.success = 'Design document removed'
              this.docFile = undefined
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
    },
    submitProjectForm() {
      this.isSaving = true
      this.clearMessages()
      if (this.hasValidMaterials && this.hasValidDesignDoc) {
        this.teamsStore.saveTeamProject(this.team, this.clone, this.docFile)
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
        if (!this.hasValidMaterials) {
          this.error = this.error + "Some materials are missing required fields."
        }
        if (!this.hasValidDesignDoc) {
          this.error = this.error + `The Design Document file size cannot exceed ${DESIGN_DOC_MAX_FILE_SIZE}kb.`
        }
      }
    }
  }
})
</script>
