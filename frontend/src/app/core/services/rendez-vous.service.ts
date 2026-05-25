import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RendezVous, PublicRdvPayload } from '../models/rendez-vous.model';

@Injectable({ providedIn: 'root' })
export class RendezVousService {
  private apiUrl = `${environment.apiUrl}/rendez-vous`;
  private publicUrl = `${environment.apiUrl}/public`;

  constructor(private http: HttpClient) {}

  getRendezVous(params: {
    date?: string;
    statut?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Observable<RendezVous[]> {
    let httpParams = new HttpParams();
    if (params.date) httpParams = httpParams.set('date', params.date);
    if (params.statut) httpParams = httpParams.set('statut', params.statut);
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    return this.http.get<RendezVous[]>(this.apiUrl, { params: httpParams });
  }

  getCreneaux(medecinId: string, date: string): Observable<string[]> {
    const params = new HttpParams().set('medecinId', medecinId).set('date', date);
    return this.http.get<string[]>(`${this.apiUrl}/creneaux`, { params });
  }

  createRendezVous(data: Partial<RendezVous>): Observable<RendezVous> {
    return this.http.post<RendezVous>(this.apiUrl, data);
  }

  updateRendezVous(id: string, data: Partial<RendezVous>): Observable<RendezVous> {
    return this.http.put<RendezVous>(`${this.apiUrl}/${id}`, data);
  }

  cancelRendezVous(id: string): Observable<RendezVous> {
    return this.http.patch<RendezVous>(`${this.apiUrl}/${id}/annuler`, {});
  }

  // Public routes (sans auth)
  getPublicMedecins(): Observable<{ _id: string; nom: string; prenom: string; specialite: string }[]> {
    return this.http.get<{ _id: string; nom: string; prenom: string; specialite: string }[]>(
      `${this.publicUrl}/medecins`
    );
  }

  getPublicCreneaux(medecinId: string, date: string): Observable<string[]> {
    const params = new HttpParams().set('medecinId', medecinId).set('date', date);
    return this.http.get<string[]>(`${this.publicUrl}/creneaux`, { params });
  }

  createPublicRdv(payload: PublicRdvPayload): Observable<{ message: string; reference: string }> {
    return this.http.post<{ message: string; reference: string }>(
      `${this.publicUrl}/rendez-vous`,
      payload
    );
  }
}
