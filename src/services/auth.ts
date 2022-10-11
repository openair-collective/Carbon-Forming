import firebase from "./firebase"

const REDIRECT_URI = import.meta.env.VITE_FIREBASE_REDIRECT_PATH
const TOKEN_URI = import.meta.env.VITE_FIREBASE_TOKEN_PATH

class AuthService {
  
  login():void {
    window.location.href = REDIRECT_URI
  }

  logout():Promise<void> {
    return firebase.logout()
  }

  async exchangeToken(code: string, state: string):Promise<any> {
    const uri = `${TOKEN_URI}?code=${code}&state=${state}`
    const response = await fetch(uri)
    const user =  await response.json()
    if (user) {
      await firebase.loginWithCustomToken(user.firebase_access_token)  
    }
    return user
  }
}

const auth = new AuthService()

export default auth