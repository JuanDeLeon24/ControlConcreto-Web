/**
 * Formatea una abscisa en metros al formato de obra: 6420.5 → "K6+420.50".
 * Los metros siempre se muestran con 3 dígitos enteros (K6+006.20, no K6+6.20).
 */
export function formatPk(metros: number, decimals = 2): string {
  if (!Number.isFinite(metros)) return '—'
  const sign = metros < 0 ? '-' : ''
  const abs = Math.abs(metros)
  // Redondear primero evita "K6+1000.00" cuando metros = 6999.999
  const factor = 10 ** decimals
  const rounded = Math.round(abs * factor) / factor
  const km = Math.floor(rounded / 1000)
  const m = rounded - km * 1000
  const width = decimals > 0 ? 4 + decimals : 3
  return `${sign}K${km}+${m.toFixed(decimals).padStart(width, '0')}`
}

/** Convierte "K6+420.5" o "6+420,5" a metros. Devuelve null si el texto no es una abscisa válida. */
export function parsePk(text: string): number | null {
  const match = /^\s*K?\s*(\d+)\s*\+\s*(\d{1,3}(?:[.,]\d+)?)\s*$/i.exec(text)
  if (!match) return null
  const km = Number(match[1])
  const m = Number(match[2].replace(',', '.'))
  if (m >= 1000) return null
  return km * 1000 + m
}
