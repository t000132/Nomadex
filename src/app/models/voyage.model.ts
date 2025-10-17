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
  isPublic: boolean;
  createdAt?: string;
}
