const functions = require('firebase-functions')
const { 
  admin,
  db,
} = require('./admin.js')

const KEY_USERS = 'users'
const KEY_TEAMS = 'teams'
const KEY_PROJECTS = 'projects'

exports.deleteUser = functions.firestore
    .document('users/{userID}')
    .onDelete(async (snap, context) => {
      const batch = db.batch()

      // delete User ref from Team.members
      const teamsRef = db.collection(KEY_TEAMS)
      const userTeams = await teamsRef.where(`members.${snap.id}`, '==', true).get()
      userTeams.forEach(doc => {
        batch.update(doc.ref, { members : 
          {
            [`${snap.id}`] : db.deleteField()
          }
        })
      })
      batch.commit()
    })

exports.deleteTeam = functions.firestore
    .document('teams/{teamID}')
    .onDelete(async (snap, context) => {

      const batch = db.batch()

      // delete Team ref from User.teams
      const usersRef = db.collection(KEY_USERS)
      const teamUsers = await usersRef.where(`teams.${snap.id}`, '!=', null).get()
      teamUsers.forEach(doc => {
        batch.update(doc.ref, { teams: 
          {
            [`${snap.id}`] : db.deleteField() 
          }
        })
      })

      // delete all Team Projects
      const projectsRef = db.collection(KEY_PROJECTS)
      const teamProjects = await projectsRef.where('team_id', '==', snap.id).get()
      teamProjects.forEach(doc => {
        batch.delete(doc.ref)
      })

      batch.commit()

      // delete team file uploads
      const bucket = admin.storage().bucket()
      bucket.deleteFiles({ prefix: snap.id })
    })

exports.deleteCompetition = functions.firestore
    .document('competitions/{competitionID}')
    .onDelete(async (snap, context) => {
      // delete Competition ref from Projects
      const projectsRef = db.collection(KEY_PROJECTS)
      const teamProjects = await projectsRef.where('competition_id', '==', snap.id).get()
      teamProjects.forEach(doc => {
        batch.update(doc.ref, { competition_id : db.deleteField() })
      })
    })

exports.deleteProject = functions.firestore
    .document('projects/{projectID}')
    .onDelete(async (snap, context) => {
      // delete any project file uploads
      const bucket = admin.storage().bucket()
      bucket.deleteFiles({ prefix: snap.id })
    })