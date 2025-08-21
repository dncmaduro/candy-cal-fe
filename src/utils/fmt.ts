export const fmtCurrency = (n: number) => `${n.toLocaleString()} VNĐ`
export const fmtPercent = (n: number) =>
  `${Math.round((n + Number.EPSILON) * 100) / 100}%`
