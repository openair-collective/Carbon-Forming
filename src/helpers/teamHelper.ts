import { Team } from '@/types'
import { TEAM_AVATAR_PLACEHOLDER } from "@/consts"

export function getTeamAvatar(team:Team):string {
  let result = TEAM_AVATAR_PLACEHOLDER
  if (team.avatar) {
    result = team.avatar.url
  }
  return result
}

export function getTeamLocation(team:Team):string {
  let location = [team.city, team.region, team.country]
  location = location.filter(v => v)
  return location.join(', ')
}