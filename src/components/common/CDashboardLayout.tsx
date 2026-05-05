import { ReactNode } from "react"
import { Box, Flex, Text, Group } from "@mantine/core"

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
    <Box
      mt={40}
      mx="auto"
      px={{ base: 8, md: 0 }}
      w="100%"
      style={{
        background: "rgba(255,255,255,0.98)",
        borderRadius: 28,
        boxShadow: "0 18px 48px rgba(15, 23, 42, 0.06)",
        border: "1px solid #dbe4f0"
      }}
    >
      <Box
        style={{
          background:
            "linear-gradient(180deg, rgba(248,250,252,0.98) 0%, rgba(241,245,249,0.88) 100%)",
          borderRadius: "28px 28px 0 0",
          borderBottom: "1px solid #dbe4f0"
        }}
      >
        <Flex
          align="center"
          justify="space-between"
          pt={12}
          pb={8}
          px={{ base: 16, md: 32 }}
          direction={{ base: "column", sm: "row" }}
          gap={20}
        >
          <Box>
            <Flex align="center" gap="sm" mb={8}>
              {icon}
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
      </Box>

      <Box pt={20} pb={40} px={{ base: 16, md: 32 }} w="100%">
        {content}
      </Box>
    </Box>
  )
}
