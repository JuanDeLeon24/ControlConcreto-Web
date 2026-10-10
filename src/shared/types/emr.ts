/** Estación de medición de convergencia (EMR). */
export interface EMRStation {
  numero: string
  /** Desplazamiento acumulado (mm). */
  acumulado_mm: number
  /** Abscisa en metros. */
  abscisa: number
  /** Tipo de terreno según clasificación geomecánica (I–V). */
  terreno: string
}
