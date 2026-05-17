import { Button } from "@mantine/core"
import type { MouseEvent } from "react"
import type { SalesOrderDiscountType } from "../../utils/salesOrderDiscount"

type OrderDiscountModeToggleProps = {
  mode: SalesOrderDiscountType
  onToggle: () => void
}

export const OrderDiscountModeToggle = ({
  mode,
  onToggle
}: OrderDiscountModeToggleProps) => {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    onToggle()
  }

  return (
    <Button
      type="button"
      size="xs"
      radius="md"
      color="orange"
      variant="filled"
      px={10}
      onClick={handleClick}
      aria-label={
        mode === "percent"
          ? "Chuyển chiết khấu sang theo tiền"
          : "Chuyển chiết khấu sang theo phần trăm"
      }
    >
      {mode === "percent" ? "%" : "đ"}
    </Button>
  )
}
