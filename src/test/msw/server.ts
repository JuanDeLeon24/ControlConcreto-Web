import { setupServer } from 'msw/node'

/** Servidor MSW para tests. Cada test agrega sus handlers con server.use(...). */
export const server = setupServer()
