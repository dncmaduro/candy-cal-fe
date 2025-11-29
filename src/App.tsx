import {
  RouterProvider,
  createBrowserHistory,
  createRouter
} from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { Notifications } from "@mantine/notifications"
import { ModalsProvider } from "@mantine/modals"
import { HelmetProvider } from "react-helmet-async"

import "./App.css"
import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import "@mantine/carousel/styles.css"
import "@mantine/dates/styles.css"
import "@mantine/charts/styles.css"

import { createTheme, MantineProvider, Modal } from "@mantine/core"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MaintenancePage } from "./components/common/MaintenancePage"

const router = createRouter({
  routeTree,
  history: createBrowserHistory(),
  defaultErrorComponent: ({ error }) => (
    <MaintenancePage
      error={error as Error}
      errorInfo={null}
      onReset={() => {
        window.location.href = "/"
      }}
    />
  )
})

const theme = createTheme({
  primaryColor: "indigo",
  luminanceThreshold: 0.5,
  components: {
    Modal: Modal.extend({
      defaultProps: {
        overlayProps: { backgroundOpacity: 0.6, blur: 2, color: "black" }
      }
    })
  }
})

const queryClient = new QueryClient()

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme}>
          <ModalsProvider
            modalProps={{
              overlayProps: {
                backgroundOpacity: 0.6,
                blur: 2,
                color: "black"
              }
            }}
          >
            <Notifications />
            <RouterProvider router={router} />
          </ModalsProvider>
        </MantineProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App
