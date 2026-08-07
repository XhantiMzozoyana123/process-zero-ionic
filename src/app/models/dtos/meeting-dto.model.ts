import { Contact } from "../entities/contact.model";
import { Product } from "../entities/product.model";
import { Meeting, OpportunityStatus } from "../entities/meeting.model";

export interface MeetingDto {
  userId?: string;
  contact: Contact;
  product: Product;
  meeting: Meeting;
  // ── Opportunity fields ──────────────────────────────────
  budget?: number;
  commission?: number;
  opportunityStatus?: OpportunityStatus;
  contactName?: string;
  contactEmail?: string;
  contactCompany?: string;
}