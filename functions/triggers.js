const functions = require('firebase-functions')
const { ObjectFlags } = require('typescript')
const { 
  admin,
  db,
} = require('./admin.js')

const KEY_USERS = 'users'
const KEY_TEAMS = 'teams'
const KEY_PROJECTS = 'projects'
const KEY_COMPETITIONS = 'competitions'
const KEY_AGG_LATEST_COMPS = 'aggregates/latest_competitions'
const KEY_COMP_PROJECTS = 'competition_projects'
const KEY_TEAM_PROJECTS = 'team_projects'

async function aggLatestComps() {
  const compsRef = db.collection(KEY_COMPETITIONS).limit(10)
  const comps = await compsRef.get()
  let list = {}
  comps.forEach(doc => {
    let data = doc.data()
    list[doc.id] = Object.assign({id: doc.id}, data)
  })
  await db.doc(KEY_AGG_LATEST_COMPS).set(list)
}

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
            [`${snap.id}`] : admin.firestore.FieldValue.delete()
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
      const newLocation = before.location !== before.location
      const newAvatar = !before.avatar && after.avatar || before.avatar.url !== after.avatar.url

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
        batch.update(doc.ref, { teams: 
          {
            [`${snap.id}`] : admin.firestore.FieldValue.delete()
          }
        })
      })

      // delete all Team Projects
      const projectsRef = db.collection(KEY_PROJECTS)
      const teamProjects = await projectsRef.where('team.id', '==', snap.id).get()
      teamProjects.forEach(doc => {
        batch.delete(doc.ref)
      })

      batch.commit()

      // delete team file uploads
      const bucket = admin.storage().bucket()
      bucket.deleteFiles({ prefix: snap.id })
    })

exports.updateCompetition = functions.firestore
  .document('competitions/{competitionID}')
  .onUpdate(async (change, context) => {
    const after = change.after.data()
    const batch = db.batch()
    const projectsRef = db.collection(KEY_PROJECTS)
    // update projects
    const projects = await projectsRef.where('competition.id', '==', change.after.id).get()
    projects.forEach(doc => {
      batch.update(doc.ref, { competition : Object.assign({ id: after.id }, after) })
    })
    batch.commit()
    aggLatestComps()
  })

exports.deleteCompetition = functions.firestore
    .document('competitions/{competitionID}')
    .onDelete(async (snap, context) => {
      // update projects Projects
      const batch = db.batch()
      const projectsRef = db.collection(KEY_PROJECTS)
      const projects = await projectsRef.where('competition.id', '==', snap.id).get()
      projects.forEach(doc => {
        batch.update(doc.ref, { competition : null })
      })
      batch.commit()
      aggLatestComps()
    })

exports.createProject = functions.firestore
  .document('projects/{projectID}')
  .onCreate(async (snap, context) => {
    const data = snap.data()
    const teamProjectsRef = db.collection(KEY_TEAM_PROJECTS).doc(`${data.team.id}`)
    await teamProjectsRef.set({
        [`${snap.id}`]: Object.assign({ id: snap.id }, data)
      }, 
      { merge: true }
    )
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
        const teamProjectsRef = db.collection(KEY_TEAM_PROJECTS).doc(`${before.team.id}.${before.id}`)
        batch.set(teamProjectsRef, {
            [`${change.before.id}`]: admin.firestore.FieldValue.delete()
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
            [`${change.before.id}`]: admin.firestore.FieldValue.delete()
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

      const batch = db.batch()

      const data = snap.data()

      // delete from Teams and Competitions
      if (data.team && data.team.id) {
        const teamProjectsRef = db.collection(KEY_TEAM_PROJECTS).doc(`${data.team.id}`)
        batch.set(teamProjectsRef, {
            [`${snap.id}`]: admin.firestore.FieldValue.delete()
          }, 
          { merge: true }
        )
      }
      if (data.competition && data.competition.id) {
        const compProjectsRef = db.collection(KEY_COMP_PROJECTS).doc(`${data.competition.id}`)
        batch.set(compProjectsRef, {
            [`${snap.id}`]: admin.firestore.FieldValue.delete()
          }, 
          { merge: true }
        )
      }

      batch.commit()
    })
