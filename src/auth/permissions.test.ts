import { describe, expect, it } from 'vitest'
import { can } from './permissions'

describe('can', () => {
  it('sin sesión no hay permisos', () => {
    expect(can(null, 'dashboard:view')).toBe(false)
  })

  it('gerencia solo consulta', () => {
    expect(can('gerencia', 'tunnel:view')).toBe(true)
    expect(can('gerencia', 'registro:create')).toBe(false)
    expect(can('gerencia', 'import:run')).toBe(false)
  })

  it('el inspector registra pero no importa', () => {
    expect(can('inspector', 'registro:create')).toBe(true)
    expect(can('inspector', 'import:run')).toBe(false)
  })

  it('jefe de obra y admin importan', () => {
    expect(can('jefe_obra', 'import:run')).toBe(true)
    expect(can('admin', 'import:run')).toBe(true)
  })
})
