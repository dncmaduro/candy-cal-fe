# Candy Cal FE

Frontend nội bộ cho hệ thống quản trị & vận hành bán hàng (MyCandy), xây dựng với React + TypeScript + Vite.

> Internal Use Only — không public trừ khi có chỉ định.

## Yêu cầu

- Node.js 18+ (khuyến nghị)
- Package manager: `npm` / `pnpm` / `yarn`

## Cài đặt & chạy local

```bash
# cài deps
npm install

# chạy dev
npm run start
```

Mặc định Vite sẽ chạy ở `http://localhost:5173`.

## Cấu hình môi trường

Dự án dùng biến môi trường dạng `VITE_*` (Vite). Tham khảo file mẫu:

- `.env.in` (mẫu)
- `.env` (local)
- `.env.staging` (staging)

Các biến thường dùng:

- `VITE_BACKEND_URL`: base URL API backend
- `VITE_WEB_SOCKET_URL`: URL socket server
- `VITE_ENV`: `development` | `staging` | `production`
- `VITE_CLOUDINARY_*`: cấu hình upload ảnh (tuỳ môi trường)

## Scripts

```bash
npm run start      # dev
npm run build      # typecheck + build
npm run preview    # preview build
npm run lint       # eslint
npm run routes     # generate TanStack Router tree
```

## Cấu trúc thư mục (rút gọn)

```text
src/
  components/        UI theo domain (incomes, storage, logs, user, ...)
  constants/         Hằng số (navs, rules, status, tags)
  hooks/             Hooks nghiệp vụ & gọi API
  routes/            Routes + layouts (TanStack Router)
  store/             Zustand stores
  utils/             Helpers chung
```

## Stack chính

- React 18, TypeScript, Vite
- Mantine UI
- TanStack Router, TanStack Query
- Zustand
- Axios
- date-fns / dayjs, socket.io-client
- TailwindCSS (utilities)

## Deploy

- Build artifact nằm ở `dist/` (phục vụ qua Nginx/Static hosting).
- Deploy staging bằng Docker (xem script `up:staging` trong `package.json`).

## Changelog

Xem `CHANGELOG.md`.

## Maintainer

- @dncmaduro
