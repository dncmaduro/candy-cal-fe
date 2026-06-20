import * as XLSX from "xlsx"

interface SplitRequest {
  buffer: ArrayBuffer
  fileName: string
  rowLimit: number
}

interface SplitChunk {
  name: string
  buffer: ArrayBuffer
}

const postWorkerMessage = (message: unknown, transfer: Transferable[] = []) => {
  const workerScope = self as unknown as {
    postMessage: (message: unknown, transfer: Transferable[]) => void
  }

  workerScope.postMessage(message, transfer)
}

const toArrayBuffer = (value: ArrayBuffer | Uint8Array): ArrayBuffer => {
  if (value instanceof ArrayBuffer) return value

  return value.buffer.slice(
    value.byteOffset,
    value.byteOffset + value.byteLength
  ) as ArrayBuffer
}

self.onmessage = (event: MessageEvent<SplitRequest>) => {
  try {
    const { buffer, fileName, rowLimit } = event.data
    const workbook = XLSX.read(buffer, { type: "array" })
    const sheetName = workbook.SheetNames[0]

    if (!sheetName) {
      throw new Error("File tách nguồn không có sheet dữ liệu")
    }

    const rows = XLSX.utils.sheet_to_json<unknown[]>(
      workbook.Sheets[sheetName],
      {
        header: 1,
        raw: true,
        defval: ""
      }
    )

    if (rows.length <= rowLimit + 1) {
      const chunks: SplitChunk[] = [{ name: fileName, buffer }]
      postWorkerMessage({ type: "success", chunks }, [buffer])
      return
    }

    const [header, ...dataRows] = rows
    const chunks: SplitChunk[] = []

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
      }) as ArrayBuffer | Uint8Array

      chunks.push({
        name: `${fileName}.part-${chunks.length + 1}.xlsx`,
        buffer: toArrayBuffer(content)
      })
    }

    postWorkerMessage(
      { type: "success", chunks },
      chunks.map((chunk) => chunk.buffer)
    )
  } catch (error) {
    postWorkerMessage({
      type: "error",
      message:
        error instanceof Error
          ? error.message
          : "Không thể chia file tách nguồn"
    })
  }
}
