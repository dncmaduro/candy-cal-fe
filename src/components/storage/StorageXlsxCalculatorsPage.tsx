import { Box, Divider, SimpleGrid, Text, rem } from "@mantine/core"

import { ShopeeXlsxCalculator } from "./ShopeeXlsxCalculator"
import { TiktokXlsxCalculator } from "./TiktokXlsxCalculator"

export const StorageXlsxCalculatorsPage = () => {
  return (
    <Box
      mt={40}
      mx="auto"
      px={{ base: 8, md: 0 }}
      w="100%"
      style={{
        background: "rgba(255,255,255,0.97)",
        borderRadius: rem(20),
        boxShadow: "0 4px 32px 0 rgba(60,80,180,0.07)",
        border: "1px solid #ececec"
      }}
    >
      <Box pt={32} pb={8} px={{ base: 8, md: 28 }}>
        <Text fw={700} fz="xl" mb={2}>
          Tính toán từ file XLSX
        </Text>
        <Text c="dimmed" fz="sm">
          Chạy nhanh 2 công cụ tính XLSX của TikTok Shop và Shopee ngay trong
          app kho vận.
        </Text>
      </Box>

      <Divider my={0} />

      <Box px={{ base: 8, md: 28 }} py={20}>
        <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="lg">
          <TiktokXlsxCalculator />
          <ShopeeXlsxCalculator />
        </SimpleGrid>
      </Box>
    </Box>
  )
}
