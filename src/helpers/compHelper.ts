import { Competition, Team } from '@/types'
import { fsTimestampToDate } from '@/utils/date'

export function compStarted(comp:Competition):boolean {
  let now = new Date().getTime()
  const start =  comp.start_date ? fsTimestampToDate(comp.start_date).getTime() : 0
  return now >= start
}

export function compEnded(comp:Competition):boolean {
  let now = new Date().getTime()
  const end = comp.end_date ? fsTimestampToDate(comp.end_date).getTime() : 0
  return end <= now
}

export enum COMP_STATES {
  UNAVAILABLE,
  IN_PROGRESS,
  FINISHED
}

export function getCompState(comp:Competition):COMP_STATES {
  let result = COMP_STATES.UNAVAILABLE
  if (compStarted(comp) && !compEnded(comp)) {
    result = COMP_STATES.IN_PROGRESS
  }
  else if (compEnded(comp)) {
    result = COMP_STATES.FINISHED
  }
  return result
}

export function getCompLocation(comp:Competition):string {
  let location = [comp.city, comp.region, comp.country]
  location = location.filter(v => v)
  return location.join(', ')
}