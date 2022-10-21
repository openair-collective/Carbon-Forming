import { TeamRole } from "@/enums"

export type OAuth = {
  firebase_access_token:string
  discord_access_token:string
  discord_id:string
}

export type UserProfile = {
  id: string
  avatar:string
  username:string
  teams:{ [key:string]: TeamRole }
}

export type Guild = {
  id:string
  roles:string[]
  user: {
    username: string
  }
}

export type Team = {
  id:string
  name:string
  location:string
  about:string
  avatar:FileUpload | null
  members: { [key:UserProfile['id']]: TeamRole }
  discord_usernames: string[]
  recruiting: boolean
  projects?: Project[]
}

export type Project = {
  id: string
  name:string
  design_doc_url:string
  terms:boolean
  materials:Material[]
  image:FileUpload | null
  team?:Team
  competition?:Competition
}

export type Competition = {
  id: string
  name:string
  description:string
  rules:string
  criteria:string
  prizesDisabled: boolean
  prizes: {
    first:string
    second:string
    third:string
  }
  leaderboard: { [key:Project['id']]: number }
  start_date:Timestamp | null
  end_date:Timestamp | null
  projects?: Project[]
}

export type Material = {
  name: string
  cost: number
  quantity: number
  link: string
}

export type FileUpload = {
  filename:string
  url:string
  path:string
}

export type Modal = {
  title:string
  component:string
  fullscreen?:boolean
  close?:boolean
  meta?:object
}

export type Timestamp = {
  nanoseconds:number
  seconds:number
}