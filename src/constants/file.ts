import { MIME_TYPES } from "@mantine/dropzone"

export const EXCEL_ACCEPT = {
  [MIME_TYPES.xlsx]: [".xlsx"],
  [MIME_TYPES.xls]: [".xls"],
  [MIME_TYPES.csv]: [".csv"]
} as const

