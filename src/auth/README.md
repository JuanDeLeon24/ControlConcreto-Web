# auth — autenticación y permisos

- `useAuth()` → `{ user, signIn, signOut, can(permiso) }`
- `<RequireAuth permission="import:run">` protege una ruta: sin sesión manda a `/login`, sin permiso muestra 403.
- Los permisos por rol están en `permissions.ts` (única fuente de verdad del frontend).

## Proveedor
Hoy se usa `mockAdapter` (demostración: cualquier correo `@elcondor.com`, rol elegido en el login, sin contraseña).
Para pasar a Supabase u otro proveedor, se crea un archivo que implemente `AuthAdapter` (`adapter.ts`) y se pasa a
`<AuthProvider adapter={...}>` en `main.tsx`. Ningún componente cambia.

**Importante:** ocultar opciones en el frontend no es seguridad. Con backend real, cada permiso debe validarse también
en el servidor (políticas RLS en Supabase).
