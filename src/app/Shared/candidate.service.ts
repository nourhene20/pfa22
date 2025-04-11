import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // ✅ Garder ça SEULEMENT
import { Observable } from 'rxjs';
import { Candidate } from './candidate.model';


@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private baseUrl = 'http://127.0.0.1:3000/api/candidates';

  constructor(private http: HttpClient) {}

  getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.baseUrl);
  }

  addCandidate(candidate: Candidate): Observable<Candidate> {
    return this.http.post<Candidate>(this.baseUrl, candidate);
  }

  updateCandidate(candidate: Candidate): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.baseUrl}/${candidate.cin}`, candidate);
  }

  deleteCandidate(cin: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${cin}`);
  }
}