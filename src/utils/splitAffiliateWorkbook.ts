import * as XLSX from "xlsx"

export const AFFILIATE_CHUNK_ROW_LIMIT = 2000

export const splitAffiliateWorkbook = async (
  file: File,
  rowLimit = AFFILIATE_CHUNK_ROW_LIMIT
): Promise<File[]> => {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" })
  const sheetName = workbook.SheetNames[0]

  if (!sheetName) {
    throw new Error("File tách nguồn không có sheet dữ liệu")
  }

  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: ""
  })

  if (rows.length <= rowLimit + 1) return [file]

  const [header, ...dataRows] = rows
  const chunks: File[] = []

  for (let offset = 0; offset < dataRows.length; offset += rowLimit) {
    const chunkWorkbook = XLSX.utils.book_new()
    const chunkSheet = XLSX.utils.aoa_to_sheet([
      header,
      ...dataRows.slice(offset, offset + rowLimit)
    ])

    XLSX.utils.book_append_sheet(chunkWorkbook, chunkSheet, sheetName)

    const content = XLSX.write(chunkWorkbook, {
      bookType: "xlsx",
      type: "array",
      compression: true
    })
    const chunkNumber = chunks.length + 1

    chunks.push(
      new File([content], `${file.name}.part-${chunkNumber}.xlsx`, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      })
    )
  }

  return chunks
}
