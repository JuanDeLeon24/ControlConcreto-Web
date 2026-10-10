import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../test/msw/server'
import { ApiError, createHttpClient, createMockClient } from './api'

const BASE = 'https://api.prueba.local'
const client = createHttpClient(BASE)

describe('cliente HTTP', () => {
  it('valida y completa los datos del túnel que envía el servidor', async () => {
    server.use(http.get(`${BASE}/projects/cc167-t0/tunnel`, () => HttpResponse.json({ name: 'T0 servidor' })))
    const data = await client.getTunnelData('cc167-t0')
    expect(data.name).toBe('T0 servidor')
    expect(data.moduleCount).toBeGreaterThan(0)
  })

  it('convierte errores HTTP en ApiError con el código', async () => {
    server.use(http.get(`${BASE}/projects`, () => new HttpResponse(null, { status: 500 })))
    await expect(client.getProjects()).rejects.toMatchObject({ name: 'ApiError', status: 500 })
  })

  it('reporta "sin conexión" con status 0', async () => {
    server.use(http.get(`${BASE}/projects/x/emr`, () => HttpResponse.error()))
    const err = await client.getEmrStations('x').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).status).toBe(0)
  })
})

describe('cliente de demostración', () => {
  const mock = createMockClient(0)

  it('lista los 6 frentes del CC-167', async () => {
    expect((await mock.getProjects()).map((p) => p.code)).toEqual(['T0', 'GE-T0', 'T1', 'T2', 'T3', 'T4'])
  })

  it('da 404 si el proyecto no existe', async () => {
    await expect(mock.getTunnelData('no-existe')).rejects.toMatchObject({ status: 404 })
  })
})
