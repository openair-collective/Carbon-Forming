import { UserProfile, OAuth } from '@/types'
import { TeamRole } from '@/enums'
import { DISCORD_ADMIN_IDS } from '@/consts'

export function canEditTeamWithId(profile:UserProfile, id:string):boolean {
  return id in profile.teams && profile.teams[id] === TeamRole.admin
}

export function canEditCompetitions(oauth:OAuth):boolean {
  if (import.meta.env.DEV) return true
  return DISCORD_ADMIN_IDS.indexOf(oauth.discord_id) !== -1
}