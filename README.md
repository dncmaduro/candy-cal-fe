# Candy Cal FE (v3.5.0)

Ứng dụng frontend quản trị & vận hành bán hàng (MyCandy) xây dựng bằng React + TypeScript + Vite. Hỗ trợ theo dõi doanh thu, KPI, kho, logs, thông báo realtime và quy trình nội bộ (yêu cầu xuất kho, combos sẵn, mục tiêu tháng...).

## 1. Stack chính

- React 18 + TypeScript + Vite 6
- Mantine UI 7 (core, dates, modals, notifications ...)
- TanStack Router & React Query
- Zustand (state client + localStorage persistence)
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
- **Tính toán từ file Excel**: Upload file Excel để tự động tính toán sản phẩm cần thiết, với chức năng xem lại kết quả gần nhất.
- **Shopee Products**: Quản lý sản phẩm Shopee với Excel calculator tích hợp và lưu kết quả persistent.

### Yêu cầu xuất kho

- Gửi yêu cầu trực tiếp từ Cal Orders (bỏ modal phân bổ), tổng hợp theo storageItems; kế toán duyệt / hoàn tác.

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

## 7. Lịch sử cập nhật

### 3.5.1

- Bổ sung màn hình Bảo trì
- Giao diện bảng DataTable mới
- Hỗ trợ tính toán trên nhiều channel Tiktok
- Bổ sung logic unique cho Tiktok Products

### 3.5.0

- Cal từ Excel & Cal Orders:
  - Dùng trực tiếp storageItems thay cho items trong toàn bộ flow tính toán
  - Tìm kiếm storageItems có cả deleted=true/false; hiển thị tên màu đỏ cho item đã xóa
  - CalFileResultModal: build map storageItems theo \_id, CalItems hiển thị màu đỏ khi deleted
  - CalOrders: bỏ SendDeliveredRequestModal; gửi yêu cầu xuất kho trực tiếp qua API createDeliveredRequest với tổng hợp theo storageItemId + quantity
  - Thêm checkbox “Chọn tất cả” để chọn/bỏ chọn toàn bộ đơn theo bộ lọc hiện tại; trạng thái indeterminate khi chọn một phần
  - Loading/disabled và toast khi gửi yêu cầu
- Dọn dẹp:
  - Loại bỏ phụ thuộc searchItems trong các màn Cal; chuẩn hóa sang searchStorageItems

### 3.4.1

- **Storage Log cải tiến**:
  - **Multiple Items**: Hỗ trợ tạo/chỉnh sửa log kho với nhiều mặt hàng cùng lúc sử dụng useFieldArray
  - **Grouped Table Display**: Hiển thị logs theo kiểu gộp bảng (tương tự Incomes) với rowSpan cho các cột không thay đổi
  - **Backward Compatibility**: Tương thích với logs cũ (single item) và logs mới (multiple items)
  - **Enhanced Pagination**: Thêm NumberInput cho phép thay đổi limit từ 1-100 items/page
  - **Validation Improvements**: Toast notifications chi tiết khi có trường required bị thiếu
  - **Dynamic Form**: Thêm/xóa items động với validation riêng cho từng item

### 3.4.0

- **Quản lý Livestream**: Hệ thống quản lý livestream hoàn chỉnh với 3 module chính:
  - **Kênh**: Quản lý kênh livestream (tên, username, link) với tìm kiếm và phân trang
  - **Mục tiêu**: Mục tiêu doanh thu livestream theo tháng và kênh với chọn kênh qua API
  - **Khung giờ**: Quản lý khung giờ livestream với chọn kênh thống nhất qua API
- **Nâng cấp thống kê**:
  - **Thống kê theo khoảng**: Thống kê theo thời gian với phân tích chiết khấu chi tiết
  - **Cột chiết khấu**: Thêm 3 cột chiết khấu mới vào bảng doanh thu (Chiết khấu Platform, Chiết khấu Seller, Giá sau chiết khấu)
  - **Bố cục responsive**: Thống kê chiết khấu với 5 boxes đồng đều trên 1 hàng
- **Tích hợp API**: Chọn kênh có thể tìm kiếm thống nhất trên tất cả modal livestream
- **Cải thiện giao diện**:
  - Modal nhất quán trong quản lý livestream
  - Cải thiện bố cục bảng với hiển thị trường chiết khấu đúng
  - Thiết kế responsive tốt hơn cho các thành phần thống kê

