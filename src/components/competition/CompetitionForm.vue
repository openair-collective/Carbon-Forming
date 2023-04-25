<template>
  <form @submit.prevent="submitForm" :disabled="isSaving">
    <div class="field"> 
      <label class="label">Collaboration Name</label>
      <div class="control">
        <input class="input" type="text" v-model="clone.name" required>
      </div>
    </div>
    <hr/>
    <div class="field"> 
      <label class="label">Image</label>
      <p
        v-if="!clone.image" 
        class="mb-2"
      >
        Please upload an image for your collaboration.
      </p>
      <p 
        v-if="!clone.image"
        class="help is-info mb-2"
      >
        Accepts .jpeg, .jpg, and .png files only. Maximum file size is {{ kImageMaxSize / 1000 }}kb. Dimensions (----px x ----px).
      </p>
      <div class="is-flex is-flex-direction-row">
        <div
          v-if="imageUrl !== kImagePlaceholder" 
          class="file-image mr-4 has-border-radius-6 has-background-grey-lighter has-text-centered"
          :style="{ 'background-image': 'url(' + imageUrl + ')' }"
        >
        </div>
        <button
          v-if="clone.image"
          @click.prevent="removeImage"
          class="button is-danger"
        >
          Remove Image
        </button>
        <div
          v-else
          class="file mb-2">
          <label class="file-label">
            <input
              @change="onImageFileChange"
              class="file-input" 
              type="file"
              accept="image/*"
              ref="file_image"
            >
            <span class="file-cta">
              <span class="file-label">
                {{ imageUrl ===  kImagePlaceholder ?  'Upload Image' : 'Change Image' }}
              </span>
            </span>
          </label>
        </div>
      </div>
    </div>
    <hr />
    <div>
      <h2 class="title is-4">Dates</h2>
      <h3 class="subtitle">Please list the beginning and the end date for your collaboration</h3>
      <div class="is-flex is-flex-direction-row">
        <div class="field mr-6"> 
          <label class="label">Start Date</label>
          <div class="control">
            <input
              class="input"
              type="date"
              v-model="startDate"
              pattern="\d{4})-(\d{1,2})-(\d{1,2})"
              required>
          </div>
        </div>
        <div class="field"> 
          <label class="label">End Date</label>
          <div class="control">
            <input 
              class="input" 
              type="date"
              v-model="endDate"
              :disabled="!startDate"
              :min="minEndDate"
              pattern="\d{4})-(\d{1,2})-(\d{1,2})"
              required>
          </div>
        </div>
      </div>
    </div>
    <hr/>
    <div>
      <h2 class="title is-4">Collaboration Details</h2>
      <h3 class="subtitle">Please describe your collaboration in detail.</h3>
      <div class="field"> 
        <label class="label">Collaboration Details</label>
        <div class="control">
          <text-editor 
            :value="clone.description"
            :placeholder="'Tell us about your collaboration'"
            @text-change="(change) => clone.description = change" 
          />
        </div>
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
          Save Collaboration
        </button>
      </div>
    </div>
  </form>
  <div 
    v-if="competition.id"
    class="mt-6 p-4 has-background-light"
  >
    <h3 class="title is-5">Delete Collaboration</h3>
    <p><strong>Warning:</strong> Deleting a Collaboration is irreversible. All associated data, including any submitted Projects, will also be deleted.</p>
    <button
      class="button is-danger mt-3"
      @click="confirmDelete(competition)"
    >
      Delete Collaboration
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue'
import { Competition, Timestamp } from '@/types'
import { LogLevel } from '@/enums'
import { mapStores } from 'pinia'
import { useCompetitionsStore } from '@/store/competitions'
import { useFlashStore } from '@/store/flash'
import { useModalStore } from '@/store/modal'
import { fsTimestampToDate, lastDayOfMonth } from '@/utils/date'
import { COMP_IMAGE_PLACEHOLDER } from '@/consts'
import log from '@/services/logger'
const IMAGE_MAX_FILE_SIZE = 400 * 1000 // 400kb

const MODULE_ID = 'components/competition/CompetitionForm'

function dateForInput(stamp:any):string {
  const date = fsTimestampToDate(stamp)
  return date.toISOString().split('T')[0]
}

function dateForSave(iso:string):Timestamp {
  let date = new Date(iso)
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
  return { seconds: date.getTime() / 1000, nanoseconds: 0 }
}

function compFactory():Competition {
  return {
    id: '',
    name: '',
    description: '',
    start_date: null,
    end_date: null,
    projects: [],
    image: null
  }
}

