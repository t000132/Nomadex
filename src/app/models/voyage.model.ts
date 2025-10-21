export interface Voyage {
  id: number;
  userId: number;
  titre: string;
  destination: string;
  pays: string;
  dateDebut: string;
  dateFin: string;
  description: string;
  imageUrl?: string;
  imageData?: string;
  galleries?: string[];
  latitude?: number;
  longitude?: number;
  isPublic: boolean;
  createdAt?: string;
}
