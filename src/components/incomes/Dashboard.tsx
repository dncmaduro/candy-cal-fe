import { MonthlyRevenueDashboard } from "./dashboard-v2/MonthlyRevenueDashboard"
import type { DiscountMode } from "./dashboard-v2/types"

export const Dashboard = ({
  defaultMode
}: {
  defaultMode?: DiscountMode
}) => <MonthlyRevenueDashboard initialMode={defaultMode} />
