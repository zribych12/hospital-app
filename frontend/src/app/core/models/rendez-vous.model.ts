export type StatutRdv = 'en attente' | 'confirmé' | 'annulé' | 'présent' | 'absent';
export type TypeRdv = 'consultation' | 'urgence' | 'suivi';
export type NiveauUrgence = 'faible' | 'moyen' | 'élevé';

export interface RendezVous {
  _id: string;
  patient?: { _id: string; nom: string; prenom: string; telephone?: string };
  medecin: { _id: string; nom: string; prenom: string; specialite?: string };
  date: string;
  heure: string;
  duree: number;
  motif: string;
  type: TypeRdv;
  statut: StatutRdv;
  niveauUrgence: NiveauUrgence;
  reference?: string;
  patientPublic?: {
    nom: string;
    prenom: string;
    dateNaissance?: string;
    telephone?: string;
    email?: string;
  };
  notes?: string;
  createdAt?: string;
}

export interface PublicRdvPayload {
  nom: string;
  prenom: string;
  dateNaissance?: string;
  telephone: string;
  email?: string;
  medecinId: string;
  motif: string;
  niveauUrgence: NiveauUrgence;
  date: string;
  heure: string;
}
