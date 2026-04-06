export interface KPI {
  id: number;
  userId: string;
  createdAt: string; // ISO date string from backend
  updatedAt: string; // ISO date string from backend

  productId: number;

  // Core activity metrics
  outreachAttempts: number;
  callsBooked: number;
  callsAttended: number;
  dealsInfluenced: number;
  revenueGenerated: number;

  // Deal performance metrics
  dealsClosed: number;
  dealsAttempted: number;
  averageDealSize: number;
  revenueInfluenced: number;
  basicClientRetention: number;
  activityConsistency: number;

  // Team metrics
  activeTeamSize: number;
  teamRevenue: number;
  teamCloseRate: number;
  teamChurnRate: number;
  leaderActivityLevel: number;

  // Business health metrics
  monthlyRecurringRevenue: number;
  growthRate: number;
  clientRetention: number;
  teamPerformanceHealth: number;
  brandCompliance: number;
  longTermRevenueGrowth: number;
  strategicInitiativesDelivered: number;
  brandRiskManagement: number;
  innovationContribution: number;
  leadershipStability: number;
}