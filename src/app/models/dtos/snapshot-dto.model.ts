// src/app/models/dtos/snapshot-dto.model.ts
export interface SnapShotDto {
  partnerId: number;
  userId: string;
  base64Images: string[];    // allow multiple images
}