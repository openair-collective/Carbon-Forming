import { UserProfile } from '@/types'
import { TeamRole } from '@/enums'

export function canEditTeamWithId(profile:UserProfile, id:string):boolean {
  return 'teams' in profile &&
         id in profile.teams && 
         profile.teams[id] === TeamRole.admin
}