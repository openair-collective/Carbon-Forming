import { TeamRole } from "@/enums"

export declare interface OAuth {
  firebase_access_token:string
  discord_access_token:string
  discord_id:string
}

export declare interface UserProfile {
  id: string
  avatar:string
  username:string
  teams:{ [key:string]: boolean }
}

export declare interface Guild {
  id?:string
  roles:string[]
  user: {
    username: string
  }
}

// persisted

export declare interface Team {
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

export declare interface Project {
  id: string
  name:string
  design_doc:FileUpload | null
  design_doc_url:string
  terms:boolean
  materials:Material[]
  team:Team
  competition?:Competition
}

export declare interface Competition {
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
  start_date:Timestamp | null
  end_date:Timestamp | null
  projects?: Project[]
}

// end persisted

export declare interface Material {
  name: string
  cost: number
  quantity: number
  link: string
}

export declare interface Modal {
  title:string
  component:string,
  fullscreen?:boolean,
  close?:boolean,
  meta?:object
}

export declare interface FileUpload {
  filename:string
  url:string
  path:string
}

export declare interface Timestamp {
  nanoseconds:number
  seconds:number
}