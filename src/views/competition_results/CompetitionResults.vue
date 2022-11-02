<template>
  <div
    v-if="isEmpty(results) || competition.results_disabled"
    class="is-flex is-flex-direction-column is-align-items-center p-6"
  >
    <p class="mb-4 is-size-4">
      No results to share yet
    </p>
    <router-link
      :to="{ name: 'comp-results-edit'}"
      v-if="canEdit && competition.projects && competition.projects.length"
      class="button is-primary"
    >
      Edit Results
    </router-link>
  </div>
  <div v-else>
    <h2 class="title is-4 mb-4">
      Results 
      <router-link
        :to="{ name: 'comp-results-edit'}"
        v-if="canEdit"
        class="button is-info is-small is-outlined ml-2"
      >
        Edit Results
      </router-link>
    </h2>
    <p v-if="competition.results_disabled" class="tag is-warning mb-2">Preview</p>
    <table class="table table--results">
      <tbody>
        <tr 
          v-for="(result, i) in resultsSorted" 
          :key="i"
        >
          <td class="position">
            {{ pad(result.position || 0)}}
          </td>
          <td class="team">
            <div class="box is-flex is-flex-direction-row">
              <div>
                <figure 
                  class="image mb-2"
                  :style="{backgroundImage: `url(${getTeamAvatar(result.team)})`}"
                >
                </figure>
              </div>
              <div class="ml-4 mr-6 pr-6">
                <router-link :to="{ 
                  name: 'team-show', 
                  params: { id: result.team.id }
                }"> 
                  <h3 class="title is-5">{{ result.team.name }}</h3>
                  <h4 class="subtitle">{{ getTeamLocation(result.team) }}</h4>
                </router-link>
              </div>
              <div class="has-text-right">
                <p class="value mb-1 is-size-3 has-text-weight-bold">{{ result.value || 0}}</p>
                <p class="is-size-7">{{ competition.assessment_metric }}</p>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Competition, Team, Project, Ranking } from '@/types'
import { mapState, mapStores } from 'pinia'
import { useCompetitionsStore } from '@/store/competitions'
import { useUserStore } from '@/store/user'
import { canEditCompetitions } from '@/helpers/authHelper'
import { getTeamAvatar, getTeamLocation } from '@/helpers/teamHelper'
import { pad } from '@/utils/number'
import { isEmpty } from '@/utils/object'
import log from '@/services/logger'

const MODULE_ID = 'views/competitions/CompetitionResults'

type SortedRanking = {
  team:Team,
  value:any,
  position:number
}

export default defineComponent({
  props:{
    competition: {
      type: Object as () => Competition,
      required: true
    }
  },
  async created() {
    if (!this.competition.projects || !this.competition.projects.length) {
      await this.competitionsStore.fetchCompetitionProjects(this.competition)
    }
  },
  computed: { 
    ...mapStores(useCompetitionsStore),
    ...mapState(useUserStore, ['oauth']),
    results():any {
      const projects = this.competition.projects
      const values = { ...this.competition.results, ...{} } as { [key:Project['id']]: Ranking }
      if (projects) {
        projects.forEach(p => {
          if (!(p.id in values)) {
            values[p.id] = { position: null, value: null } as Ranking
          }
        })
      }
      return values
    },
    resultsSorted():SortedRanking[] {
      let result = [] as SortedRanking[]
      if (this.competition.results) {
        for (var id in this.competition.results) {
          let value = this.competition.results[id] as Ranking
          const project = this.projectById(id)
          if (project && project.team) {
            result.push({ ...{ team: project.team }, ...value } as SortedRanking)
          }
        }
      }
      result.sort((a,b) => {
        return  b.position - a.position || a.team.name.localeCompare(b.team.name)
      })
      return result
    },
    canEdit():boolean {
      let result = false
      if (this.oauth) {
        result = canEditCompetitions(this.oauth)
      }
      return result
    }
  },
  methods: {
    pad,
    getTeamAvatar,
    getTeamLocation,
    isEmpty,
    projectById(id:string):Project|undefined {
      let result
      if (this.competition.projects) {
        result = this.competition.projects.find(p => p.id === id)
      }
      return result
    },
    projectNameById(id:string):string {
      let result = 'no name'
      const project = this.projectById(id)
      if (project) {
        result = project.name
      }
      return result
    }
  }
})
</script>

<style scoped>
.table--results {
  background-color: transparent;
}
.table--results td.position {
  font-size: 3rem;
  font-weight: 700;
}
.table--results .team .image {
  border-radius: 8px;
  background-repeat: no-repeat;
  background-size: cover;
  height: 56px;
  width: 56px;
}
.table--results .team .subtitle {
  font-size: 0.813rem;
}

.table--results .team .value {
  line-height: 1;
}
</style>