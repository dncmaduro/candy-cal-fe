import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import { registerSW } from "virtual:pwa-register"

registerSW({
  onNeedRefresh() {
    console.log("Need refresh")
  },
  onOfflineReady() {
    console.log("Offline ready")
  }
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

declare const __GIT_COMMIT__: string

console.log(`[FE] App started. Commit: ${__GIT_COMMIT__}`)
