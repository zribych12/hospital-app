import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/public/home/home.component').then((m) => m.HomeComponent),
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },

  // Admin routes
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
      },
      {
        path: 'medecins',
        loadComponent: () =>
          import('./features/admin/medecins/medecins.component').then((m) => m.MedecinsComponent),
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./features/admin/patients-readonly/patients-readonly.component').then(
            (m) => m.PatientsReadonlyComponent
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // Medecin routes
  {
    path: 'medecin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['medecin'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/medecin/dashboard/medecin-dashboard.component').then(
            (m) => m.MedecinDashboardComponent
          ),
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./features/medecin/patients/patients.component').then((m) => m.PatientsComponent),
      },
      {
        path: 'patients/:id',
        loadComponent: () =>
          import('./features/medecin/fiche-patient/fiche-patient.component').then(
            (m) => m.FichePatientComponent
          ),
      },
      {
        path: 'planning',
        loadComponent: () =>
          import('./features/medecin/planning/planning.component').then((m) => m.PlanningComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // Public routes
  {
    path: 'rendez-vous',
    loadComponent: () =>
      import('./features/public/rendez-vous/rendez-vous-public.component').then(
        (m) => m.RendezVousPublicComponent
      ),
  },

  // Error pages
  {
    path: '403',
    loadComponent: () =>
      import('./features/errors/forbidden/forbidden.component').then((m) => m.ForbiddenComponent),
  },
  { path: '**', redirectTo: '/login' },
];
