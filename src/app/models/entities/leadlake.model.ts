export interface LeadLake {
  id?: number;
  userId?: string;

  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  job: string;
  location: string;
  industry: LeadLakeIndustry;
  intent?: LeadIntent;
  createdAt?: string;
  updatedAt?: string;
}

export enum LeadIntent {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

export enum LeadLakeIndustry {
  Technology = 'Technology',
  Finance = 'Finance',
  Healthcare = 'Healthcare',
  Education = 'Education',
  Retail = 'Retail',
  Manufacturing = 'Manufacturing',
  Entertainment = 'Entertainment',
  Hospitality = 'Hospitality',
  Transportation = 'Transportation',
  Energy = 'Energy',
  Other = 'Other'
}