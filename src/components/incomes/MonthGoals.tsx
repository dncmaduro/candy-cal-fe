import { useState } from "react"
import { useMonthGoal } from "../../hooks/useMonthGoal"
import { useQuery } from "@tanstack/react-query"

export const MonthGoals = () => {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [year, setYear] = useState(new Date().getFullYear())
  const { getGoals } = useMonthGoal()

  const { data: goalsData, isLoading } = useQuery({
    queryKey: ["getGoals", year, page, limit],
    queryFn: () => getGoals({ year, page, limit }),
    select: (data) => data.data
  })

  return <></>
}
