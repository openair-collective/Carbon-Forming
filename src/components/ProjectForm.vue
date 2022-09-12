<template>
  <div>
    <notification 
      v-if="success || error"
      :error="error" 
      :success="success" 
      @remove="clearMessages" />
    <form @submit.prevent="submitProjectForm" :disabled="saving">
      <div class="field"> 
        <label class="label">Project Name</label>
        <div class="control">
          <input class="input" type="text" v-model="project.name" required>
        </div>
      </div>
      <hr/>
      <h2 class="title is-4">Bill of Materials</h2>
        <p class="mb-2">Please list all of the materials used in the construction of your project. (Required)</p>
        <div>
          <table class="table is-fullwidth">
            <thead>
              <tr>
                <th style="width:20%">Item Name*</th>
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
                <td><input type="number" class="input" step="0.01" v-model="m.cost" /></td>
                <td><input type="number" class="input" v-model="m.quantity" /></td>
                <td><input type="text" class="input" v-model="m.link" /></td>
                <td>
                    <button
                      @click="removeMaterialAtIndex(i)"
                      class="button is-text"
                    >
                      {{ i == 0 ? 'Clear' : 'Remove' }}
                    </button>
                </td>
              </tr>
            </tbody>
            <button
              @click="addMaterial"
              class="button is-primary m-2">
              + Add More Materials
            </button>
          </table>
        </div>
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
import Notification from '@/components/Notification.vue'

const MODULE_ID = 'components/TeamForm'

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
      success: '',
      error: '',
      saving: false,
    }
  },
  computed: {
    ...mapStores(useTeamsStore)
  },
  created() {
    let materials = this.project.materials || [initMaterial()]
    this.project.materials = materials
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
        this.project.materials = this.project.materials.splice(idx, 1)
      }
    },
    clearMessages() {
      this.success = ''
      this.error = ''
    },
    submitProjectForm() {
      this.saving = true
      this.clearMessages()
      // check for any materials missing required fields
      const materialErrors = this.project.materials.filter(p => {
       return !p.name || !p.cost || !p.quantity
      })
      if (materialErrors.length) {
        this.error = "Some materials are missing required fields"
      }
      else {
        this.teamsStore.saveTeamProject(this.team, this.project)
        .then(result => {
          this.success = 'Project Saved'
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
  }
})
</script>
