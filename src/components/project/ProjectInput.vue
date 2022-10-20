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
              <td>
                <input 
                  type="url" 
                  class="input" 
                  placeholder="https://example.com" 
                  pattern="https?://.*"
                  title="Must be a valid URL"
                  v-model="m.link"
                />
              </td>
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
    <p class="mb-2">Please link to a document that outlines the design of your project.</p>
    <div class="field"> 
      <label class="label">Design document link</label>
      <div class="control">
        <input
          class="input" 
          type="url"
          v-model="project.design_doc_url"
          pattern="https?://.*"
          title="Must be a valid URL"
          :disabled="!!docFile"
        >
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
      docFile: undefined as File|undefined
    }
  },
  computed: {
    ...mapStores(useProjectsStore),
    hasValidMaterials():boolean {
      const materialErrors = this.project.materials.filter(p => {
        return !p.name || !p.quantity
      })
      return materialErrors.length === 0
    }
  },
  created() {
    if (!this.project.materials || !this.project.materials.length) {
      this.project.materials = [initMaterial()]
    }
  },
  methods: {
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
    }
  }
})
</script>
