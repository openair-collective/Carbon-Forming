import { User } from '@/store/user'

const REDIRECT_URI = import.meta.env.VITE_FIREBASE_REDIRECT_PATH
const TOKEN_URI = import.meta.env.VITE_FIREBASE_TOKEN_PATH

class AuthService {
  
  login():void {
    window.location.href = REDIRECT_URI
  }

  logout():Promise<void> {
    return Promise.resolve()
  }

  async exchangeToken(code: string, state: string):Promise<User> {
    const uri = `${TOKEN_URI}?code=${code}&state=${state}`
    const response = await fetch(uri)
    return await response.json()
  }
}

const auth = new AuthService()

export default auth