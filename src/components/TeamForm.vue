<template>
  <form @submit.prevent="submitTeamForm" :disabled="isSaving">
    <notification 
      v-if="success || error"
      :error="error" 
      :success="success" 
      @remove="clearMessages" />
    <div class="is-flex is-flex-direction-row mb-4">
      <div>
        <div class="image is-128x128 mr-4">
          <img :src="teamImageUrl" />
        </div>
      </div>
      <div class="">
        <label class="label">Team Avatar</label>
        <div class="file mb-2">
          <label class="file-label">
            <input 
              @change="showAvatarPreview"
              class="file-input" 
              type="file"
              accept="image/*"
              ref="file_avatar"
            >
            <span class="file-cta">
              <span class="file-label">
                Choose a file…
              </span>
            </span>
          </label>
        </div>
        <p class="help is-info">
            Accepts .jpeg, .jpg, and .png files only. Maximum file size is 200kb.
          </p>
      </div>
    </div>
    <div class="field"> 
      <label class="label">Team Name</label>
      <div class="control">
        <input class="input" type="text" v-model="team.name" required>
      </div>
    </div>
    <div class="field"> 
      <label class="label">Where is your team located?</label>
      <div class="control">
        <input class="input" type="text" v-model="team.location" required>
      </div>
    </div>
    <div class="field is-grouped is-grouped-right">
      <div class="control">
        <button @click="$emit('cancel')" class="button is-outlined">
          Cancel
        </button>
      </div>
      <div class="control">
        <button 
          type="submit"
          class="button is-primary"
          :disabled="disableSubmit"
        >
          Save Team
        </button>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Team } from '@/types'
import { mapStores } from 'pinia'
import { useTeamsStore } from '@/store/teams'
import Notification from './Notification.vue'
import {
  TEAM_AVATAR_PLACEHOLDER,
  TEAM_AVATAR_MAX_FILE_SIZE
} from '@/const'
import log from '@/services/logger'

const MODULE_ID = 'components/TeamForm'

export default defineComponent({
  components: { Notification },
  props: {
    team: {
      type: Object as () => Team,
      required: true
    }
  },
  data() {
    return {
      success: '',
      error: '',
      isSaving: false,
      avatarPreviewUrl: ''
    }
  },
  computed: {
    ...mapStores(useTeamsStore),
    teamImageUrl():string { 
      return this.team.avatar_url || this.avatarPreviewUrl || TEAM_AVATAR_PLACEHOLDER
    },
    disableSubmit():boolean {
      return !this.team.name || !this.team.location
    }
  },
  methods: {
    clearMessages() {
      this.success = ''
      this.error = ''
    },
    validateFileSize(file:File):boolean {
      return file.size < TEAM_AVATAR_MAX_FILE_SIZE
    },
    showAvatarPreview (event:Event){
      const avatar:HTMLInputElement = this.$refs.file_avatar as HTMLInputElement
      const file: File = (avatar.files as FileList)[0]
      if(file) {
        var url = URL.createObjectURL(file)
        this.avatarPreviewUrl = url
      }
      else {
        this.avatarPreviewUrl = ''
      }
    },
    submitTeamForm() {
      const avatar:HTMLInputElement = this.$refs.file_avatar as HTMLInputElement
      const file: File = (avatar.files as FileList)[0]
      if (!file || this.validateFileSize(file)) {
        this.isSaving = true
        this.teamsStore.saveTeam(this.team, file)
          .then(result => {
            this.success = 'Team Saved'
            this.$emit("team-saved", result)
          })
          .catch(error => {
            log.error(MODULE_ID, error)
          })
          .finally(() => {
            this.isSaving = false
          })
      }
      else {
        this.error = "The Avatar file size cannot exceed 200kb"
      }
    }
  }
})
</script>
