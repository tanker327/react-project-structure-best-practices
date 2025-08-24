/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_EXPERIMENTAL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}