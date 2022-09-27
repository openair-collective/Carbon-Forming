
import {
  collection,
  onSnapshot,
} from 'firebase/firestore'

import { Pinia } from 'pinia'
import { Competition, Team, Project } from '@/types'
import { useTeamsStore  } from '@/store/teams'
import { useCompetitionsStore } from '@/store/competitions'
import { useProjectsStore } from '@/store/projects'
import { db } from '@/services/firestore'

const KEY_PROJECTS = 'projects'

export function projectsSync(pinia:Pinia) {
  const teamsStore = useTeamsStore(pinia)
  const compsStore = useCompetitionsStore(pinia)
  const projectsStore = useProjectsStore(pinia)
  return onSnapshot(
    collection(db, KEY_PROJECTS),
      (snapshot) => {
        snapshot.docChanges().forEach(change => {
          const data = change.doc.data()
          if (change.type === 'modified' || change.type === 'removed') {
            let project:Project|undefined = projectsStore.projects[change.doc.id]
            if (project) {
              if (change.type === 'modified') {
                project = Object.assign(data, project)
              }
              else {
                delete projectsStore.projects[change.doc.id]
              }
            }
            if (data.team && data.team.id && teamsStore.list) {
              let team:Team|undefined = teamsStore.list.find(t => t.id === data.team.id)
              if (team && team.projects && team.projects.length) {
                let project:Project|undefined = team.projects.find(p => p.id === change.doc.id)
                if (project) {
                  if (change.type === 'modified') {
                    project = Object.assign(data, project)
                  }
                  else {
                    const idx = team.projects.indexOf(project)
                    team.projects = team.projects.splice(idx, 1)
                  }
                }
              }
            }
            if (data.competition && data.competition.id && compsStore.list) {
              let comp:Competition|undefined = compsStore.list.find(c => c.id === data.competition.id)
              if (comp && comp.projects && comp.projects.length) {
                let project:Project|undefined = comp.projects.find(p => p.id === change.doc.id)
                if (project) {
                  if (change.type === 'modified') {
                    project = Object.assign(data, project)
                  }
                  else {
                    const idx = comp.projects.indexOf(project)
                    comp.projects = comp.projects.splice(idx, 1)
                  }
                }
              }
            }
          }
        })
      },
      (error) => {}
    )
  }