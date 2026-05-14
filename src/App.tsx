import {
  RouterProvider,
  createBrowserHistory,
  createRouter
} from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { Notifications } from "@mantine/notifications"
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
import { ConfirmingModalsProvider } from "./components/common/ConfirmingModalsProvider"

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  }
})

queryClient.setQueryDefaults(["getMe"], {
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false
})

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme}>
          <ConfirmingModalsProvider
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
          </ConfirmingModalsProvider>
        </MantineProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App
