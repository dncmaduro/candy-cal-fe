import { ReactNode } from "react"
import { Box, Flex, Text, Group, Paper, Stack } from "@mantine/core"

interface CDashboardLayoutProps {
  /** Icon component for the header */
  icon: ReactNode
  /** Title text */
  title: string
  /** Subtitle/description under the header */
  subheader?: ReactNode
  /** Right side actions - buttons, controls, etc */
  rightHeader?: ReactNode
  /** Main content area */
  content: ReactNode
}

export const CDashboardLayout = ({
  icon,
  title,
  subheader,
  rightHeader,
  content
}: CDashboardLayoutProps) => {
  return (
    <Stack mt={24} gap="lg" w="100%">
      <Paper
        withBorder
        radius={28}
        p={{ base: "md", md: "lg" }}
        style={{
          borderColor: "#e2e8f0",
          background: "#ffffff",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)"
        }}
      >
        <Flex
          align="flex-start"
          justify="space-between"
          direction={{ base: "column", sm: "row" }}
          gap={16}
        >
          <Box>
            <Flex align="center" gap="sm" mb={10}>
              <Box
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe"
                }}
              >
                {icon}
              </Box>
              <Text
                fw={800}
                fz="1.5rem"
                c="#0f172a"
                style={{ letterSpacing: "-0.04em" }}
              >
                {title}
              </Text>
            </Flex>

            {subheader &&
              (typeof subheader === "string" ? (
                <Text c="dimmed" fz="sm" fw={500}>
                  {subheader}
                </Text>
              ) : (
                subheader
              ))}
          </Box>

          {rightHeader && (
            <Group
              gap="md"
              align="flex-end"
              justify="flex-end"
              w={{ base: "100%", sm: "auto" }}
            >
              {rightHeader}
            </Group>
          )}
        </Flex>
      </Paper>

      <Box w="100%">{content}</Box>
    </Stack>
  )
}
