export interface Contact {
  id?: number;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  job?: string;
  location?: string;
  closedAmount?: number;
  status?: ContactStatus;
}

export enum ContactStatus {
  Reached = 0,
  FollowUp = 1,
  Converted = 2,
  Active = 3
}

export const ContactStatusLabels: Record<ContactStatus, string> = {
  [ContactStatus.Reached]: 'Reached',
  [ContactStatus.FollowUp]: 'Follow Up',
  [ContactStatus.Converted]: 'Converted',
  [ContactStatus.Active]: 'Active'
};
