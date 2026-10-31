export const SALES_SHIPPING_WEIGHT_THRESHOLD_KG = 10
export const SALES_SHIPPING_FLAT_FEE = 55000
export const SALES_SHIPPING_RATE_PER_KG = 5500

export const JNT_SHIPPING_MIN_FEE = 30000
export const JNT_SHIPPING_6_TO_10_KG_FEE = 35000
export const JNT_SHIPPING_11_TO_15_KG_FEE = 45000
export const JNT_SHIPPING_16_KG_FEE = 50000
export const JNT_SHIPPING_INCREMENTAL_FEE = 5000

export type JntShippingItem = {
  area?: number | null
  mass?: number | null
  quantity: number
}

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

export const calculateJntVolumetricWeight = (area?: number | null) =>
  (Math.max(0, area ?? 0) * 1000) / 6

export const calculateJntChargeableWeight = (item: JntShippingItem) =>
  Math.round(
    Math.max(
      calculateJntVolumetricWeight(item.area),
      Math.max(0, item.mass ?? 0)
    )
  )

export const calculateJntShippingCostForBox = (item: JntShippingItem) => {
  const chargeableWeight = calculateJntChargeableWeight(item)

  if (chargeableWeight <= 5) return JNT_SHIPPING_MIN_FEE
  if (chargeableWeight <= 10) return JNT_SHIPPING_6_TO_10_KG_FEE
  if (chargeableWeight <= 15) return JNT_SHIPPING_11_TO_15_KG_FEE

  return (
    JNT_SHIPPING_16_KG_FEE +
    (chargeableWeight - 16) * JNT_SHIPPING_INCREMENTAL_FEE
  )
}

export const calculateJntShippingCost = (items: JntShippingItem[]) =>
  items.reduce((total, item) => {
    const quantity = Math.max(0, item.quantity)
    return total + calculateJntShippingCostForBox(item) * quantity
  }, 0)

export const getJntShippingSummary = (items: JntShippingItem[]) => {
  const boxCount = items.reduce(
    (total, item) => total + Math.max(0, item.quantity),
    0
  )
  const shippingCost = calculateJntShippingCost(items)

  return `J&T: ${boxCount} thùng, tính riêng từng thùng → ${shippingCost.toLocaleString("vi-VN")}đ`
}

export const getJntShippingDescription = (items: JntShippingItem[]) =>
  `J&T: số khối × 1000 / 6, lấy cao hơn giữa cân nặng quy đổi và cân nặng thực tế, làm tròn kg; tính phí riêng từng thùng, tổng ${calculateJntShippingCost(items).toLocaleString("vi-VN")}đ`
