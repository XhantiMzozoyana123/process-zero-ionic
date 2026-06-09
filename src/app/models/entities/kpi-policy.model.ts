/**
 * Defines the MRR target for a product/rep over an effective period.
 * Mirrors ProcessZero.Domain.Entities.KpiPolicy (BaseEntity + the fields below).
 */
export interface KpiPolicy {
  // BaseEntity
  id?: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;

  productId?: number | null;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  isActive?: boolean;

  // Target threshold
  targetMRR?: number;

  // Consequence flags
  gracePeriodDays?: number;
  autoFreezeOnBreach?: boolean;
}
