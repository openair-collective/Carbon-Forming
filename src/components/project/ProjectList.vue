<template>
  <div class="is-flex is-flex-wrap-wrap">
    <div
      v-for="(project, i) in list" 
      :key="i"
      @click="$emit('project-click', project)"
      class="box box--project elevation-0 mb-5 mr-5"
    >
      <div class="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center">
        <p class="title is-3 mb-0">{{ project.name }}</p>
        <div v-if="canEdit" class="is-pulled-right">
          <router-link 
            :to="{ name: 'team-project-edit', params: { project_id: project.id }}"
            class="button is-info is-small is-rounded"
          >
            Edit Idea
          </router-link>
        </div>
      </div>
      <div v-if="showTeam && project.team" class="mt-5">
        <div class="is-pulled-left mr-5">
          <figure
            class="image image--team mb-2"
            :style="{backgroundImage: `url(${getTeamAvatar(project.team)})`}  "
          >
          </figure>
        </div>
        <p class="is-size-5">{{ project.team.name }}</p>
        <p class="is-size-6">{{ getTeamLocation(project.team) }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Project } from '@/types'
import { getTeamAvatar, getTeamLocation } from '@/helpers/teamHelper'

export default defineComponent({
  props: {
    list: {
      type: Array as PropType<Project[]>,
      required: true
    },
    showTeam: {
      type: Boolean,
      default: false
    },
    canEdit: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getTeamLocation,
    getTeamAvatar
  }
})
</script>

<style scoped>
  .box--project {
    cursor:pointer;
    width: 405px;
  }
  .image--team {
    border-radius: 8px;
    background-repeat: no-repeat;
    background-size: cover;
    height: 56px;
    width: 56px;
  }
</style>