import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Patient, ConsultationNote, PaginatedPatients } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private apiUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  getPatients(params: {
    page?: number;
    limit?: number;
    statut?: string;
    pathologie?: string;
  } = {}): Observable<PaginatedPatients> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);
    if (params.statut) httpParams = httpParams.set('statut', params.statut);
    if (params.pathologie) httpParams = httpParams.set('pathologie', params.pathologie);
    return this.http.get<PaginatedPatients>(this.apiUrl, { params: httpParams });
  }

  getPatientById(id: string): Observable<{ patient: Patient; consultations: ConsultationNote[] }> {
    return this.http.get<{ patient: Patient; consultations: ConsultationNote[] }>(`${this.apiUrl}/${id}`);
  }

  createPatient(data: Partial<Patient>): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, data);
  }

  updatePatient(id: string, data: Partial<Patient>): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, data);
  }

  updateNotes(id: string, notesMedicales: string, statut?: string): Observable<Patient> {
    return this.http.patch<Patient>(`${this.apiUrl}/${id}/notes`, { notesMedicales, statut });
  }

  createConsultation(patientId: string, data: {
    diagnostic: string;
    traitement?: string;
    notes?: string;
    statutPatient?: string;
  }): Observable<ConsultationNote> {
    return this.http.post<ConsultationNote>(
      `${environment.apiUrl}/consultations`,
      { patient: patientId, ...data }
    );
  }

  updateConsultation(id: string, data: {
    diagnostic?: string;
    traitement?: string;
    notes?: string;
    statutPatient?: string;
  }): Observable<ConsultationNote> {
    return this.http.put<ConsultationNote>(
      `${environment.apiUrl}/consultations/${id}`,
      data
    );
  }

  deleteConsultation(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/consultations/${id}`);
  }

  deletePatient(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/patients/${id}`);
  }
}
