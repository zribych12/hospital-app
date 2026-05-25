import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MedecinStats {
  totalPatients: number;
  rdvAujourdhui: number;
  rdvEnAttente: number;
  tauxPresence: number;
  prochainRdv: Array<{
    _id: string;
    heure: string;
    motif: string;
    statut: string;
    patient?: { nom: string; prenom: string };
    patientPublic?: { nom: string; prenom: string };
  }>;
  pathologies: Array<{ _id: string; count: number }>;
  consultEvolution: Array<{ _id: string; count: number }>;
}

export interface AdminStats {
  totalMedecins: number;
  medecinActifs: number;
  medecinInactifs: number;
  totalPatients: number;
  rdvCeMois: number;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private apiUrl = `${environment.apiUrl}/stats`;

  constructor(private http: HttpClient) {}

  getMedecinStats(): Observable<MedecinStats> {
    return this.http.get<MedecinStats>(`${this.apiUrl}/medecin`);
  }

  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/admin`);
  }
}
