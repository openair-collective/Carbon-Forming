const functions = require("firebase-functions")
const cookieParser = require('cookie-parser')
const crypto = require('crypto')

const admin = require('firebase-admin')
admin.initializeApp()

const URI_AUTH='https://discord.com/api/oauth2/authorize'
const URI_TOKEN='https://discord.com/api/oauth2/token'
const URI_USER='https://discordapp.com/api/users/@me'
const URI_REVOKE='https://discord.com/api/oauth2/token/revoke'
const URI_CDN_BASE='https://cdn.discordapp.com'
const URI_REDIRECT=process.env.DISCORD_REDIRECT
const CLIENT_ID=process.env.DISCORD_CLIENT_ID
const CLIENT_SECRET=process.env.DISCORD_CLIENT_SECRET

function getUserAvatar(user_id, avatar_id, ext) {
  ext = ext || 'png'
  return `${URI_CDN_BASE}/avatars/${user_id}/${avatar_id}.${ext}`
}

/**
* Creates a custom auth token using authenticated discord user id
*
* @returns {Promise<string>} The Firebase custom auth token in a promise.
*/
async function createFirebaseToken(discord_id) {

  // The UID we'll assign to the user.
  const uid = `discord:${discord_id}`

  // Create or update the user account.
  const userCreationTask = admin.auth().updateUser(uid, {})
    .catch((error) => {
      // If user does not exists we create it.
      if (error.code === 'auth/user-not-found') {
        return admin.auth().createUser({ uid: uid})
      }
      throw error
    })

  await Promise.all([userCreationTask]);

  const token = await admin.auth().createCustomToken(uid)
  return token
}

/**
* Redirects the User to the Discord  authentication consent screen. Also the 'state' cookie is set for later state
* verification.
*/
exports.redirect = functions.https.onRequest((req, res) => {
  let state = crypto.randomBytes(20).toString('hex')
  if (req.cookies && req.cookies.state) {
    state = req.cookies.state
  }
  functions.logger.log('Setting verification state:', state)
  res.cookie('state', state.toString(), {maxAge: 3600000, secure: true, httpOnly: true})

  const uri = `${URI_AUTH}?response_type=code&client_id=${CLIENT_ID}&scope=identify%20guilds%20guilds.members.read&state=${state}&redirect_uri=${URI_REDIRECT}&prompt=none`
  
  res.redirect(uri)
})

/**
* Exchanges a given Discord auth code passed in the 'code' URL query parameter for a Firebase auth token.
* The request also needs to specify a 'state' query parameter which will be checked against the 'state' cookie.
* The Firebase custom auth token, Discord access token are sent back through JSON
*/
exports.token = functions.https.onRequest(async (req, res) => {
  try {
    return cookieParser()(req, res, async () => {
      if (!req.cookies.state) {
        throw new Error('State cookie not set or expired. Maybe you took too long to authorize. Please try again.');
      } 
      else if (req.cookies.state !== req.query.state) {
        throw new Error('State validation failed')
      }
      functions.logger.log('Received auth code:', req.query.code)

      const data = new URLSearchParams(
        {
          'client_id': CLIENT_ID,
          'client_secret': CLIENT_SECRET,
          'grant_type': 'authorization_code',
          'code': req.query.code,
          'redirect_uri': URI_REDIRECT
        }
      ).toString()

      // fetch access token
      const tokenResponse = await fetch(URI_TOKEN, {
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      // fetch user info
      if (tokenResponse.ok) {
        let tokenJSON = await tokenResponse.json()
        functions.logger.log('Received tokenJSON:', tokenJSON)
        const userResponse = await fetch(URI_USER, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${tokenJSON.access_token}`
          }
        })
        let userJSON = await userResponse.json()
        functions.logger.log('Received userJSON:', userJSON)
        let fb_token = await createFirebaseToken(userJSON.id)
        res.json({
          firebase_access_token: fb_token,
          discord_access_token: tokenJSON.access_token,
          // discord_refresh_token: tokenJSON.refresh_token,
          // expires_in: tokenJSON.expires_in,
          discord_id: userJSON.id,
          avatar: getUserAvatar(userJSON.id, userJSON.avatar)
        })
      }
      else {
        res.json({error: tokenResponse.status})
      }
    });
  } catch (error) {
    res.json({error: error.toString()})
  }
  return null
});