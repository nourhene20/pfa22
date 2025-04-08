import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Entretien } from './entretien.entree';

@Injectable({ providedIn: 'root' })
export class EntretienService {
  private apiUrl = 'http://localhost:5000/entretien';
  private entretienSubject = new BehaviorSubject<Entretien[]>([]);
  public entretiens$ = this.entretienSubject.asObservable();

  constructor(private http: HttpClient) { }

  loadEntretiens(): void {
    this.http.get<{ entretiens: any[] }>(this.apiUrl)
      .pipe(
        map(response => response.entretiens.map(this.mapToEntretien)),
        tap(entretiens => this.entretienSubject.next(entretiens)),
        catchError(error => this.handleError('Chargement', error))
      ).subscribe();
  }

  createEntretien(entretien: Entretien): Observable<Entretien> {
    return this.http.post<Entretien>(this.apiUrl, entretien)
      .pipe(tap(() => this.loadEntretiens()));
  }

  updateEntretien(id: string, entretien: Entretien): Observable<Entretien> {
    return this.http.put<Entretien>(`${this.apiUrl}/${id}`, entretien)
      .pipe(tap(() => this.loadEntretiens()));
  }

  deleteEntretien(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.loadEntretiens()));
  }

  getEntretien(id: string): Observable<Entretien> {
    return this.http.get<Entretien>(`${this.apiUrl}/${id}`)
      .pipe(map(this.mapToEntretien));
  }

  private mapToEntretien(entry: any): Entretien {
    return {
      id: entry._id,
      domaine: entry.domaine,
      questions: entry.questions
    };
  }

  private handleError(operation: string, error: any): Observable<never> {
    console.error(`${operation} error:`, error);
    return throwError(() => new Error('Une erreur est survenue'));
  }
}