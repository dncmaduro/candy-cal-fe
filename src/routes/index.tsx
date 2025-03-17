import { AppShell, Box } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AppShell>
    <AppShell.Main h={'100vh'} w={'100vw'}>
      <Box h='100%' className='flex relative items-center justify-center'>
         <Box mx='auto' my='auto'>HHello</Box> 
      </Box>
    </AppShell.Main>
  </AppShell>
}
