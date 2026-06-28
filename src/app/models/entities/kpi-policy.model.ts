export type ConsequenceLevel = 'None' | 'Warning' | 'Freeze' | 'Suspend';

export interface KpiPolicy {
    id?: number;
    userId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    productId: number | null;
    policyName?: string;
    effectiveFrom: Date;
    effectiveTo: Date | null;
    isActive: boolean;
    dailyEmailsTarget?: number;
    dailyCallsTarget?: number;
    minimumReplyRate?: number; // decimal -> number in TS/JS
    weeklyMeetingsTarget?: number;
    monthlyRevenueTarget?: number; // decimal
    monthlyRecurringRevenueTarget?: number; // decimal
    performanceTolerance?: number; // decimal
    consequenceLevel?: ConsequenceLevel;
    consequenceOnBreach?: number;
    managerApprovalRequiredToUnfreeze?: boolean;
    targetMRR?: number;
    gracePeriodDays?: number;
    autoFreezeOnBreach?: boolean;
}