import { UserProfile, Team, Guild } from '@/types'
import { DISCORD_ADMIN_ID } from '@/consts'

export function canEditTeam(profile:UserProfile, team:Team):boolean {
  return team.id in profile.teams
}

export function canCreateCompetition(guild:Guild):boolean {
  if (import.meta.env.DEV) return true
  return !!guild.roles.find((r:string) => parseInt(r, 10) === DISCORD_ADMIN_ID)
}