import { TeamRole } from "@/enums"

export declare interface OAuth {
  firebase_access_token:string
  discord_access_token:string
  discord_id:string
}

export declare interface UserProfile {
  id: string
  avatar:string
  teams:{ [key:Team['id']]: boolean }
}

export declare interface Guild {
  id?:string
  roles:string[]
  user: {
    username: string
  }
}

export declare interface Team {
  id:string
  name:string
  location:string
  avatar?:FileUpload | null
  members: { [key:string]: TeamRole }
}

export declare interface Project {
  id: string
  name:string
  design_doc?:FileUpload | null
  design_doc_url?:string
  terms:boolean
  materials: Material[]
  team_id:string
  competition_id:string
}

export declare interface Competition {
  id: string
  name:string
  description:string
  start_date?:Date
  end_date?:Date
}

export declare interface Material {
  name: string
  cost: number
  quantity: number
  link: string
}

export declare interface Modal {
  title:string
  component:string,
  meta?:object
}

export declare interface FileUpload {
  filename:string
  url:string
  path:string
}