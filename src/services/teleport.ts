import { TeamLocation } from "@/types"
const TELEPORT_API_ENDPOINT = "https://api.teleport.org/api/cities/?search="

type TeleportCitySearchResult = {
  matching_full_name:string
}

class TeleportService {
  async cities(terms:string):Promise<TeamLocation[]> {
    const result = [] as TeamLocation[]
    const uri = `${TELEPORT_API_ENDPOINT}${terms}`
    const response = await fetch(uri)
    const data = await response.json()
    if ('_embedded' in data && 'city:search-results' in data._embedded) {
      const searchResults = data._embedded['city:search-results'] as TeleportCitySearchResult[]
      searchResults.forEach(r => {
        if ('matching_full_name' in r) {
          const parts = r['matching_full_name'].split(',')
          const location = {
            city: (parts[0] || '').trim(),
            region: (parts[1] || '').trim(),
            country: (parts[2] || '').replace(/ *\([^)]*\) */g, "").trim()
          }
          result.push(location)
        }
      })
    }
    return result
  }
}

const teleport = new TeleportService()

export default teleport