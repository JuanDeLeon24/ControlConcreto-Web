# ControlConcreto · Túnel 0 (3D)

Visor 3D semi-realista y paramétrico del **Túnel 0**: excavación en roca con deformaciones,
revestimiento en concreto que "corrige" la sección, elementos estructurales y galería de emergencia.

Stack: React 19 · TypeScript · Vite · Tailwind v4 · Three.js · @react-three/fiber · @react-three/drei.

## Correr en local

Requisitos: **Node.js 20.19+** (o 22.12+) y npm.

```bash
npm install        # o `npm ci` para usar exactamente el package-lock.json
npm run dev        # http://localhost:5173
```

Otros comandos: `npm run build` (typecheck + build en `dist/`), `npm run preview`, `npm run lint`, `npm run typecheck`.

Para probar en el celular (misma red Wi-Fi) abre la URL `Network:` que imprime `npm run dev`.

## Estructura

```
src/
  types.ts                   Contrato de datos (TunnelData y derivados)
  data/defaultData.ts        Datos de DEMOSTRACIÓN (reemplazar por los reales)
  data/parse.ts              Valida/completa un JSON externo
  lib/                       profile (sección), noise, deformation, geometry, textures PBR procedurales
  components/
    TunnelScene.tsx          Canvas, fog, planos de corte y composición
    TunnelExcavation.tsx     Roca irregular + shader de "corrección" en el frente
    TunnelLining.tsx         Revestimiento liso; recorta nichos y boca de galería (shader)
    StructuralElements.tsx   Viga base, drenaje, inspección, MH/A1/A2 (InstancedMesh)
    Niches.tsx               Nichos con malla electrosoldada (textura alpha)
    EmergencyGallery.tsx     Galería fantasma: rumbo y pendiente
    DeformationLabels.tsx    Etiquetas <Html> con deltas
    Lighting.tsx             Ambiente + pool de SpotLight + luminarias + polvo
    CameraRig.tsx            Recorrido en primera persona y vista exterior limitada
    ui/                      Panel, barra de módulos, botones táctiles
```

## Datos externos

`<TunnelScene data={...} front={...} />` se construye 100 % desde un objeto `TunnelData`.
En la app puedes **Descargar** el JSON actual, editarlo y **Cargar** el tuyo. Campos principales:

- `moduleLength`, `moduleCount`, `section {width, wallHeight, liningThickness}`
- `progress {liningFront, beamFront, drainFront, boxesFront, plannedFront?}` (metros)
- `boxes [{id, kind: "MH"|"A1"|"A2", side: "left"|"right", z, y?}]`
- `niches [{id, side, z, length, height, depth, yBase}]`
- `deformations [{id, z, position: "left"|"crown"|"right", deltaM, note?}]` (+ sobre-excavación, − convergencia)
- `gallery {z, side, headingDeg, gradePct, length, width, height}`
- `inspectionSpacing`, `lampSpacing`, `seed`

Convención: eje Z a lo largo del túnel (z = 0 en el portal); izquierda/derecha se miden mirando hacia +Z.

## Notas

- `xlsx@0.18.5` (npm) tiene avisos de seguridad conocidos y hoy no se usa en el visor. Antes de leer Excel en el
  navegador, instala la versión oficial de SheetJS desde su CDN.
- Las texturas PBR son procedurales (sin descargas). Puedes cambiarlas por mapas reales en `lib/textures.ts`.
