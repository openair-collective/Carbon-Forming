export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

export const DISCORD_ADMIN_ID:number = import.meta.env.VITE_DISCORD_ADMIN_ID
export const TEAM_AVATAR_PLACEHOLDER:string = 'https://bulma.io/images/placeholders/128x128.png'

export const PAGING_SIZE:number = 10

export const ERROR_PAGE_LOAD:string = "We've hit an error. Please try a page refresh."
export const ERROR_NOT_FOUND:string = "Sorry, but we couldn't find the resource you were looking for."
export const ERROR_AUTH:string = "Sorry, but you don't have permission to access that page." 