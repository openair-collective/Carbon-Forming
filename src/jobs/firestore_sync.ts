import {
  collection,
  onSnapshot,
} from 'firebase/firestore'

import { Pinia } from 'pinia'
import { Competition, Team } from '@/types'
import { useTeamsStore } from '@/store/teams'
import { useCompetitionsStore } from '@/store/competitions'
import { useUserStore } from '@/store/user'
import { db } from '@/services/firestore'

const KEY_TEAMS = 'teams'
const KEY_TEAM_PROJECTS = 'team_projects'
const KEY_COMP_PROJECTS = 'competition_projects'

export function teamProjectsSync(pinia:Pinia) {
    const teamsStore = useTeamsStore(pinia)
    return onSnapshot(
      collection(db, KEY_TEAM_PROJECTS),
        (snapshot) => {
          snapshot.docChanges().forEach(change => {
            let id = change.doc.id
            if (teamsStore.list) {
              const match = teamsStore.list.find(t => t.id === id) as Team
              if (match) {
                teamsStore.fetchTeamProjects(match)
              } 
            }
          })
        },
        (error) => {}
      )
}

export function compProjectsSync(pinia:Pinia) {
  const compsStore = useCompetitionsStore(pinia)
  return onSnapshot(
    collection(db, KEY_COMP_PROJECTS),
      (snapshot) => {
        snapshot.docChanges().forEach(change => {
          let id = change.doc.id
          if (compsStore.list) {
            const match = compsStore.list.find(c => c.id === id) as Competition
            if (match) {
              compsStore.fetchCompetitionProjects(match)
            } 
          }
        })
      },
      (error) => {}
    )
}

export function teamsSync(pinia:Pinia) {
  const teamsStore = useTeamsStore(pinia)
  const userStore = useUserStore(pinia)
  return onSnapshot(
    collection(db, KEY_TEAMS),
      (snapshot) => {
        snapshot.docChanges().forEach(change => {
          const team = change.doc.data() as Team
          if (teamsStore.list) {
            const match = teamsStore.list.find(t => t.id === change.doc.id)
            if (match) {
              const idx = teamsStore.list.indexOf(match)
              teamsStore.list[idx] = { ...match, ...team }
            }
          }
          if (userStore.teams) {
            const match = userStore.teams.find(t => change.doc.id === change.doc.id) as Team
            if (match) {
              const idx = userStore.teams.indexOf(match)
              userStore.teams[idx] = { ...match, ...team }
            }
          }
        })
      },
      (error) => {}
    )
  }