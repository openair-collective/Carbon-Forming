export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

export const DISCORD_ADMIN_ID:number = import.meta.env.VITE_DISCORD_ADMIN_ID
export const TEAM_AVATAR_PLACEHOLDER = 'https://bulma.io/images/placeholders/128x128.png'
export const TEAM_AVATAR_MAX_FILE_SIZE = 200 * 1000 // 200kb