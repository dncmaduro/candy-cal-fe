/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BACKEND_URL: string
  readonly ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
