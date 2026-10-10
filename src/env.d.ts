interface ImportMetaEnv {
  /** URL del backend. Vacío = datos de demostración locales. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
