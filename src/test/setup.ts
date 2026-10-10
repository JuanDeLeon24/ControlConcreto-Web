import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './msw/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  localStorage.clear()
})
afterAll(() => server.close())

// jsdom no tiene WebGL ni ResizeObserver; los componentes 3D se prueban con mocks.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// jsdom tampoco implementa scrollIntoView (lo usa ModuleBar).
Element.prototype.scrollIntoView ??= function scrollIntoView() {}
