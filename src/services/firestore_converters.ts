import { Team, Project, Competition } from '@/types'
import { QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'

export const teamConverter = {
  toFirestore: (team:Team) => {
    return {
      name: team.name,
      city: team.city,
      region: team.region,
      country: team.country,
      about: team.about,
      avatar: team.avatar,
      members: team.members,
      discord_usernames: team.discord_usernames,
      recruiting: team.recruiting
    }
  },
  fromFirestore: (snapshot:QueryDocumentSnapshot, options:SnapshotOptions) => {
    const data = snapshot.data(options)
    return {
      id: snapshot.id,
      name: data.name,
      about: data.about || '',
      city: data.city || '',
      region: data.region || '',
      country: data.country || '',
      avatar: data.avatar || '',
      members: data.members || {},
      discord_usernames: data.discord_usernames || [],
      recruiting: data.recruiting || false
    } as Team
  }
}

export const projectConverter = {
  toFirestore: (project:Project) => {
    // don't save projects recursively on associatoins
    const {...team } = project.team as any
    delete team.projects
    const { ...competition } = project.competition as any
    delete competition.projects
    return {
      name: project.name,
      design_doc_url: project.design_doc_url || null,
      materials: project.materials || [],
      team,
      competition,
      image: project.image || null
    }
  },
  fromFirestore: (snapshot:QueryDocumentSnapshot, options:SnapshotOptions) => {
    const data = snapshot.data(options)
    return {
      id: snapshot.id,
      name: data.name || '',
      design_doc_url: data.design_doc_url || '',
      materials: data.materials || [],
      team: data.team || null,
      competition: data.competition || null,
      image: data.image
    } as Project
  }
}

export const compConverter = {
  toFirestore: (comp:Competition) => {
    return {
      name: comp.name,
      description: comp.description,
      start_date: comp.start_date,
      end_date: comp.end_date,
      image: comp.image || null,
      city: comp.city,
      region: comp.region,
      country: comp.country
    }
  },
  fromFirestore: (snapshot:QueryDocumentSnapshot, options:SnapshotOptions) => {
    const data = snapshot.data(options)
    return {
      id: snapshot.id,
      name: data.name,
      description: data.description || '',
      start_date: data.start_date,
      end_date: data.end_date,
      image: data.image,
      city: data.city || '',
      region: data.region || '',
      country: data.country || ''
    } as Competition
  }
}