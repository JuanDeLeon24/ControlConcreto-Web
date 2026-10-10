/**
 * URL del backend. Si no está definida, la app usa datos locales de demostración.
 * Configurar en .env.local: VITE_API_URL=https://...
 */
export const API_URL: string | undefined = import.meta.env.VITE_API_URL || undefined
