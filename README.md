# Candy Cal FE (v3.2.0)

Ứng dụng frontend quản trị & vận hành bán hàng (MyCandy) xây dựng bằng React + TypeScript + Vite. Hỗ trợ theo dõi doanh thu, KPI, kho, logs, thông báo realtime và quy trình nội bộ (yêu cầu xuất kho, combos sẵn, mục tiêu tháng...).

## 1. Stack chính

- React 18 + TypeScript + Vite 6
- Mantine UI 7 (core, dates, modals, notifications ...)
- TanStack Router & React Query
- Zustand (state client)
- Axios wrapper
- date-fns / dayjs, Socket.io-client
- TailwindCSS (bổ sung utility)

## 2. Cấu trúc thư mục (rút gọn)

```
src/
  components/        // UI theo domain (incomes, storage, logs, user, ...)
  constants/         // Hằng số (navs, rules, status, tags)
  hooks/             // Hooks nghiệp vụ & gọi API
  routes/            // Khai báo route + layout
  store/             // Zustand stores (user, ui ...)
  utils/             // Helpers chung
```

## 3. Chức năng chính

### Doanh thu & KPI

- Lọc / tìm kiếm theo thời gian, mã đơn, sản phẩm, nguồn.
- KPI tháng tách LiveStream & Shop + chế độ xem Tổng (tự hợp nhất %).
- Thống kê ngày (daily stats) + phân bổ theo nguồn & box.
- Top nhà sáng tạo (bảng + biểu đồ) với phần “Khác”.

### Goals (Month Goals)

- Mục tiêu tháng 2 loại (LiveStream / Shop) & tổng hợp mục tiêu năm.

### Kho & Sản phẩm

- Item, Product, Ready Combo, Packing Rules theo khoảng số lượng.
- Log nhập/xuất kho: theo ngày, ca (sáng/chiều), tag & trạng thái.

### Yêu cầu xuất kho

- Tạo yêu cầu từ danh sách đơn / đơn chưa đóng sẵn, kế toán duyệt / hoàn tác.

### Logs & Nhật ký

- Daily / Session / Order / System logs với modal chi tiết và bộ lọc.

### Thông báo & Người dùng

- Realtime notifications, đánh dấu đã đọc.
- Quản lý hồ sơ, avatar, phân quyền nhiều vai trò.

### Phân quyền giao diện

- Ẩn / hiện nút thao tác thay đổi dữ liệu theo role (admin, accounting-emp, order-emp...).

## 4. Bảo mật & Quyền

- Route guard yêu cầu role.
- Token quản lý trong state; chỉ hiển thị thao tác ghi dữ liệu khi có quyền.

## 5. Triển khai & Scripts

```
pnpm|npm install
npm run start     # Dev
npm run build     # Build
npm run preview   # Preview build
npm run lint      # ESLint
npm run routes    # Generate router tree
```

## 6. Roadmap ngắn

- Dashboard realtime.
- Biểu đồ KPI theo thời gian.
- Xuất báo cáo nâng cao (PDF / đa định dạng).

## 7. Changelog

### 3.2.0

- Incomes: refactor quy trình thêm doanh thu thành 1 bước duy nhất — chỉ upload 1 file tổng doanh thu (không còn upload nhiều file nguồn). Tích hợp gọi API mới `insertIncomeAndUpdateSource` và modal `InsertIncomeModalV2` để gom toàn bộ flow: upload file tổng → (tự động xử lý nguồn) → nhập chi phí ads. Giữ nguyên validation ngày và confirm khi đóng modal.

### 3.1.3

- UI: Cập nhật giao diện thống kê doanh thu hàng ngày thành giao diện theo khoảng (hỗ trợ xem theo ngày/tuần/tháng) với khả năng so sánh so sánh với giai đoạn trước (hiển thị phần trăm thay đổi).

### 3.1.2

- Incomes: thêm step thứ 3 cho việc nhập doanh thu quảng cáo (Daily Ads) trong quy trình thêm doanh thu. Flow: Upload file doanh thu → Cập nhật affiliate → Thêm chi phí ads (livestream/video). Date được lưu từ step đầu và truyền qua các step tiếp theo.
- DailyAdsModal: modal nhập chi phí ads với form validation, hiển thị tổng chi phí và breakdown theo loại (livestream/video). Style nhất quán với AffTypeModal.

### 3.1.1

- DailyStatsModal: bổ sung bảng “Theo đơn vị vận chuyển” hiển thị số đơn và tỉ lệ theo `shippingProviders` trong GetDailyStatsResponse.
- Nhỏ: tối ưu tính phần trăm và format số liệu.

### 3.1.0

- Tasks: thêm tab “Theo người dùng”, bảng tổng hợp và modal chi tiết từng người (API getAllUsersTasks/getUserTasks). Gọi API chi tiết chỉ khi mở modal (modals.open).
- MyTasksPopover: ẩn nút “Xong” với task HTTP; Việt hoá nhãn/badge; sửa Popover.Target luôn là element hợp lệ.
- TaskDefinitionModal: typed form với Controller, tách create/update mutations; Select endpoint HTTP với preview; validate giờ HH:MM; size xl.
- Tasks page: phân trang Mantine + cải thiện UI bảng (Paper, hover highlight), nút “Tạo task theo ngày” với modal GenerateTasks; title modals bóng bẩy hơn.
- UI: làm tối overlay của tất cả modal (global), tinh chỉnh màu bảng để đỡ “trong suốt”.

### 3.0.2

- Thêm liveIncome vào Daily Stats & refactor DailyStatsModal sang dùng React Query (useQuery).
- Chuẩn hoá queryKey theo tên hàm (getDailyStats, getIncomesByDateRange...).
- Dọn rác code incomes (bỏ comment thừa, helper chuẩn hoá start/end day).

### 3.0.1

- Thêm component Can cho kiểm soát hiển thị theo role.
- Siết quyền mutation: chỉ role phù hợp mới thấy nút thêm / sửa / xoá / gửi yêu cầu ở các màn hình (Incomes, MonthGoals, PackingRules, Storage Items/Logs, Products, ReadyCombos, Delivered Requests, Cal Orders, Cal Result Save...).
- Bổ sung gating phần lưu lịch sử vận đơn & gửi yêu cầu xuất kho.
- Cập nhật tài liệu đơn giản hoá nội dung tránh lộ chi tiết triển khai.

### 3.0.0

- Refactor KPI tách LiveStream & Shop + chế độ Tổng.
- Dual Month Goals (liveStreamGoal + shopGoal).
- Daily Stats modal & phân bổ nguồn.
- Top Creators (bảng + biểu đồ + nhóm “Khác”).
- Việt hoá System Logs & chuẩn hoá tiêu đề trang.
- Thêm thống kê kho theo ngày & ca.
- Ready combos & yêu cầu xuất kho.

## 8. Giấy phép

Nội bộ (Internal Use Only) – không public trừ khi có chỉ định.

---

Maintainer: @dncmaduro
