import {
  ActionIcon,
  Group,
  Loader,
  Paper,
  Progress,
  Stack,
  Text,
  ThemeIcon
} from "@mantine/core"
import { IconCheck, IconFileSpreadsheet, IconX } from "@tabler/icons-react"
import { useIncomeImportTaskStore } from "../../store/incomeImportTaskStore"

export const IncomeImportTaskIsland = () => {
  const task = useIncomeImportTaskStore((state) => state.task)
  const clearTask = useIncomeImportTaskStore((state) => state.clearTask)

  if (!task) return null

  const running = task.status === "preparing" || task.status === "uploading"
  const progress =
    task.totalChunks > 0
      ? Math.round((task.currentChunk / task.totalChunks) * 100)
      : 8
  const title =
    task.status === "preparing"
      ? "Đang xử lý file..."
      : task.status === "uploading"
        ? `Đang xử lý phần ${task.currentChunk}/${task.totalChunks}`
        : task.status === "success"
          ? "Xử lý file hoàn tất"
          : "Xử lý file thất bại"

  return (
    <Paper
      withBorder
      shadow="xl"
      radius="lg"
      p="md"
      pos="fixed"
      bottom={20}
      right={20}
      w={360}
      maw="calc(100vw - 32px)"
      style={{ zIndex: 500 }}
    >
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            <ThemeIcon
              radius="xl"
              variant="light"
              color={
                task.status === "error"
                  ? "red"
                  : task.status === "success"
                    ? "green"
                    : "indigo"
              }
            >
              {task.status === "error" ? (
                <IconX size={17} />
              ) : task.status === "success" ? (
                <IconCheck size={17} />
              ) : (
                <IconFileSpreadsheet size={17} />
              )}
            </ThemeIcon>

            <div style={{ minWidth: 0 }}>
              <Text fw={600} size="sm">
                {title}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {task.fileName}
              </Text>
            </div>
          </Group>

          {running ? (
            <Loader size={18} />
          ) : (
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={clearTask}
              aria-label="Đóng trạng thái import"
            >
              <IconX size={17} />
            </ActionIcon>
          )}
        </Group>

        {running && (
          <>
            <Progress value={progress} animated size="sm" radius="xl" />
            <Text size="xs" c="dimmed">
              Đừng đóng tab này trong quá trình xử lý files, bạn có thể làm việc
              khác trong khi hệ thống đang xử lý. Hệ thống sẽ thông báo khi hoàn
              tất.
            </Text>
          </>
        )}

        {!running && task.message && (
          <Text size="xs" c={task.status === "error" ? "red" : "dimmed"}>
            {task.message}
          </Text>
        )}
      </Stack>
    </Paper>
  )
}
