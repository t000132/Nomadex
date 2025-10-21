import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Voyage } from '../models/voyage.model';

type VoyageCreatePayload = Omit<Voyage, 'id'> & { id?: number };

@Injectable({
  providedIn: 'root'
})
export class VoyageService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/voyages';

  getVoyages(): Observable<Voyage[]> {
    return this.http.get<Voyage[]>(this.baseUrl);
  }

  createVoyage(voyage: VoyageCreatePayload): Observable<Voyage> {
    return this.http.post<Voyage>(this.baseUrl, voyage);
  }

  updateVoyage(voyage: Voyage): Observable<Voyage> {
    return this.http.put<Voyage>(`${this.baseUrl}/${voyage.id}`, voyage);
  }

  deleteVoyage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
