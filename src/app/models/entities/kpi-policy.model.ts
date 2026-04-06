export interface KpiPolicy {
  id?: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;

  productId?: number | null;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  isActive?: boolean;

  // Key thresholds
  minMonthlyRevenue?: number;
  minOutreachAttempts?: number;
  minCallsBooked?: number;

  // Consequence flags
  gracePeriodDays?: number;
  autoFreezeOnBreach?: boolean;
}
