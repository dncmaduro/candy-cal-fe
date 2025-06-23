/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BACKEND_URL: string
  readonly WEB_SOCKET_URL: string
  readonly ENV: string
  readonly CLOUDINARY_UPLOAD_PRESET: string
  readonly CLOUDINARY_CLOUD_NAME: string
  readonly CLOUDINARY_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
