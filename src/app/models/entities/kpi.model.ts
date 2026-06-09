/**
 * A daily snapshot of a sales rep's performance for a product.
 * Mirrors ProcessZero.Domain.Entities.KPI (BaseEntity + the fields below).
 *
 * MRR is recalculated automatically on the backend from active client contacts
 * and their closed invoice amounts whenever the sales rep updates their KPIs.
 */
export interface KPI {
  // BaseEntity
  id: number;
  userId: string;
  createdAt: string; // ISO date string from backend
  updatedAt: string; // ISO date string from backend

  productId: number;

  // Daily activity
  callOutreach: number;   // call outreach made for the day
  emailOutreach: number;  // email outreach made for the day
  callsMade: number;      // calls made for the day
  meetingsBooked: number; // meetings booked for the day (auto-incremented backend-side)

  // Revenue / clients
  dealSizeClosed: number;          // deal size (amount) closed for the day
  activeClients: number;           // active clients used for MRR
  monthlyRecurringRevenue: number; // MRR derived from Contacts + Invoices
}