export default defineComponent({
  name: 'competition-form',
  emits: ['cancel', 'comp-saved', 'comp-deleted', 'remove-image'],
  components: { TextEditor: defineAsyncComponent(() => import('@/components/TextEditor.vue')) },
  props: {
    competition: {
      type: Object as () => Competition,
      default() {
        return compFactory()
      }
    }
  },
  data() {
    return {
      clone: Object.assign(
        {},
        compFactory(),
        this.competition
      ) as Competition, // clone so we can modify
      isSaving: false,
      startDate: this.competition.start_date && dateForInput(this.competition.start_date),
      endDate: this.competition.end_date && dateForInput(this.competition.end_date),
      docFile: undefined as File|undefined,
      imagePreviewUrl: '',
      kImageMaxSize: IMAGE_MAX_FILE_SIZE,
      kImagePlaceholder: COMP_IMAGE_PLACEHOLDER
    }
  },
  computed: {
    ...mapStores(useCompetitionsStore, useFlashStore, useModalStore),
    minEndDate():string {
      let result = ''
      if (this.startDate) {
        let min:Date = new Date(this.startDate)
        min.setMinutes(min.getMinutes() + min.getTimezoneOffset())
        min.setDate(min.getDate()+1)
        result = min.toISOString().split('T')[0]
      }
      return result
    },
    imageUrl():string { 
      let result = this.imagePreviewUrl || COMP_IMAGE_PLACEHOLDER
      if (this.clone.image && this.clone.image.url) {
        result = this.clone.image.url
      }
      return result
    },
  },
  watch: {
    startDate(val) {
      let start:Date = new Date(val)
      start.setMinutes(start.getMinutes() + start.getTimezoneOffset())
      let end:Date|null = this.endDate ? new Date(this.endDate) : null
      if (!end || end < start) {
        let day:number = lastDayOfMonth(start.getFullYear(), start.getMonth())
        end = new Date(start.valueOf())
        end.setDate(day)
        this.endDate = end.toISOString().split('T')[0]
      }
    }
  },
  methods: {
    validateFileSize(file:File):boolean {
      return file.size < IMAGE_MAX_FILE_SIZE
    },
    submitForm() {
      const image:HTMLInputElement = this.$refs.file_image as HTMLInputElement
      const file:File = image && (image.files as FileList)[0]
      if (file && !this.validateFileSize(file)) {
        this.flashStore.$patch({ message:`The image file size cannot exceed ${IMAGE_MAX_FILE_SIZE / 1000}kb.`, level: LogLevel.error })
      }
      else {
        this.isSaving = true
        this.flashStore.$reset()
        if (this.startDate && this.endDate) {
          this.clone.start_date = dateForSave(this.startDate)
          this.clone.end_date = dateForSave(this.endDate) 
        }
        this.competitionsStore.saveCompetition(this.clone, file)
          .then(result => {
            Object.assign(this.competition, result)
            this.clone = { ...this.competition }
            this.flashStore.$patch({ message: 'Collaboration saved', level: LogLevel.success })
            this.$emit('comp-saved', result)
          })
          .catch(error => {
            this.flashStore.$patch({ message: 'Error saving collaboration. Please try again.', level: LogLevel.error })
            log.error(MODULE_ID, error)
          })
          .finally(() => {
            this.isSaving = false
          })
      }
    },
    confirmDelete(comp:Competition) {
      this.modalStore.options = {
        title: '',
        component: 'Confirm',
        meta: {
          message: `Are you sure you want to delete ${comp.name}?`,
          confirm: () => { this.deleteCompetition(comp) },
          confirmLabel: 'Yes, I want to delete this collaboration',
          cancelLabel: 'No, don\'t delete',
          danger: true
        }
      }
    },
    deleteCompetition(comp:Competition) {
      this.competitionsStore.deleteCompetition(comp)
        .then(result => {
            this.$emit('comp-deleted')
          })
          .catch(error => {
            this.flashStore.$patch({ message: 'Error deleting collaboration. Please try again.', level: LogLevel.error })
            log.error(MODULE_ID, error)
          })
          .finally(() => {
            this.isSaving = false
          })
    },
    removeImage() {
      this.flashStore.$reset()
      if (this.clone.image && confirm("Are you sure you want to remove the Collaboration image?")) {
        this.isSaving = true
        this.competitionsStore.removeCompetitionImage(this.clone)
          .then(result => {
            if (result) {
              this.flashStore.$patch({ message: 'Collaboration image removed', level: LogLevel.success })
              this.competition.image = this.clone.image = null
            }
          })
          .catch(error => {
            this.flashStore.$patch({ message: 'Error removing image. Please try again.', level: LogLevel.error })
          })
          .finally(()=> {
            this.isSaving = false
          })
      }
    },
    onImageFileChange(event:Event) {
      const files = (event.target as HTMLInputElement).files
      this.docFile = files && files.length ? files[0] : undefined
      this.showImagePreview()
    },
    showImagePreview (){
      const image:HTMLInputElement = this.$refs.file_image as HTMLInputElement
      const file: File = (image.files as FileList)[0]
      this.imagePreviewUrl = file ? URL.createObjectURL(file) : COMP_IMAGE_PLACEHOLDER
    }
  }
})
</script>

<style scoped="true">
.file-image {
  flex-grow: 1;
  height: 200px;
  max-width: 50%;
  background-size: contain;
  background-position: center ;
  background-repeat: no-repeat;
}
</style>