# Fase 1 — Fundaciones (auth, store, datos, tipos, tests)

Requiere haber aplicado antes el paquete de Fase 0.

```powershell
cd C:\Users\sebas\OneDrive\Escritorio\ControlConcreto-Web
git checkout -b fase-1-fundaciones
```

1. Copia el contenido de este ZIP sobre el proyecto (reemplaza archivos).

2. Borra el código muerto:

```powershell
Remove-Item src\components\Layout.tsx, src\App.css, src\assets\react.svg, src\assets\vite.svg, src\assets\hero.png
```

3. Instala dependencias:

```powershell
npm i zustand @tanstack/react-query
npm i -D msw axe-core @testing-library/user-event
```

4. Verifica:

```powershell
npm run check
npm run coverage
npm run dev
```

En `npm run dev` deberías ver la pantalla de login. Entra con cualquier correo `@elcondor.com` y prueba los roles:
**Gerencia** no ve Registro ni Importar; **Inspector** no ve Importar; si un inspector escribe `/importar` en la
barra de direcciones, ve la pantalla 403.

5. Si algo falla, copia el error completo y pégalo en el chat.
