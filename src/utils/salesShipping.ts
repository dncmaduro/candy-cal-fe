export const SALES_SHIPPING_WEIGHT_THRESHOLD_KG = 10
export const SALES_SHIPPING_FLAT_FEE = 55000
export const SALES_SHIPPING_RATE_PER_KG = 5500

export const calculateSalesShippingCost = (weight: number) =>
  Math.round(
    weight < SALES_SHIPPING_WEIGHT_THRESHOLD_KG
      ? SALES_SHIPPING_FLAT_FEE
      : weight * SALES_SHIPPING_RATE_PER_KG
  )

export const getSalesShippingRateLabel = (weight: number) =>
  weight < SALES_SHIPPING_WEIGHT_THRESHOLD_KG ? "55k" : "5.5k/kg"

export const getSalesShippingUnitPriceLabel = (weight: number) =>
  weight < SALES_SHIPPING_WEIGHT_THRESHOLD_KG ? "55.000" : "5.500"

export const getSalesShippingDescription = (weight: number) =>
  weight < SALES_SHIPPING_WEIGHT_THRESHOLD_KG
    ? `Khối lượng ${weight.toFixed(2)}kg < ${SALES_SHIPPING_WEIGHT_THRESHOLD_KG}kg → Phí cố định ${SALES_SHIPPING_FLAT_FEE.toLocaleString("vi-VN")}đ`
    : `Khối lượng ${weight.toFixed(2)}kg ≥ ${SALES_SHIPPING_WEIGHT_THRESHOLD_KG}kg → ${weight.toFixed(2)}kg × ${SALES_SHIPPING_RATE_PER_KG.toLocaleString("vi-VN")}đ = ${(weight * SALES_SHIPPING_RATE_PER_KG).toLocaleString("vi-VN")}đ`

export const getSalesShippingSummary = (weight: number) =>
  weight < SALES_SHIPPING_WEIGHT_THRESHOLD_KG
    ? ` < ${SALES_SHIPPING_WEIGHT_THRESHOLD_KG}kg → 55k`
    : ` ≥ ${SALES_SHIPPING_WEIGHT_THRESHOLD_KG}kg → ${weight.toFixed(2)}kg × 5.5k`
