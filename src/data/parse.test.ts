import { describe, expect, it } from 'vitest'
import { DEFAULT_TUNNEL_DATA } from './defaultData'
import { parseTunnelData } from './parse'

const total = DEFAULT_TUNNEL_DATA.moduleLength * DEFAULT_TUNNEL_DATA.moduleCount

describe('parseTunnelData', () => {
  it('rechaza texto que no es JSON', () => {
    expect(() => parseTunnelData('no soy json')).toThrow('no es un JSON válido')
  })

  it('rechaza un JSON que no es objeto', () => {
    expect(() => parseTunnelData('[1,2]')).toThrow('debe ser un objeto')
  })

  it('completa con los valores por defecto lo que falte', () => {
    const d = parseTunnelData(JSON.stringify({ name: 'Prueba', section: { width: 10 } }))
    expect(d.name).toBe('Prueba')
    expect(d.section.width).toBe(10)
    expect(d.section.wallHeight).toBe(DEFAULT_TUNNEL_DATA.section.wallHeight)
    expect(d.boxes).toEqual(DEFAULT_TUNNEL_DATA.boxes)
  })

  it('rechaza dimensiones cero o negativas', () => {
    expect(() => parseTunnelData(JSON.stringify({ moduleLength: 0 }))).toThrow('dimensiones inválidas')
    expect(() => parseTunnelData(JSON.stringify({ section: { width: -1 } }))).toThrow('dimensiones inválidas')
  })

  it('limita moduleCount a 400', () => {
    expect(() => parseTunnelData(JSON.stringify({ moduleCount: 401 }))).toThrow('máximo: 400')
  })

  it('recorta el avance del revestimiento al largo del túnel', () => {
    expect(parseTunnelData(JSON.stringify({ progress: { liningFront: 99999 } })).progress.liningFront).toBe(total)
    expect(parseTunnelData(JSON.stringify({ progress: { liningFront: -3 } })).progress.liningFront).toBe(0)
  })

  it('baja la base de un nicho que no cabe en el hastial', () => {
    const niche = { id: 'N', side: 'left', z: 10, length: 4, height: 2.4, depth: 1, yBase: 1 }
    const d = parseTunnelData(JSON.stringify({ section: { wallHeight: 2.5 }, niches: [niche] }))
    expect(d.niches[0]?.yBase).toBeCloseTo(0.1)
  })
})
