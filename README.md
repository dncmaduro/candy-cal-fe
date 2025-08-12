# Candy Cal FE (v3.0.0)

Ứng dụng frontend quản trị & vận hành bán hàng (MyCandy) xây dựng bằng React + TypeScript + Vite. Đây là phiên bản 3.0.0 (phiên bản đầy đủ đầu tiên) với hệ thống quản lý doanh thu, KPI, kho, đơn hàng, logs hệ thống và nhiều tính năng hỗ trợ quy trình nội bộ.

## 1. Stack chính

- React 18 + TypeScript
- Vite 6
- Mantine UI 7 (core, dates, modals, notifications, form, carousel, dropzone)
- TanStack Router & React Query (routing + data fetching / caching)
- Zustand (state management nhẹ)
- Axios (HTTP client wrapper `callApi`)
- Date libs: date-fns, dayjs
- Socket.io-client (realtime notifications / logs)
- TailwindCSS (utility classes bổ sung)

## 2. Cấu trúc thư mục chính

```
src/
  components/        // UI components (theo domain: incomes, storage, logs, user ...)
  constants/         // Hằng số (navs, rules, status, tags)
  hooks/             // Custom hooks: gọi API, logic domain (useIncomes, useMonthGoals ...)
  routes/            // Định nghĩa route TanStack (layout + pages)
  store/             // Zustand stores (userStore, uiStore ...)
  utils/             // Helpers (toQuery, cropper ...)
  layouts/           // App layout, sidebar, header
```

## 3. Domain & Tính năng

### 3.1 Doanh thu & KPI

- Import doanh thu theo file + cập nhật loại affiliate.
- Lọc / tìm kiếm theo thời gian, mã đơn, mã sản phẩm, nguồn.
- Tính và hiển thị KPI theo tháng (tách LiveStream & Shop).
- 3 chế độ xem KPI: Live / Shop / Tổng (tự tính % khi ở chế độ Tổng).
- Tách số liệu doanh thu / số lượng / % KPI theo nguồn (split endpoints).
- Daily stats modal: tổng doanh thu ngày + phân bổ theo nguồn + thống kê quy cách đóng hộp.

### 3.2 Goals (Month Goals)

- Tạo / cập nhật mục tiêu tháng với 2 field: `liveStreamGoal`, `shopGoal`.
- Tính tổng mục tiêu năm (cộng 2 loại) & % hoàn thành.

### 3.3 Kho & Sản phẩm

- Quản lý item, product, combo, ready combo.
- Quy tắc đóng gói (Packing Rules) theo khoảng quantity.
- Ghi nhận nhập / xuất kho theo tag, trạng thái & log theo ngày / tháng.

### 3.4 Logs & Nhật ký

- Daily Logs, Session Logs, Order Logs (sáng/chiều), System Logs.
- System Logs có bộ lọc theo user, type, action, entity, result, thời gian.
- Chi tiết meta hiển thị qua modal.

### 3.5 Delivered / Ready / Requests

- Yêu cầu giao hàng (delivered requests) + chấp nhận / huỷ.
- Ready combos: tạo & cập nhật tình trạng.

### 3.6 Notifications

- Thông báo realtime (socket) + đánh dấu đã đọc + đếm chưa xem.

### 3.7 Người dùng

- Avatar crop & upload.
- Đổi mật khẩu, cập nhật hồ sơ.
- Phân quyền role (admin, accounting-emp, order-emp, system-emp ...).

## 4. Hook kiến trúc API

Mỗi domain có hook riêng (ví dụ `useIncomes`, `useMonthGoals`, `useSystemLogs`). Pattern chuẩn:

```ts
const { accessToken } = useUserStore()
callApi<RequestType, ResponseType>({ path, method, data, token: accessToken })
```

Tạo query string qua helper `toQueryString`.

## 5. Các endpoint mới (v3.0.0)

| Chức năng               | Endpoint                                  | Response chính                      |
| ----------------------- | ----------------------------------------- | ----------------------------------- |
| Doanh thu tháng (split) | /v1/incomes/income-split-by-month         | { totalIncome: { live, shop } }     |
| Số lượng tháng (split)  | /v1/incomes/quantity-split-by-month       | { totalQuantity: { live, shop } }   |
| % KPI tháng (split)     | /v1/incomes/kpi-percentage-split-by-month | { KPIPercentage: { live, shop } }   |
| Daily stats             | /v1/incomes/daily-stats                   | { totalIncome, boxes[], sources{} } |
| Month Goals (CRUD)      | /v1/monthgoals                            | liveStreamGoal + shopGoal           |

## 6. Model thay đổi quan trọng

- Thay `goal` -> `liveStreamGoal`, `shopGoal` ở tất cả MonthGoal interfaces.
- Thay các response đơn giá trị sang object split `{ live, shop }`:
  - GetTotalIncomesByMonthResponse
  - GetTotalQuantityByMonthResponse
  - GetKPIPercentageByMonthResponse
- Thêm `GetDailyStatsResponse.sources`.

## 7. UI cập nhật chính

- MonthGoals table: hiển thị KPI Live / KPI Shop thay cột KPI đơn.
- MonthGoalModal: nhập 2 trường KPI.
- Incomes page: Select chế độ xem KPI, tự tính % tổng.
- DailyStatsModal: chọn ngày (default hôm qua) + bảng nguồn + bảng box.
- System Logs: Việt hoá toàn bộ label & cột.

## 8. State & Hiệu năng

- React Query dùng cache key chi tiết tránh đụng cache.
- Chuyển view KPI không refetch ngoài các split endpoints (tận dụng dữ liệu đã có để tính tổng).
- Tách modal logic qua `modals.open` của Mantine.

## 9. Phát triển & Scripts

```bash
pnpm|npm install
npm run start         # Dev
npm run build         # Build production
npm run preview       # Serve build
npm run lint          # ESLint
npm run routes        # Generate TanStack route tree
```

## 10. Chuẩn code

- ESLint + Prettier + TypeScript strict-ish.
- Commitlint + Husky (nếu đã cài hook) cho conventional commits.

## 11. Roadmap (dự kiến)

- Dashboard tổng hợp realtime.
- Biểu đồ KPI theo thời gian.
- Phân rã thêm nguồn doanh thu chi tiết.
- Xuất báo cáo PDF.

## 12. Bảo mật & Quyền

- Token lưu trong state (Zustand) + axios interceptor (callApi wrapper) truyền header.
- Guard route qua hook `useAuthGuard(roles)`. Ẩn / chặn truy cập nếu thiếu quyền.

## 13. Triển khai

Có cấu hình `netlify.toml` và `vercel.json` (có thể deploy trên Netlify/Vercel). Build output: `dist/`.

## 14. Versioning

- 3.0.0: Phiên bản đầy đủ đầu tiên với refactor KPI split + Month Goals dual, Daily stats modal, Việt hoá logs.

## 15. Giấy phép

Nội bộ (Internal Use Only) – không public trừ khi có chỉ định.

---

Maintainer: @dncmaduro
