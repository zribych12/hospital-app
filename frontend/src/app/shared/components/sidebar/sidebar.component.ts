import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed top-0 left-0 z-30">
      <!-- Logo -->
      <div class="px-6 py-5 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <img src="assets/logo.png" alt="NEXUS-MED" class="h-12 w-12 object-cover" />
          <span class="font-bold text-gray-900 text-lg">NEXUS-MED</span>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        @if (auth.isAdmin()) {
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="sidebar-link">
            <span>📊</span> Dashboard
          </a>
          <a routerLink="/admin/medecins" routerLinkActive="active" class="sidebar-link">
            <span>👨‍⚕️</span> Médecins
          </a>
          <a routerLink="/admin/patients" routerLinkActive="active" class="sidebar-link">
            <span>🗂️</span> Patients (lecture)
          </a>
        }
        @if (auth.isMedecin()) {
          <a routerLink="/medecin/dashboard" routerLinkActive="active" class="sidebar-link">
            <span>📊</span> Dashboard
          </a>
          <a routerLink="/medecin/patients" routerLinkActive="active" class="sidebar-link">
            <span>👥</span> Mes patients
          </a>
          <a routerLink="/medecin/planning" routerLinkActive="active" class="sidebar-link">
            <span>📅</span> Planning
          </a>
        }
      </nav>

      <!-- User -->
      <div class="px-4 py-4 border-t border-gray-100">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
            {{ initials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate">{{ fullName }}</p>
            <p class="text-xs text-gray-500 capitalize">{{ auth.getRole() }}</p>
          </div>
        </div>
        <button (click)="auth.logout()" class="w-full btn-secondary text-sm justify-center">
          Déconnexion
        </button>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  constructor(public auth: AuthService) {}

  get fullName(): string {
    const u = this.auth.getUser();
    return u ? `${u.prenom} ${u.nom}` : '';
  }

  get initials(): string {
    const u = this.auth.getUser();
    return u ? `${u.prenom[0]}${u.nom[0]}`.toUpperCase() : '?';
  }
}
