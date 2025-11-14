import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Voyage } from '../models/voyage.model';

@Injectable({
  providedIn: 'root'
})
export class VoyageService {
  private apiUrl = 'http://localhost:3000/voyages';

  constructor(private http: HttpClient) { }

  getAllVoyages(): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(this.apiUrl);
  }

  getVoyageById(id: number): Observable<Voyage> {
    return this.http.get<Voyage>(`${this.apiUrl}/${id}`);
  }

  getVoyagesByUserId(userId: number): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(`${this.apiUrl}?userId=${userId}`);
  }

  getPublicVoyages(): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(`${this.apiUrl}?isPublic=true`);
  }

  createVoyage(voyage: Omit<Voyage, 'id'>): Observable<Voyage> {
    const newVoyage = {
      ...voyage,
      createdAt: new Date().toISOString()
    };
    return this.http.post<Voyage>(this.apiUrl, newVoyage);
  }

  updateVoyage(id: number, voyage: Partial<Voyage>): Observable<Voyage> {
    return this.http.patch<Voyage>(`${this.apiUrl}/${id}`, voyage);
  }

  deleteVoyage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
