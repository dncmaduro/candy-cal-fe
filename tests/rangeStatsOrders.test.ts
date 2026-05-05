import { describe, expect, it } from "vitest"
import { getRangeStatsOrderMetrics } from "../src/components/incomes/rangeStatsOrders"

describe("getRangeStatsOrderMetrics", () => {
  it("reads live/shop/total directly from current.orders", () => {
    const metrics = getRangeStatsOrderMetrics({
      current: {
        orders: {
          live: 12,
          shop: 8,
          total: 20
        }
      } as any
    } as any)

    expect(metrics.live).toBe(12)
    expect(metrics.shop).toBe(8)
    expect(metrics.total).toBe(20)
  })

  it("falls back to 0 when orders/changes are missing", () => {
    const metrics = getRangeStatsOrderMetrics({
      current: {} as any
    } as any)

    expect(metrics.live).toBe(0)
    expect(metrics.shop).toBe(0)
    expect(metrics.total).toBe(0)
    expect(metrics.livePct).toBe(0)
    expect(metrics.shopPct).toBe(0)
    expect(metrics.totalPct).toBe(0)
  })

  it("reads compare-period deltas from changes.orders", () => {
    const metrics = getRangeStatsOrderMetrics({
      current: {
        orders: {
          live: 1,
          shop: 1,
          total: 2
        }
      } as any,
      changes: {
        orders: {
          livePct: 11.5,
          shopPct: -3.2,
          totalPct: 4.1
        }
      } as any
    } as any)

    expect(metrics.livePct).toBe(11.5)
    expect(metrics.shopPct).toBe(-3.2)
    expect(metrics.totalPct).toBe(4.1)
  })

  it("does not depend on product/content split signals", () => {
    const metrics = getRangeStatsOrderMetrics({
      current: {
        orders: {
          live: 5,
          shop: 2,
          total: 7
        }
      } as any,
      incomes: [
        {
          products: [
            { content: "Phát trực tiếp", quantity: 1 },
            { content: "Video", quantity: 1 }
          ]
        }
      ]
    } as any)

    expect(metrics).toEqual({
      live: 5,
      shop: 2,
      total: 7,
      livePct: 0,
      shopPct: 0,
      totalPct: 0
    })
  })
})
