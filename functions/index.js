const functions = require("firebase-functions")
const auth = require('./auth/discord.js')
const redirect = auth.redirect
const token = auth.token
const triggers = require('./triggers.js')

module.exports = {
  token: functions.https.onRequest(token),
  redirect: functions.https.onRequest(redirect),
  deleteUser: triggers.deleteUser,
  deleteTeam: triggers.deleteTeam,
  deleteProject: triggers.deleteProject,
  deleteCompetition: triggers.deleteCompetition
}