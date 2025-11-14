import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Journal } from '../models/journal.model';

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private apiUrl = 'http://localhost:3000/journaux';

  constructor(private http: HttpClient) { }

  getAllJournaux(): Observable<Journal[]> {
    return this.http.get<Journal[]>(this.apiUrl);
  }

  getJournalById(id: number): Observable<Journal> {
    return this.http.get<Journal>(`${this.apiUrl}/${id}`);
  }

  getJournauxByVoyageId(voyageId: number): Observable<Journal[]> {
    return this.http.get<Journal[]>(`${this.apiUrl}?voyageId=${voyageId}`);
  }

  createJournal(journal: Omit<Journal, 'id'>): Observable<Journal> {
    const newJournal = {
      ...journal,
      createdAt: new Date().toISOString()
    };
    return this.http.post<Journal>(this.apiUrl, newJournal);
  }

  updateJournal(id: number, journal: Partial<Journal>): Observable<Journal> {
    return this.http.patch<Journal>(`${this.apiUrl}/${id}`, journal);
  }

  deleteJournal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
