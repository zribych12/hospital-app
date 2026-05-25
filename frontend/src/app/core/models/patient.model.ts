export type StatutPatient = 'stable' | 'en observation' | 'critique' | 'guéri';

export interface Patient {
  _id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  telephone: string;
  email?: string;
  adresse?: string;
  pathologie?: string;
  statut: StatutPatient;
  notesMedicales?: string;
  medecin?: { _id: string; nom: string; prenom: string; specialite?: string };
  age?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConsultationNote {
  _id: string;
  patient: string;
  medecin: { _id: string; nom: string; prenom: string; specialite?: string };
  rendezVous?: string;
  date: string;
  diagnostic: string;
  traitement?: string;
  notes?: string;
  statutPatient?: StatutPatient;
  createdAt?: string;
}

export interface PaginatedPatients {
  patients: Patient[];
  total: number;
  page: number;
  totalPages: number;
}
