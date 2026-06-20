import axios from "axios"
import { extractApiErrorMessage } from "../hooks/axios"
import { useIncomeImportTaskStore } from "../store/incomeImportTaskStore"
import { useUserStore } from "../store/userStore"

const AFFILIATE_CHUNK_ROW_LIMIT = 500
const UPLOAD_TIMEOUT_MS = 120_000
const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

type IncomeImportMode = "full" | "status-only" | "base-only" | "affiliate-only"

interface StartIncomeImportTaskInput {
  totalIncomeFile: File
  affiliateFile?: File
  date: Date
  channel: string
  updateMode: "full" | "status-only"
  onComplete?: () => void
}

interface WorkerChunk {
  name: string
  buffer: ArrayBuffer
}

const splitAffiliateFile = async (file: File): Promise<File[]> => {
  const worker = new Worker(
    new URL("../workers/incomeImport.worker.ts", import.meta.url),
    { type: "module" }
  )

  try {
    const chunks = await new Promise<WorkerChunk[]>((resolve, reject) => {
      worker.onmessage = (
        event: MessageEvent<
          | { type: "success"; chunks: WorkerChunk[] }
          | { type: "error"; message: string }
        >
      ) => {
        if (event.data.type === "error") {
          reject(new Error(event.data.message))
          return
        }

        resolve(event.data.chunks)
      }
      worker.onerror = () =>
        reject(new Error("Không thể khởi động bộ chia file"))

      file.arrayBuffer().then((buffer) => {
        worker.postMessage(
          {
            buffer,
            fileName: file.name,
            rowLimit: AFFILIATE_CHUNK_ROW_LIMIT
          },
          [buffer]
        )
      }, reject)
    })

    return chunks.map(
      (chunk) =>
        new File([chunk.buffer], chunk.name, {
          type: XLSX_MIME_TYPE
        })
    )
  } finally {
    worker.terminate()
  }
}

const uploadChunk = async (
  files: File[],
  req: {
    date: Date
    channel: string
    updateMode: IncomeImportMode
    chunkIndex?: number
    chunkCount?: number
  }
) => {
  const formData = new FormData()
  files.forEach((file) => formData.append("files", file))

  Object.entries(req).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value))
    }
  })

  const apiBaseUrls = (import.meta.env.VITE_BACKEND_URL as string)
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean)
  let lastError: unknown

  for (const apiBaseUrl of apiBaseUrls) {
    try {
      return await axios.post<{ success: true; message: string }>(
        `${apiBaseUrl}/v1/incomes/insert-and-update-source`,
        formData,
        {
          timeout: UPLOAD_TIMEOUT_MS,
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${useUserStore.getState().accessToken}`
          }
        }
      )
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}

const runIncomeImportTask = async (
  input: StartIncomeImportTaskInput
): Promise<void> => {
  const { updateTask } = useIncomeImportTaskStore.getState()

  try {
    if (input.updateMode === "status-only") {
      updateTask({
        status: "uploading",
        currentChunk: 1,
        totalChunks: 1
      })

      await uploadChunk([input.totalIncomeFile], {
        date: input.date,
        channel: input.channel,
        updateMode: "status-only",
        chunkIndex: 0,
        chunkCount: 1
      })
    } else {
      if (!input.affiliateFile) {
        throw new Error("Thiếu file tách nguồn")
      }

      const affiliateChunks = await splitAffiliateFile(input.affiliateFile)
      const totalSteps = affiliateChunks.length + 1
      updateTask({
        status: "uploading",
        currentChunk: 0,
        totalChunks: totalSteps
      })

      updateTask({ currentChunk: 1 })
      await uploadChunk([input.totalIncomeFile], {
        date: input.date,
        channel: input.channel,
        updateMode: "base-only",
        chunkIndex: 0,
        chunkCount: totalSteps
      })

      for (let index = 0; index < affiliateChunks.length; index++) {
        updateTask({ currentChunk: index + 2 })

        await uploadChunk([affiliateChunks[index]], {
          date: input.date,
          channel: input.channel,
          updateMode: "affiliate-only",
          chunkIndex: index + 1,
          chunkCount: totalSteps
        })
      }
    }

    updateTask({
      status: "success",
      message: "Import doanh thu đã hoàn tất"
    })

    try {
      input.onComplete?.()
    } catch (error) {
      console.error("Failed to refresh incomes after import:", error)
    }
  } catch (error) {
    updateTask({
      status: "error",
      message:
        extractApiErrorMessage(error) ||
        (error instanceof Error ? error.message : "Import doanh thu thất bại")
    })
  }
}

export const startIncomeImportTask = (
  input: StartIncomeImportTaskInput
): boolean => {
  const store = useIncomeImportTaskStore.getState()
  const currentTask = store.task

  if (
    currentTask &&
    (currentTask.status === "preparing" || currentTask.status === "uploading")
  ) {
    return false
  }

  store.setTask({
    id: crypto.randomUUID(),
    status: "preparing",
    fileName: input.affiliateFile?.name || input.totalIncomeFile.name,
    currentChunk: 0,
    totalChunks: 0
  })

  window.setTimeout(() => {
    void runIncomeImportTask(input)
  }, 0)

  return true
}
