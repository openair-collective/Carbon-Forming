<template>
  <form @submit.prevent="submitTeamForm" :disabled="isSaving">
    <div class="is-flex is-flex-direction-row mb-4">
      <div>
        <div class="image is-128x128 mr-4">
          <img :src="teamImageUrl" />
        </div>
      </div>
      <div>
        <label class="label">Team Avatar</label>
        <button
            v-if="clone.avatar"
            @click.prevent="removeAvatar"
            class="button is-warning"
          >
            Remove Avatar
        </button>
        <div v-else>
          <p class="help is-info mb-2">
          Accepts .jpeg, .jpg, and .png files only. Maximum file size is {{ kAvatarMaxSize / 1000 }}kb.
          </p>
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
                  {{ teamImageUrl === kAvatarPlaceholder  ?  'Upload Team Avatar' : 'Change Avatar' }}
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
    <div class="field"> 
      <label class="label">Team Name</label>
      <div class="control">
        <input class="input" type="text" v-model="clone.name" required>
      </div>
    </div>
    <div class="field"> 
      <label class="label">Where is your team located?</label>
      <div class="control">
        <input class="input" type="text" placeholder="City" v-model="clone.city" required>
      </div>
    </div>
    <div class="field">
      <div class="control">
        <input class="input" type="text" placeholder="State/Province/Region" v-model="clone.region" required>
      </div>
    </div>
    <div class="field">
      <div class="control">
        <input class="input" type="text" placeholder="Country" v-model="clone.country" required>
      </div>
    </div>
    <hr/>
    <div class="field"> 
      <h2 class="title is-4">Team Members</h2>
      <h3 class="subtitle">Add the discord handle of your team members</h3>
      <div
        v-for="(val, i) in clone.discord_usernames"
        :key="i"
        class="field is-grouped"
      >
        <div class="control">
          <input
          class="input" 
          type="text" 
          v-model="clone.discord_usernames[i]" /> 
        </div>
        <div 
          class="control"
        >
          <button
            @click.prevent="clone.discord_usernames.splice(i, 1)" 
            class="button is-text">
            remove
          </button>
        </div>
      </div>
      <a
        @click="clone.discord_usernames.push('')"
        class="button is-primary m-2"
      >
        + Add More Members
      </a>
    </div>
    <hr/>
    <div class="field"> 
      <label class="label">About your team</label>
      <text-editor 
        :value="clone.about"
        :placeholder="kAboutPlacehoder"
        @text-change="(change) => clone.about = change" 
      />
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
          :class="{'is-loading': isSaving}"
          :disabled="disableSubmit"
        >
          Save Team
        </button>
      </div>
    </div>
  </form>
  <div 
    v-if="team.id" 
    class="mt-6 p-4 has-background-light"
  >
    <h3 class="title is-5">Delete Team</h3>
    <p><strong>Warning:</strong> Deleting a Team is irreversible. All associated data will also be deleted.</p>
    <button
      class="button is-danger mt-3"
      @click="confirmDelete(team)"
    >
      Delete Team
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue'
import { Team } from '@/types'
import { LogLevel, TeamRole } from '@/enums'
import { mapStores } from 'pinia'
import { useTeamsStore } from '@/store/teams'
import { useFlashStore } from '@/store/flash'
import { useModalStore } from '@/store/modal'
import { TEAM_AVATAR_PLACEHOLDER } from '@/consts'
import log from '@/services/logger'

const MODULE_ID = 'components/TeamForm'
const AVATAR_MAX_FILE_SIZE = 200 * 1000 // 200kb
const ABOUT_PLACEHOLDER = 'Tell us a bit about your team, what your areas of speciality are and what sort of projects you focus on.'

function teamFactory():Team {
  return {
    id: '',
    name: '', 
    city: '',
    region: '',
    country: '',
    about: '',
    avatar: null,
    members: {},
    recruiting: false,
    discord_usernames: [''] as string[]
  }
}

