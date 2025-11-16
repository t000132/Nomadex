import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Journal } from '../models/journal.model';

type JournalCreatePayload = Omit<Journal, 'id'> & { id?: number };

/**
 * Service pour gérer les opérations CRUD des journaux
 * Utilise HttpClient pour communiquer avec l'API JSON Server
 */
@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/journaux';

  /**
   * Récupère tous les journaux
   */
  getAllJournaux(): Observable<Journal[]> {
    return this.http.get<Journal[]>(this.baseUrl);
  }

  /**
   * Récupère un journal par son ID
   */
  getJournalById(id: number): Observable<Journal> {
    return this.http.get<Journal>(`${this.baseUrl}/${id}`);
  }

  /**
   * Récupère les journaux d'un voyage spécifique
   */
  getJournauxByVoyageId(voyageId: number): Observable<Journal[]> {
    return this.http.get<Journal[]>(`${this.baseUrl}?voyageId=${voyageId}`);
  }

  /**
   * Récupère les journaux d'un utilisateur spécifique
   */
  getJournauxByUserId(userId: number): Observable<Journal[]> {
    return this.http.get<Journal[]>(`${this.baseUrl}?userId=${userId}`);
  }

  /**
   * Crée un nouveau journal
   */
  createJournal(journal: JournalCreatePayload): Observable<Journal> {
    return this.http.post<Journal>(this.baseUrl, journal);
  }

  /**
   * Met à jour un journal existant
   */
  updateJournal(journal: Journal): Observable<Journal> {
    return this.http.put<Journal>(`${this.baseUrl}/${journal.id}`, journal);
  }

  /**
   * Supprime un journal
   */
  deleteJournal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
