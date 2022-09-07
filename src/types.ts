export declare interface OAuth {
  firebase_access_token:string
  discord_access_token:string
  discord_id:string
}

export declare interface UserProfile {
  id: string
  avatar:string
}

export declare interface Guild {
  id:string
  roles:string[]
  user: {
    username: string
  }
}

export declare interface Team {
  id:string
  name:string
  location:string
  projects:Project[]
}

export declare interface Project {
  id: string
  name:string
  team_id:string
}

export declare interface Competition {
  id: string
  name:string
  description:string
  start:number
  end:number
  projects:Project[]
}