export interface Level {
  id: number;
  name: string;
  commissionRate: number;
  recurringCommission: boolean;
  overrideCommission: boolean;
  paidStipend: boolean;
  obtainWarmLeads: boolean;
  canRecruit: boolean;
  ownEquity: boolean;
  profitParticipation: boolean;
  revenueShares: boolean;
  internalVentureOpportunities: boolean;
}
