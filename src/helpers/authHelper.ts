import { UserProfile, Team, Guild } from '@/types'
import { TeamRole } from '@/enums'
import { DISCORD_ADMIN_ID } from '@/consts'

export function canEditTeamWithId(profile:UserProfile, id:string):boolean {
  return id in profile.teams && profile.teams[id] === TeamRole.admin
}

export function canEditCompetitions(guild:Guild):boolean {
  if (import.meta.env.DEV) return true
  return !!guild.roles.find((r:string) => parseInt(r, 10) === DISCORD_ADMIN_ID) 
}