export default defineComponent({
  name: 'team-form',
  emits: ['cancel', 'team-saved', 'team-deleted'],
  components: { TextEditor: defineAsyncComponent(() => import('@/components/TextEditor.vue')) },
  props: {
    team: {
      type: Object as () => Team,
      default() {
        return teamFactory()
      }
    }
  },
  data() {
    return {
      clone: Object.assign(
        {}, 
        teamFactory(),
        this.team
      ) as Team, // clone so we can modify
      isSaving: false,
      kAvatarMaxSize: AVATAR_MAX_FILE_SIZE,
      kAvatarPlaceholder: TEAM_AVATAR_PLACEHOLDER,
      kAboutPlacehoder: ABOUT_PLACEHOLDER,
      avatarPreviewUrl: ''
    }
  },
  computed: {
    ...mapStores(useTeamsStore, useFlashStore, useModalStore),
    teamImageUrl():string { 
      let result = this.avatarPreviewUrl || TEAM_AVATAR_PLACEHOLDER
      if (this.clone.avatar && this.clone.avatar.url) {
        result = this.clone.avatar.url
      }
      return result
    },
    disableSubmit():boolean {
      return !this.clone.name || !this.clone.country || !this.clone.region || !this.clone.city
    }
  },
  methods: {
    validateFileSize(file:File):boolean {
      return file.size < AVATAR_MAX_FILE_SIZE
    },
    removeAvatar() {
      this.flashStore.$reset()
      if (this.clone.avatar && confirm("Are you sure you want to remove the Team Avatar?")) {
        this.isSaving = true
        this.teamsStore.removeTeamAvatar(this.clone)
          .then(result => {
            if (result) {
              this.flashStore.$patch({ message: 'Team Avatar removed', level: LogLevel.success })
              this.team.avatar = this.clone.avatar = null
              this.avatarPreviewUrl = TEAM_AVATAR_PLACEHOLDER
            }
          })
          .catch(error => {
            this.flashStore.$patch({ message: 'Error removing Avatar. Please try again.', level: LogLevel.error })
          })
          .finally(()=> {
            this.isSaving = false
          })
      }
    },
    showAvatarPreview (event:Event){
      const avatar:HTMLInputElement = this.$refs.file_avatar as HTMLInputElement
      const file: File = (avatar.files as FileList)[0]
      this.avatarPreviewUrl = file ? URL.createObjectURL(file) : TEAM_AVATAR_PLACEHOLDER
    },
    submitTeamForm() {
      const avatar:HTMLInputElement = this.$refs.file_avatar as HTMLInputElement
      const file:File = avatar && (avatar.files as FileList)[0]
      if (!file || this.validateFileSize(file)) {
        this.isSaving = true
        this.clone.discord_usernames = this.clone.discord_usernames.filter(u => u)
        this.teamsStore.saveTeam(this.clone, file)
          .then(result => {
            Object.assign(this.team, result)
            this.clone = Object.assign({}, this.team)
            this.$emit('team-saved', this.clone)
          })
          .catch(error => {
            this.flashStore.$patch({ message: 'Error saving team. Please try again.', level: LogLevel.error })
            log.error(MODULE_ID, error)
          })
          .finally(() => {
            this.isSaving = false
          })
      }
      else {
        this.flashStore.$patch({ message:`The Avatar file size cannot exceed ${AVATAR_MAX_FILE_SIZE / 1000}kb.`, level: LogLevel.error })
      }
    },
    confirmDelete(team:Team) {
      this.modalStore.options = {
        title: '',
        component: 'Confirm',
        meta: {
          message: `Are you sure you want to delete ${team.name}?`,
          confirm: () => { this.deleteTeam(team) },
          confirmLabel: 'Yes, I want to delete this team',
          cancelLabel: 'No, don\'t delete',
          danger: true
        }
      }
    },
    deleteTeam(team:Team) {
      this.teamsStore.deleteTeam(team)
        .then(result => {
            this.$emit('team-deleted')
          })
          .catch(error => {
            this.flashStore.$patch({ message: 'Error deleting team. Please try again.', level: LogLevel.error })
            log.error(MODULE_ID, error)
          })
          .finally(() => {
            this.isSaving = false
          })
    }
  }
})
</script>
