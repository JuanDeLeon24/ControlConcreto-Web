# services — acceso a datos

- `api.ts`: interfaz `ApiClient` con dos implementaciones.
  - `createMockClient()`: datos locales de demostración (se usa si no hay `VITE_API_URL`).
  - `createHttpClient(url)`: backend real. Valida los datos del túnel con `parseTunnelData`.
- `keys.ts`: query keys de React Query.
- `queryClient.ts`: configuración (caché 60 s, modo offline-first, no reintenta errores 4xx).

Los componentes usan los hooks de `src/hooks/` (`useTunnelData`, `useProjects`, `useEmrStations`), nunca `fetch` directo.

Para conectar un backend: crear `.env.local` con `VITE_API_URL=https://...` y que exponga
`GET /projects`, `GET /projects/:id/tunnel`, `GET /projects/:id/emr`.
