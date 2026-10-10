import { DEFAULT_TUNNEL_DATA } from '../data/defaultData'
import { emrStations } from '../data/emrData'
import { PROJECTS } from '../data/projects'
import { parseTunnelData } from '../data/parse'
import type { EMRStation, Project, TunnelData } from '../shared/types'
import { API_URL } from './config'

/** Error de red o de servidor con el código HTTP (0 = sin conexión). */
export class ApiError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Todo acceso a datos pasa por esta interfaz. Los componentes nunca llaman fetch directamente. */
export interface ApiClient {
  getProjects(): Promise<Project[]>
  getTunnelData(projectId: string): Promise<TunnelData>
  getEmrStations(projectId: string): Promise<EMRStation[]>
}

async function request(baseUrl: string, path: string, fetchImpl?: typeof fetch): Promise<Response> {
  // fetch se resuelve en cada llamada (no al crear el cliente) para que MSW pueda interceptarlo en tests.
  const doFetch = fetchImpl ?? globalThis.fetch
  let res: Response
  try {
    res = await doFetch(`${baseUrl.replace(/\/$/, '')}${path}`, { headers: { Accept: 'application/json' } })
  } catch {
    throw new ApiError('Sin conexión con el servidor.', 0)
  }
  if (!res.ok) {
    const message = res.status === 404 ? 'No se encontró el recurso.' : `Error del servidor (${res.status}).`
    throw new ApiError(message, res.status)
  }
  return res
}

export function createHttpClient(baseUrl: string, fetchImpl?: typeof fetch): ApiClient {
  const id = (s: string) => encodeURIComponent(s)
  return {
    async getProjects() {
      const res = await request(baseUrl, '/projects', fetchImpl)
      return (await res.json()) as Project[]
    },
    async getTunnelData(projectId) {
      const res = await request(baseUrl, `/projects/${id(projectId)}/tunnel`, fetchImpl)
      // Se reutiliza el mismo validador del cargador de JSON: datos del servidor tampoco se confían a ciegas.
      return parseTunnelData(await res.text())
    },
    async getEmrStations(projectId) {
      const res = await request(baseUrl, `/projects/${id(projectId)}/emr`, fetchImpl)
      return (await res.json()) as EMRStation[]
    },
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Cliente de demostración con los datos locales. Simula latencia para que los estados de carga se vean. */
export function createMockClient(latencyMs = 150): ApiClient {
  const findProject = (projectId: string) => {
    const p = PROJECTS.find((x) => x.id === projectId)
    if (!p) throw new ApiError('No se encontró el recurso.', 404)
    return p
  }
  return {
    async getProjects() {
      await wait(latencyMs)
      return structuredClone(PROJECTS)
    },
    async getTunnelData(projectId) {
      await wait(latencyMs)
      const p = findProject(projectId)
      if (!p.has3D) throw new ApiError(`${p.name} todavía no tiene modelo 3D.`, 404)
      return structuredClone(DEFAULT_TUNNEL_DATA)
    },
    async getEmrStations(projectId) {
      await wait(latencyMs)
      const p = findProject(projectId)
      return p.code === 'T0' ? structuredClone(emrStations) : []
    },
  }
}

export const api: ApiClient = API_URL ? createHttpClient(API_URL) : createMockClient()
