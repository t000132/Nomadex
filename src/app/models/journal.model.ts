export interface Journal {
  id: number;
  voyageId: number;
  date: string;
  titre: string;
  contenu: string;
  imageUrl?: string;
  humeur?: string;
  meteo?: string;
  lieu?: string;
  createdAt?: string;
}
