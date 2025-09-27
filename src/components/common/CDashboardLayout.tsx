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
        background: "rgba(255,255,255,0.97)",
        borderRadius: 20,
        boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
        border: "1px solid #ececec"
      }}
    >
      {/* Header Section */}
      <Box
        style={{
          background:
            "linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.05) 100%)",
          borderRadius: "16px 16px 0 0",
          borderBottom: "1px solid rgba(79, 172, 254, 0.15)"
        }}
      >
        <Flex
          align="center"
          justify="space-between"
          pt={32}
          pb={20}
          px={{ base: 16, md: 32 }}
          direction={{ base: "column", sm: "row" }}
          gap={16}
        >
          <Box>
            {/* Header */}
            <Flex align="center" gap="sm" mb={8}>
              {icon}
              <Text
                fw={700}
                fz="xxl"
                variant="gradient"
                gradient={{ from: "blue.6", to: "cyan.5", deg: 45 }}
              >
                {title}
              </Text>
            </Flex>

            {/* Subheader */}
            {subheader &&
              (typeof subheader === "string" ? (
                <Text c="blue.6" fz="md" fw={500}>
                  {subheader}
                </Text>
              ) : (
                subheader
              ))}
          </Box>

          {/* Right Header Actions */}
          {rightHeader && (
            <Group gap="md" align="flex-end" w={{ base: "100%", sm: "auto" }}>
              {rightHeader}
            </Group>
          )}
        </Flex>
      </Box>

      {/* Content Section */}
      <Box pt={20} pb={40} px={{ base: 16, md: 32 }} w="100%">
        {content}
      </Box>
    </Box>
  )
}
