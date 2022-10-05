<template>
  <section class="is-flex is-flex-direction-column">
    <header class="box has-text-centered m-0">
      <h1 class="title is-6">Competition Submission</h1>
      <h2 class="title is-2">{{ competition && competition.name }}</h2>
    </header>
    <article class="is-flex-grow-1 px-4 py-6 has-background-white-bis">
      <loading v-if="step === eSteps.UNKNOWN" />
      <div v-if="step === eSteps.CREATE_FIRST_TEAM || step === eSteps.CREATE_TEAM">
        <h3 class="title is-4">Create your first team</h3>
        <team-form 
          @team-saved="onTeamSaved"
          @cancel="onTeamFormCancel" 
        />
      </div>
      <div 
        v-if="step === eSteps.CHOOSE_TEAM"
        class="is-flex is-flex-direction-column is-align-items-stretch"
      >
        <h3 class="title is-4 mb-6 has-text-centered">
          Choose a team or create a new one
        </h3>
        <div>
          <div class="is-flex is-flex-wrap-wrap is-justify-content-center mb-4">
            <div
              v-for="(user_team, i) in userStore.teams" 
              :key="i"
              @click="setTeam(user_team)"
              class="box box--team mb-4 mr-4"
              :class="{ 'selected': user_team == team }"
            >
              <figure
                v-if="user_team.avatar"
                class="image is-pulled-left mr-4"
                :style="{backgroundImage: `url(${user_team.avatar.url})`}"
              >
              </figure>
              <h4 class="title is-5">{{ user_team.name }}</h4>
              <h5 class="subtitle">{{ user_team.location }}</h5>
            </div>
          </div>
        </div>
        <div class="has-text-centered">
          <button
            class="button is-primary"
            @click="step = eSteps.CREATE_FIRST_TEAM"
          >
            Create a new team
          </button>
        </div>
      </div>
      <div
        v-if="step === eSteps.CREATE_PROJECT"
        class="is-flex is-flex-direction-column is-align-items-stretch"
      >
        <h3 class="title is-4 mb-6 has-text-centered">
          Upload your project
        </h3>
        <notification 
          v-if="error"
          :error="error" 
          @remove="error = ''" 
        />
        <project-input
          :project="project"
          ref="project_input"
          class="p-4"
        />
      </div>
    </article>
    <footer class="p-4">
      <div class="columns is-gapless">
        <div class="column is-3">
          <div class="field is-grouped">
            <div class="control">
              <button
                v-if="step === eSteps.CREATE_PROJECT"
                @click="back"
                class="button is-outlined"
                :disabled="isSaving"
              >
                Back
              </button>
            </div>
            <div class="control">
              <button 
                @click="cancel"
                class="button is-outlined"
                :disabled="isSaving"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        <div class="column">
          <ol>
            <li :class="{ 'active': step > 0 }">Step 1: Choose your team</li>
            <li :class="{ 'active': step >= eSteps.CREATE_PROJECT }">Step 2: Upload your project</li>
          </ol>
        </div>
        <div class="column is-3">
          <button
            v-if="step === eSteps.CREATE_PROJECT"
            @click="submitProject"
            class="button is-pulled-right"
            :class="{'is-loading': isSaving}"
            :disabled="disableProjectSubmit"
          >
            Submit your project
          </button>
          <button
            v-else
            @click="step = eSteps.CREATE_PROJECT"
            class="button is-pulled-right"
            :class="{'is-loading': isSaving}"
            :disabled="!team"
          >
            Next: Upload your Project
          </button>
        </div>
      </div>
    </footer>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { Competition, Team, Project, Material } from '@/types'
import { useUserStore } from '@/store/user'
import { useModalStore } from '@/store/modal'
import { useTeamsStore } from '@/store/teams'
import { useCompetitionsStore } from '@/store/competitions'
import TeamForm from '@/components/TeamForm.vue'
import ProjectInput from '@/components/project/ProjectInput.vue'
import Loading from '@/components/Loading.vue'
import Notification from '@/components/Notification.vue'
import log from '@/services/logger'

const MODULE_ID = 'modals/EnterCompetition'

