/**
 * @deprecated This hook has been split into multiple specialized hooks.
 * Please use the appropriate hook for your needs:
 *
 * - `useLivestreamCore` for core operations (ranges, snapshots, metrics)
 * - `useLivestreamAnalytics` for analytics and statistics
 * - `useLivestreamPeriods` for period management
 * - `useLivestreamChannels` for channel management
 * - `useLivestreamGoals` for month goals
 * - `useLivestreamAltRequests` for alt requests
 * - `useLivestreamEmployees` for employee management (also deprecated)
 *
 * This file is kept for backward compatibility only and will be removed in a future version.
 */
export const useLivestream = () => {
  throw new Error(
    "useLivestream is deprecated. Please use specific hooks like useLivestreamCore, useLivestreamAnalytics, etc."
  )
}
