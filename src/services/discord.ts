const GUILD_ID = import.meta.env.VITE_DISCORD_GUILD_ID
const URI_USER='https://discordapp.com/api/users/@me'

class DiscordService {

  async userGuildMember(access_token:string):Promise<any|undefined> {
    const uri = `${URI_USER}/guilds/${GUILD_ID}/member`
    const response = await fetch(uri, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })
    if (response.ok) {
      return await response.json()
    }
    else {
      throw new Error('User not authorized')
    }
  }
}

const discord = new DiscordService()

export default discord