enum STEPS {
  UNKNOWN,
  CREATE_FIRST_TEAM,
  CREATE_TEAM,
  CHOOSE_TEAM,
  CREATE_PROJECT
}

const CANCEL_WARNING = "Are you sure you want to exit? Your data will be lost."

export default defineComponent({
  components: { Loading, Notification, TeamForm, ProjectInput },
  props: {
    meta: {
      type: Object as () => { 
        competition:Competition
      },
      required: true
    }
  },
  data() {
    return {
      eSteps: STEPS,
      step: STEPS.UNKNOWN,
      error: '',
      isSaving: false,
      competition: this.meta.competition as Competition | null,
      team: null as Team | null,
      project: {
        name: '',
        design_doc: null,
        design_doc_url: '',
        terms: false,
        materials: [] as Material[],
        team: null,
        competition: null
      } as Project
    }
  },
  computed: {
    ...mapStores(useUserStore, useModalStore, useTeamsStore, useCompetitionsStore),
    disableProjectSubmit():boolean {
      return !this.team || !this.competition || !this.project.name || !this.project.terms
    }
  },
  async created() {
    if (!this.competition) {
      throw new Error(`${MODULE_ID} > #created - A competition instance must be defined on modal.meta`)
    }
    else {
      if (!this.userStore.teams) {
      await this.userStore.fetchTeams()
    }
      if (this.userStore.teams && this.userStore.teams.length) {
        this.step = STEPS.CHOOSE_TEAM
      }
    }
  },
  methods: {
    back() {
      this.step = STEPS.CHOOSE_TEAM
    },
    cancel() {
      if (confirm(CANCEL_WARNING))
      this.$emit('close')
    },
    onTeamSaved(team:Team) {
      this.team = team
      this.step = STEPS.CHOOSE_TEAM
    },
    onTeamFormCancel() {
      this.step = STEPS.CHOOSE_TEAM
    },
    setTeam(team:Team) {
      this.team = team
    },
    submitProject() {
      if (this.team && this.competition) {
        const inputRef = this.$refs.project_input as InstanceType<typeof ProjectInput>
        const comp = this.competition
        this.project.competition = comp
        this.teamsStore.saveTeamProject(this.team, this.project, inputRef.docFile)
          .then(result => {
            this.project = { ...this.project, ...result}
            if (comp.projects) {
              comp.projects.push(this.project)
            }
            else {
              comp.projects = [this.project]
            }
            this.modalStore.options = {
                title: 'Project Submitted',
                component: 'Message',
                meta: {
                  message: `Well done, you're in ${comp.name}`
                },
                close: true
              }
          })
          .catch(error => {
            log.error(MODULE_ID, error)
          })
          .finally(() => {
            this.isSaving = false
          })
      }
    }
  }
})

</script>

<style scoped>

section {
  overflow: hidden;
}
article {
  overflow: hidden;
  overflow-y: auto;
}
header,
footer {
  z-index: 1;
}

.box--team {
  cursor:pointer;
  border: 4px solid #ffffff;
  min-width: 400px;
}
.box--team.selected {
  border: 4px solid #3F46D6;
}

.image {
  border-radius: 8px;
  background-repeat: no-repeat;
  background-size: cover;
  height: 56px;
  width: 56px;
}

ol {
  position: relative;
  overflow: hidden;
}

li {
  position: relative;
  float: left;
  width: 50%;
  text-align: center;
  list-style-type: none;
}

li:before {
  content: " ";
  display: block;
  background-color: grey;
  border: 2px solid grey;
  text-align: center;
  width: 24px;
  height: 24px;
  line-height: 24px;
  border-radius: 100%;
  position: relative;
  left: 50%;
  margin-bottom: 12px;
  margin-left: -12px;
  z-index: 1;
}

li.active:before  {
  background-color: #00ff00;
  border-color: #00ff00;
}

li + li:after {
  content: "";
  display: block;
  width: 100%;
  background-color: grey;
  height: 2px;
  position: absolute;
  left: -50%;
  top: 12px;
  z-index: 0;
}

li.active:after {
    background-color: grey;
}
</style>