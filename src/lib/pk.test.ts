import { describe, expect, it } from 'vitest'
import { formatPk, parsePk } from './pk'

describe('formatPk', () => {
  it('formatea con 3 dígitos de metros', () => {
    expect(formatPk(6420.5)).toBe('K6+420.50')
    expect(formatPk(6006.2)).toBe('K6+006.20')
    expect(formatPk(310)).toBe('K0+310.00')
  })

  it('no produce "+1000" al redondear', () => {
    expect(formatPk(6999.999)).toBe('K7+000.00')
  })

  it('permite cambiar los decimales', () => {
    expect(formatPk(7173, 0)).toBe('K7+173')
  })

  it('devuelve guion si el valor no es un número', () => {
    expect(formatPk(Number.NaN)).toBe('—')
  })
})

describe('parsePk', () => {
  it('lee los formatos de obra', () => {
    expect(parsePk('K6+420')).toBe(6420)
    expect(parsePk('k6+420,5')).toBe(6420.5)
    expect(parsePk(' 10+119.00 ')).toBe(10119)
  })

  it('rechaza textos inválidos', () => {
    expect(parsePk('6420')).toBeNull()
    expect(parsePk('K6+1200')).toBeNull()
    expect(parsePk('')).toBeNull()
  })

  it('es inverso de formatPk', () => {
    expect(parsePk(formatPk(8724.35))).toBeCloseTo(8724.35)
  })
})
