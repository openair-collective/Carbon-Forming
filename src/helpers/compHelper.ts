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

export function acceptingEntries(comp:Competition):boolean {
  return compStarted(comp) && !compEnded(comp)
}