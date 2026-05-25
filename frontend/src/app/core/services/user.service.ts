import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getMedecins(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/medecins`);
  }

  getMedecinById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/medecins/${id}`);
  }

  createMedecin(data: {
    nom: string;
    prenom: string;
    email: string;
    specialite: string;
  }): Observable<{ medecin: User; tempPassword: string }> {
    return this.http.post<{ medecin: User; tempPassword: string }>(
      `${this.apiUrl}/medecins`,
      data
    );
  }

  toggleStatus(id: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/medecins/${id}/toggle-status`, {});
  }

  resetPassword(id: string): Observable<{ tempPassword: string }> {
    return this.http.patch<{ tempPassword: string }>(
      `${this.apiUrl}/medecins/${id}/reset-password`,
      {}
    );
  }
}
