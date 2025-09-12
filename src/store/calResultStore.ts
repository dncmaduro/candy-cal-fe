import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CalResult {
  items: {
    _id: string
    name: string
    quantity: number
    storageItem: {
      code: string
      name: string
      receivedQuantity: {
        quantity: number
        real: number
      }
      deliveredQuantity: {
        quantity: number
        real: number
      }
      restQuantity: {
        quantity: number
        real: number
      }
      note?: string
    } | null
  }[]
  orders: {
    products: {
      sku: string
      name?: string
      quantity: number
    }[]
    quantity: number
  }[]
  timestamp: string
}

export interface ProductsCalResult {
  items: {
    _id: string
    quantity: number
    storageItems: {
      code: string
      name: string
      receivedQuantity: {
        quantity: number
        real: number
      }
      deliveredQuantity: {
        quantity: number
        real: number
      }
      restQuantity: {
        quantity: number
        real: number
      }
      note?: string
      _id: string
    }[]
  }[]
  orders: {
    products: { name: string; quantity: number }[]
    quantity: number
  }[]
  timestamp: string
}

interface CalResultState {
  // Shopee results
  lastShopeeResult: CalResult | null
  setLastShopeeResult: (result: CalResult) => void
  clearShopeeResult: () => void

  // Products results
  lastProductsResult: ProductsCalResult | null
  setLastProductsResult: (result: ProductsCalResult) => void
  clearProductsResult: () => void
}

export const useCalResultStore = create<CalResultState>()(
  persist(
    (set) => ({
      // Shopee results
      lastShopeeResult: null,
      setLastShopeeResult: (result) => set({ lastShopeeResult: result }),
      clearShopeeResult: () => set({ lastShopeeResult: null }),

      // Products results
      lastProductsResult: null,
      setLastProductsResult: (result) => set({ lastProductsResult: result }),
      clearProductsResult: () => set({ lastProductsResult: null })
    }),
    {
      name: "cal-results-storage",
      partialize: (state) => ({
        lastShopeeResult: state.lastShopeeResult,
        lastProductsResult: state.lastProductsResult
      })
    }
  )
)
