export interface User {
  _id: string;
  email: string;
  role: 'admin' | 'medecin';
  nom: string;
  prenom: string;
  specialite?: string;
  actif: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}
