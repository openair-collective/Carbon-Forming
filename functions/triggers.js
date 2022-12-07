const functions = require('firebase-functions')
const { 
  admin,
  db,
} = require('./admin.js')

const { FieldValue } = require("firebase-admin/firestore");

const KEY_USERS = 'users'
const KEY_TEAMS = 'teams'
const KEY_PROJECTS = 'projects'
const KEY_COMP_PROJECTS = 'competition_projects'
const KEY_TEAM_PROJECTS = 'team_projects'
const KEY_AGGREGATES = 'aggregates'
const AGGREGATE_ID_COMPS = 'competitions'

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
            [`${snap.id}`] : FieldValue.delete()
          }
        })
      })
      batch.commit()
    })

exports.updateTeam = functions.firestore
    .document('teams/{teamID}')
    .onUpdate(async (change, context) => {

      const before = change.before.data()
      const after = change.after.data()

      const newName = before.name !== after.name
      const newLocation = before.location !== after.location
      let newAvatar = !!after.avatar
      if (before.avatar) {
        if (after.avatar) {
          newAvatar = before.avatar.url !== after.avatar.url
        }
      }

      if (newName || newLocation || newAvatar) {
        const batch = db.batch()
        
        // update projects
        const projectsRef = db.collection(KEY_PROJECTS).where('team.id', '==', change.after.id)
        const projects = await projectsRef.get()
        projects.forEach(doc => {
          batch.update(doc.ref, { 
            team: Object.assign({ id: change.after.id }, after )
          })
        })

        batch.commit()
      }
  })

exports.deleteTeam = functions.firestore
    .document('teams/{teamID}')
    .onDelete(async (snap, context) => {

      const batch = db.batch()

      // delete Team ref from User.teams
      const usersRef = db.collection(KEY_USERS)
      const teamUsers = await usersRef.where(`teams.${snap.id}`, '!=', null).get()
      teamUsers.forEach(doc => {
        batch.update(doc.ref,
          {
            [`teams.${snap.id}`] : FieldValue.delete()
          }
        )
      })

      // delete all Team Projects
      const projectsRef = db.collection(KEY_PROJECTS)
      const teamProjects = await projectsRef.where('team.id', '==', snap.id).get()
      teamProjects.forEach(doc => {
        batch.delete(doc.ref)
      })

      batch.commit()

      // delete team_projects ref
      const teamProjectsRef = db.collection(KEY_TEAM_PROJECTS).doc(`${snap.id}`)
       teamProjectsRef.delete()

      // delete team file uploads
      const bucket = admin.storage().bucket()
      bucket.deleteFiles({ prefix: snap.id })
    })

exports.createCompetition = functions.firestore
    .document('competitions/{competitionID}')
    .onCreate(async (snap, context) => {
      // update competitions aggregate list
      const aggregateDoc =  db.doc(`${KEY_AGGREGATES}/${AGGREGATE_ID_COMPS}`)
      aggregateDoc.set({ [`${snap.id}`]: snap.data() }, { merge: true })
    })

exports.updateCompetition = functions.firestore
  .document('competitions/{competitionID}')
  .onUpdate(async (change, context) => {
    const after = change.after.data()
    const batch = db.batch()

    // update aggregate
    const aggregateDoc =  db.doc(`${KEY_AGGREGATES}/${AGGREGATE_ID_COMPS}`)
    batch.set(aggregateDoc, { [`${change.after.id}`]: after }, { merge: true })

    const projectsRef = db.collection(KEY_PROJECTS)
    // update projects
    const projects = await projectsRef.where('competition.id', '==', change.after.id).get()
    projects.forEach(doc => {
      batch.update(doc.ref, { competition : Object.assign({ id: change.after.id }, after) })
    })
    batch.commit()
  })

exports.deleteCompetition = functions.firestore
    .document('competitions/{competitionID}')
    .onDelete(async (snap, context) => {
      // delete comp projects
      const batch = db.batch()
      const projectsRef = db.collection(KEY_PROJECTS)
      const projects = await projectsRef.where('competition.id', '==', snap.id).get()
      projects.forEach(doc => {
        batch.delete(doc.ref)
      })
      
      batch.commit()

      // delete competition_projects
      const aggregateDoc =  db.doc(`${KEY_AGGREGATES}/${AGGREGATE_ID_COMPS}`)
      aggregateDoc.delete()
    })

exports.updateProject = functions.firestore
  .document('projects/{projectID}')
  .onUpdate(async (change, context) => {

    const before = change.before.data()
    const after = change.after.data()

    const newTeam = (before.team && before.team.id) !== (after.team && after.team.id)
    const newComp = (before.competition && before.competition.id) !== 
                    (after.competition && after.competition.id)

    const batch = db.batch()

    if (newTeam) {
      if (before.team && before.team.id) {
        const teamProjectsRef = db.collection(KEY_TEAM_PROJECTS).doc(`${before.team.id}`)
        batch.set(teamProjectsRef, {
            [`${change.before.id}`]: FieldValue.delete()
          }, 
          { merge: true }
        )
      }
    }

    // sync with team
    if (after.team && after.team.id) {
      const teamProjectsRef = db.collection(KEY_TEAM_PROJECTS).doc(`${after.team.id}`)
      batch.set(teamProjectsRef, {
          [`${change.after.id}`]: Object.assign({ id: change.after.id }, after)
        }, 
        {merge: true}
      )
    }
    
    if (newComp) {
      if (before.competition && before.competition.id) {
        const compProjectsRef = db.collection(KEY_COMP_PROJECTS).doc(`${before.competition.id}`)
        batch.set(compProjectsRef, {
            [`${change.before.id}`]: FieldValue.delete()
          }, 
          { merge: true }
        )
      }
    }
    
    // sync with competitions
    if (after.competition && after.competition.id) {
      const compProjectsRef = db.collection(KEY_COMP_PROJECTS).doc(`${after.competition.id}`)
      batch.set(compProjectsRef, {
          [`${change.after.id}`]: Object.assign({ id: change.after.id }, after)
       }, 
        {merge: true}
      )
    }

    batch.commit()
  })

exports.deleteProject = functions.firestore
    .document('projects/{projectID}')
    .onDelete(async (snap, context) => {
      // delete any project file uploads
      const bucket = admin.storage().bucket()
      bucket.deleteFiles({ prefix: snap.id })

      const data = snap.data()

      try {
        const teamProjectsRef = db.collection(KEY_TEAM_PROJECTS).doc(`${data.team.id}`)
        await db.runTransaction(async (transaction) => {
          const doc = await transaction.get(teamProjectsRef)
          if (doc.exists) {
            transaction.update(teamProjectsRef, { [`${snap.id}`]: FieldValue.delete() })
          }
        })
      }
      catch (e) {
        console.error(e)
      }

      try {
        const compProjectsRef = db.collection(KEY_COMP_PROJECTS).doc(`${data.competition.id}`)
        await db.runTransaction(async (transaction) => {
          const doc = await transaction.get(compProjectsRef)
          if (doc.exists) {
            transaction.update(compProjectsRef, { [`${snap.id}`]: FieldValue.delete() })
          }
        })
      }
      catch (e) {
        console.error(e)
      }

    })
