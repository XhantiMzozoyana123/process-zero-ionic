import { Contact } from "../entities/contact.model";
import { Product } from "../entities/product.model";
import { Meeting } from "../entities/meeting.model";

export interface MeetingDto {
  userId?: string;
  contact: Contact;
  product: Product;
  meeting: Meeting;
}