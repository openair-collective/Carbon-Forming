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

export enum TeamRole {
  default,
  admin
}

export declare interface Team {
  id:string
  name:string
  location:string
  avatar_url:string
  avatar_filename:string
  projects: { [key:Project['id']]: boolean }
  members: { [key:string]: TeamRole }
}

export declare interface Project {
  id: string
  name:string
  team_id:string
  project_id:string
  terms:boolean
  materials: Material[]
}

export declare interface Competition {
  id: string
  name:string
  description:string
  start:number
  end:number
  projects:{ [key: Project['id']]: boolean }
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