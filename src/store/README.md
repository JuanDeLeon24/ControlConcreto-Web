# store — estado de interfaz (Zustand)

`useTunnelStore` guarda el estado de la vista 3D: proyecto activo, capas, modo de cámara, posición (`focusZ`) y el
avance que se está previsualizando (`front`).

- Se guarda en `localStorage` (clave `cc-tunnel-ui`) todo menos `front`.
- Leer con selectores finos para no re-renderizar el canvas: `useTunnelStore((s) => s.mode)`.
- Los datos del túnel **no** van aquí: vienen de React Query (`useTunnelData`).
- Si cambia la forma del estado guardado, subir `STORE_VERSION` y escribir la migración en `migrate`.
