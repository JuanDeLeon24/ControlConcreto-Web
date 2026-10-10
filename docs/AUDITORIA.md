# Auditoría de código — ControlConcreto-Web

_10-oct-2026 · revisión estática de `src/` (80 archivos, ~7.300 líneas) y configuración raíz._

## Crítico: la app muestra datos que no son reales

1. **`Importar` simula la importación.** Cualquier archivo que se suba muestra "1.247 registros importados" y
   tres advertencias fijas, tras un `setTimeout` de 2,5 s. No lee el Excel. Un usuario puede creer que cargó su reporte
   cuando no pasó nada. → Fase 2 (parser real). Mientras tanto, conviene poner un aviso de "módulo en construcción".
2. **`Registro` no guarda nada.** Los registros viven en `useState`: se pierden al recargar o cambiar de página. → Fase 2
   (IndexedDB).
3. **Dos modelos del Túnel 0 que se contradicen:**
   | Vista | Fuente | Módulo | Largo total |
   |---|---|---|---|
   | `/tunnel` (TunnelView) | `defaultData.ts` | 6 m | 822 m |
   | `/tunel3d` (Tunel3D) | `emrData.ts → tunnelInfo` | 384/137 = 2,8 m | 384 m |
   | Dashboard | `2.8` escrito a mano | 2,8 m | — |
   | Plano viga base (TY-TN 0-DE-PV-PT-PL-(VB)-R1) | — | 7,5 m (casi todos) | ~995 m (K6+178–K7+173) |
   Ninguna coincide con el plano. Hay que definir una sola fuente (`TunnelData`) y borrar la otra vista.
4. **Textos de conclusión fijos que contradicen los datos.**
   - Monitoreo dice "comportamiento aceptable, por debajo de ±2 mm/día", pero 5 estaciones (#39, #41–#44) tienen
     315–395 mm acumulados y la propia pantalla las cuenta como alerta (> 100 mm).
   - Dashboard muestra "Viga base 100 %" fijo.
   - `Layout.tsx` (sin uso) muestra "Avance 52 %" junto a "7/137 módulos" (= 5,1 %).
5. **Dato sospechoso en EMR:** la estación #40 marca 8,08 mm entre #39 (394,6) y #41 (341,9). Puede ser un error de
   digitación (¿340,8?). Revisarlo contra la fuente antes de usarlo para alertas.
6. **`tunnelInfo.longitudTotal = 384`**, pero las abscisas EMR van de 6275,5 a 6629,6 (354,1 m).

## Alto

7. **Menú con enlace roto:** "Reportes" apuntaba a `/reports`, ruta inexistente; React Router mostraba su pantalla de
   error genérica (en inglés). Registro e Importar no estaban en el menú. _Corregido en Fase 1._
8. **Sin `errorElement`:** cualquier error de render tumbaba la app completa. _Corregido._
9. **Three.js en el bundle inicial:** las dos vistas 3D se importaban de forma estática. _Corregido (carga diferida)._
10. **`formatPk` con error de relleno:** `6006,2 → "K06+06.20"` (faltaba un cero). _Corregido y con tests (`lib/pk.ts`)._
11. **Datos de proyectos de otro país:** `Projects.tsx` lista "Línea 2 Metro Lima", "Autopista Central", y el usuario
    del menú era `usuario@elcondor.com.pe`. El contrato es CC-167 (Antioquia). _El menú se corrigió; `data/projects.ts`
    ya tiene los 6 frentes reales, pero `Projects.tsx` aún usa su lista fija (pendiente: conectarlo a `useProjects`)._
12. **Tipografía:** `brand.css` declara Myriad Pro, pero no hay `@font-face`. Solo se ve en equipos que la tengan
    instalada; en el resto sale la fuente del sistema. Myriad Pro es de Adobe y requiere licencia o Adobe Fonts.

## Medio

13. `Tunel3D.tsx`: normales fijas `(0,0,1)` en la geometría del túnel → la iluminación no corresponde a la forma.
    Usar `geometry.computeVertexNormals()`.
14. Accesibilidad del menú: `role="menubar"`/`menuitem` en enlaces de navegación (patrón incorrecto; los lectores de
    pantalla esperan teclas de flecha). _Corregido: ahora son enlaces normales dentro de `<nav>`._
15. `body { overflow: hidden }` global (pensado para el 3D) puede impedir el scroll en pantallas largas si algún
    contenedor no tiene su propio `overflow-auto`.
16. Código muerto: `components/Layout.tsx`, `App.css`, `assets/react.svg`, `assets/vite.svg`, `assets/hero.png`
    (ninguno se importa).
17. `brand.css` tiene ~1.000 líneas que duplican utilidades de Tailwind; candidato a limpieza en Fase 5.

## Bien hecho

- `TunnelScene` y librerías de geometría bien separadas, con `InstancedMesh` para objetos repetidos.
- `CameraRig` ya limita las actualizaciones de foco (cada 3 m), lo que permite guardarlo sin costo.
- `parseTunnelData` valida dimensiones y recorta valores fuera de rango.
- TypeScript `strict` sin `any` en el código revisado.
