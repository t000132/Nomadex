import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Voyage } from '../models/voyage.model';

type VoyageCreatePayload = Omit<Voyage, 'id'> & { id?: number };

/**
 * Service pour gérer les opérations CRUD des voyages
 * Utilise HttpClient pour communiquer avec l'API JSON Server
 */
@Injectable({
  providedIn: 'root'
})
export class VoyageService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/voyages';

  /**
   * Récupère tous les voyages
   */
  getAllVoyages(): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(this.baseUrl);
  }

  /**
   * Récupère un voyage par son ID
   */
  getVoyageById(id: number): Observable<Voyage> {
    return this.http.get<Voyage>(`${this.baseUrl}/${id}`);
  }

  /**
   * Récupère les voyages d'un utilisateur spécifique
   */
  getVoyagesByUserId(userId: number): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(`${this.baseUrl}?userId=${userId}`);
  }

  /**
   * Récupère tous les voyages publics
   */
  getPublicVoyages(): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(`${this.baseUrl}?isPublic=true`);
  }

  /**
   * Crée un nouveau voyage
   */
  createVoyage(voyage: VoyageCreatePayload): Observable<Voyage> {
    return this.http.post<Voyage>(this.baseUrl, voyage);
  }

  /**
   * Met à jour un voyage existant
   */
  updateVoyage(voyage: Voyage): Observable<Voyage> {
    return this.http.put<Voyage>(`${this.baseUrl}/${voyage.id}`, voyage);
  }

  /**
   * Supprime un voyage
   */
  deleteVoyage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Alias pour compatibilité - récupère tous les voyages
   */
  getVoyages(): Observable<Voyage[]> {
    return this.getAllVoyages();
  }
}