### 3.3.0

- **Tích hợp Sản phẩm & Shopee**: Tích hợp chức năng "Tính toán từ file Excel" vào tab Sản phẩm, thay thế route `/marketing-storage/calfile/` độc lập. Route cũ giờ chuyển hướng tự động về `/marketing-storage/storage`.
- **Quản lý trạng thái Zustand**: Chuyển từ localStorage trực tiếp sang Zustand store với persist middleware. Tập trung trạng thái cho tất cả kết quả tính toán với đồng bộ localStorage tự động.
- **Cải thiện giao diện**:
  - Modal kích thước 80vw cho Sản phẩm, 70vw cho Shopee với nội dung full-width
  - Styling tab Đơn hàng với background nhiều lớp, shadows và spacing tốt hơn
  - Kết quả lưu trữ với tooltips thời gian
- **An toàn kiểu dữ liệu**: Hoàn toàn loại bỏ kiểu `any`, sử dụng TypeScript interfaces đúng cho tất cả kết quả tính toán.
- **Điều hướng**: Cập nhật cấu trúc điều hướng, deprecated route `/calfile` với hỗ trợ redirectTo.

### 3.2.0

### 3.2.0

- **Doanh thu**: Tái cấu trúc quy trình thêm doanh thu thành 1 bước duy nhất — chỉ upload 1 file tổng doanh thu (không còn upload nhiều file nguồn). Tích hợp gọi API mới `insertIncomeAndUpdateSource` và modal `InsertIncomeModalV2` để gom toàn bộ flow: upload file tổng → (tự động xử lý nguồn) → nhập chi phí ads. Giữ nguyên validation ngày và confirm khi đóng modal.

### 3.1.3

- **Giao diện**: Cập nhật giao diện thống kê doanh thu hàng ngày thành giao diện theo khoảng (hỗ trợ xem theo ngày/tuần/tháng) với khả năng so sánh với giai đoạn trước (hiển thị phần trăm thay đổi).

### 3.1.2

- **Doanh thu**: Thêm bước thứ 3 cho việc nhập doanh thu quảng cáo (Daily Ads) trong quy trình thêm doanh thu. Flow: Upload file doanh thu → Cập nhật affiliate → Thêm chi phí ads (livestream/video). Ngày được lưu từ bước đầu và truyền qua các bước tiếp theo.
- **Modal chi phí quảng cáo**: Modal nhập chi phí ads với form validation, hiển thị tổng chi phí và breakdown theo loại (livestream/video). Style nhất quán với AffTypeModal.

### 3.1.1

- **Modal thống kê hàng ngày**: Bổ sung bảng "Theo đơn vị vận chuyển" hiển thị số đơn và tỉ lệ theo `shippingProviders` trong GetDailyStatsResponse.
- **Nhỏ**: Tối ưu tính phần trăm và format số liệu.

### 3.1.0

- **Nhiệm vụ**: Thêm tab "Theo người dùng", bảng tổng hợp và modal chi tiết từng người (API getAllUsersTasks/getUserTasks). Gọi API chi tiết chỉ khi mở modal (modals.open).
- **Popover nhiệm vụ của tôi**: Ẩn nút "Xong" với task HTTP; Việt hoá nhãn/badge; sửa Popover.Target luôn là element hợp lệ.
- **Modal định nghĩa nhiệm vụ**: Form có kiểu dữ liệu với Controller, tách create/update mutations; Select endpoint HTTP với preview; validate giờ HH:MM; size xl.
- **Trang nhiệm vụ**: Phân trang Mantine + cải thiện UI bảng (Paper, hover highlight), nút "Tạo task theo ngày" với modal GenerateTasks; title modals đẹp hơn.
- **Giao diện**: Làm tối overlay của tất cả modal (global), tinh chỉnh màu bảng để đỡ "trong suốt".

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
- Top Creators (bảng + biểu đồ + nhóm "Khác").
- Việt hoá System Logs & chuẩn hoá tiêu đề trang.
- Thêm thống kê kho theo ngày & ca.
- Ready combos & yêu cầu xuất kho.

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
