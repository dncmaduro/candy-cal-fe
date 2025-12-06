# Hướng dẫn Migration - Channel Filter

## Tổng quan

Trang `/marketing-storage/incomes` đã được cập nhật để hỗ trợ filter theo kênh livestream ở cấp độ route. Mỗi kênh giờ đây được quản lý riêng biệt, không dính vào nhau.

## Những gì đã thay đổi

### 1. URL Structure

- **Trước:** `/incomes?tab=dashboard`
- **Sau:** `/incomes?channel=<channel-id>&tab=dashboard`

### 2. Context mới: `LivestreamChannelContext`

File: `src/context/LivestreamChannelContext.tsx`

```typescript
interface LivestreamChannelContextType {
  selectedChannelId: string | null // Channel hiện tại được chọn
  channels: Array<{
    // Danh sách tất cả channels
    _id: string
    name: string
    username: string
    link: string
  }>
  isLoading: boolean // Loading state
}
```

### 3. UI Changes

- **Segmented Control** để chọn channel nằm trên cùng
- Khi chuyển channel → Reset về tab "dashboard"
- Mỗi channel có state riêng biệt

## Cách update các components con

### Components cần update:

- `Dashboard.tsx`
- `RangeStats.tsx`
- `Incomes.tsx`
- `MonthGoals.tsx`
- `PackingRules.tsx`

### Bước 1: Import hook

```typescript
import { useLivestreamChannel } from "../../context/LivestreamChannelContext"
```

### Bước 2: Sử dụng context thay vì local state

**TRƯỚC:**

```typescript
export const Dashboard = () => {
  const [channelId, setChannelId] = useState<string | null>(null)

  // ... code với channelId local state
}
```

**SAU:**

```typescript
export const Dashboard = () => {
  const { selectedChannelId, channels, isLoading } = useLivestreamChannel()

  // Sử dụng selectedChannelId thay vì channelId
  // Không cần setState vì channel được quản lý bởi parent
}
```

### Bước 3: Update useQuery/useMutation dependencies

**TRƯỚC:**

```typescript
const { data } = useQuery({
  queryKey: ["dashboard", channelId, selectedMonth],
  queryFn: () => getDashboardData({ channelId, month: selectedMonth }),
  enabled: !!channelId
})
```

**SAU:**

```typescript
const { data } = useQuery({
  queryKey: ["dashboard", selectedChannelId, selectedMonth],
  queryFn: () =>
    getDashboardData({ channelId: selectedChannelId, month: selectedMonth }),
  enabled: !!selectedChannelId
})
```

### Bước 4: Xóa channel selector UI (nếu có)

Vì channel selector giờ nằm ở parent (route level), các components con không cần render dropdown/select cho channel nữa.

**XÓA BỎ:**

```typescript
<Select
  label="Chọn kênh"
  value={channelId}
  onChange={setChannelId}
  data={channels.map(ch => ({ label: ch.name, value: ch._id }))}
/>
```

## Ví dụ Migration hoàn chỉnh

### Dashboard.tsx

**TRƯỚC:**

```typescript
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

export const Dashboard = () => {
  const [channelId, setChannelId] = useState<string | null>(null)
  const [channels, setChannels] = useState([])

  useEffect(() => {
    loadChannels().then(setChannels)
  }, [])

  const { data } = useQuery({
    queryKey: ["stats", channelId],
    queryFn: () => getStats(channelId),
    enabled: !!channelId
  })

  return (
    <div>
      <Select
        value={channelId}
        onChange={setChannelId}
        data={channels.map(ch => ({ label: ch.name, value: ch._id }))}
      />
      {/* ... content */}
    </div>
  )
}
```

**SAU:**

```typescript
import { useQuery } from "@tanstack/react-query"
import { useLivestreamChannel } from "../../context/LivestreamChannelContext"

export const Dashboard = () => {
  const { selectedChannelId } = useLivestreamChannel()

  const { data } = useQuery({
    queryKey: ["stats", selectedChannelId],
    queryFn: () => getStats(selectedChannelId),
    enabled: !!selectedChannelId
  })

  return (
    <div>
      {/* Channel selector đã bị remove - giờ nằm ở parent */}
      {/* ... content */}
    </div>
  )
}
```

## Benefits

✅ **Single Source of Truth**: Channel được quản lý tập trung ở route level  
✅ **URL Bookmarkable**: Share link với channel cụ thể  
✅ **State Isolation**: Mỗi channel có state riêng, không bị dính vào nhau  
✅ **Cleaner Code**: Components con đơn giản hơn, không phải quản lý channel selection  
✅ **Better UX**: Channel selector luôn visible, không bị scroll mất

## Testing Checklist

Sau khi migrate, hãy test:

- [ ] Load trang lần đầu → auto select channel đầu tiên
- [ ] Chuyển channel → reset về dashboard tab
- [ ] Chuyển tab → giữ nguyên channel
- [ ] Refresh trang → giữ nguyên channel & tab từ URL
- [ ] Share URL → người khác mở đúng channel & tab
- [ ] Không có channel nào → hiển thị message "Không có kênh"
- [ ] Loading state khi fetch channels

## Notes

- Context chỉ available trong `LivestreamChannelProvider` (đã wrap ở route level)
- Không cần thêm provider ở components con
- Channel selection tự động persist qua URL params
