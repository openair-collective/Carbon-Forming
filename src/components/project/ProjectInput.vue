<template>
  <div>
    <div class="field"> 
      <label class="label">Project Name</label>
      <div class="control">
        <input class="input" type="text" v-model="project.name" required>
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
              v-for="(m, i) in project.materials" 
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
    <div v-if="project.design_doc" >
      <div class="field is-grouped">
        <div class="control">
          <button
            @click.prevent="$emit('remove-design-doc')"
            class="button is-warning"
          >
            Remove Document
          </button>
        </div>
        <div class="control">
          <a
            :href="project.design_doc.url"
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
              :disabled="!!project.design_doc_url"
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
              v-model="project.design_doc_url"
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
          <input type="checkbox" v-model="project.terms" required>
            By ticking this checkbox you agree to have your project posted on the OpenAir Github under the <a href="#">open source licence</a>
          </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Project, Material, FileUpload } from '@/types'
import { mapStores } from 'pinia'
import { useProjectsStore } from '@/store/projects'
import log from '@/services/logger'

const MODULE_ID = 'components/project/ProjectInput'
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
  props: {
    project: {
      type: Object as () => Project,
      required: true
    }
  },
  data() {
    return {
      error: '',
      success: '',
      kDocMaxFileSize: DESIGN_DOC_MAX_FILE_SIZE,
      docFile: undefined as File|undefined
    }
  },
  computed: {
    ...mapStores(useProjectsStore),
    hasValidMaterials():boolean {
      const materialErrors = this.project.materials.filter(p => {
        return !p.name || !p.cost || !p.quantity
      })
      return materialErrors.length === 0
    },
    hasValidDesignDoc():boolean {
      let result = !!this.project.design_doc_url
      if (this.docFile) {
        result = this.docFile.size < DESIGN_DOC_MAX_FILE_SIZE
      }
      return result
    }
  },
  created() {
    if (!this.project.materials || !this.project.materials.length) {
      this.project.materials = [initMaterial()]
    }
  },
  methods: {
    onDesignDocFileChange(event:Event) {
      const files = (event.target as HTMLInputElement).files
      this.docFile = files && files.length ? files[0] : undefined
    },
    addMaterial() {
      this.project.materials.push(initMaterial())
    },
    removeMaterialAtIndex(idx:number) {
      if (this.project.materials.length === 1) {
        this.project.materials = [initMaterial()]
      }
      else {
        this.project.materials.splice(idx, 1)
      }
    },
    async removeDesignDoc():Promise<Project|undefined> {
      return this.projectsStore.removeProjectDesignDoc(this.project)
    }
  }
})
</script>
