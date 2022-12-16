import { Guild, UserProfile } from '@/types'
import { intersect } from '@/utils/array'
import { TeamRole } from '@/enums'
import { DISCORD_ADMIN_ROLE_IDS } from '@/consts'

export function canEditTeamWithId(profile:UserProfile, id:string):boolean {
  return 'teams' in profile &&
         id in profile.teams && 
         profile.teams[id] === TeamRole.admin
}

export function canEditCompetitions(guild:Guild):boolean {
  if (import.meta.env.DEV) return true
  return intersect(DISCORD_ADMIN_ROLE_IDS, guild.roles).length > 0
}