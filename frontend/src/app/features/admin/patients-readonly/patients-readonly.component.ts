import { Component, OnInit, signal } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PatientService } from '../../../core/services/patient.service';
import { Patient, PaginatedPatients, StatutPatient } from '../../../core/models/patient.model';

@Component({
  selector: 'app-patients-readonly',
  standalone: true,
  imports: [SidebarComponent, StatusBadgeComponent, NgClass, DatePipe],
  template: `
    <div class="flex">
      <app-sidebar />
      <main class="ml-64 flex-1 p-8 min-h-screen">
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Patients (lecture seule)</h1>
          <p class="text-gray-500 mt-1">{{ data()?.total ?? 0 }} patient(s) enregistré(s)</p>
        </div>

        <!-- Filters -->
        <div class="card mb-6 flex gap-4 flex-wrap">
          <select (change)="onStatutChange($event)" class="form-select w-auto">
            <option value="">Tous les statuts</option>
            <option value="stable">Stable</option>
            <option value="en observation">En observation</option>
            <option value="critique">Critique</option>
            <option value="guéri">Guéri</option>
          </select>
          <input
            type="text"
            placeholder="Filtrer par pathologie..."
            (input)="onPathologieChange($event)"
            class="form-input w-64"
          />
        </div>

        <div class="card p-0 overflow-hidden">
          @if (loading()) {
            <div class="flex items-center justify-center h-40">
              <svg class="animate-spin w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          } @else {
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="table-th">Patient</th>
                  <th class="table-th">Âge</th>
                  <th class="table-th">Pathologie</th>
                  <th class="table-th">Médecin</th>
                  <th class="table-th">Statut</th>
                  <th class="table-th">Depuis</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (p of data()?.patients ?? []; track p._id) {
                  <tr class="hover:bg-gray-50">
                    <td class="table-td font-medium">{{ p.prenom }} {{ p.nom }}</td>
                    <td class="table-td text-gray-500">{{ calcAge(p.dateNaissance) }} ans</td>
                    <td class="table-td text-gray-500">{{ p.pathologie || '—' }}</td>
                    <td class="table-td text-gray-500">
                      @if (p.medecin) {
                        Dr. {{ p.medecin.prenom }} {{ p.medecin.nom }}
                      } @else { — }
                    </td>
                    <td class="table-td"><app-status-badge [statut]="p.statut" /></td>
                    <td class="table-td text-gray-500">{{ p.createdAt | date:'dd/MM/yyyy' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>

        <!-- Pagination -->
        @if (data() && data()!.totalPages > 1) {
          <div class="flex items-center justify-between mt-4">
            <p class="text-sm text-gray-500">Page {{ page() }} / {{ data()!.totalPages }}</p>
            <div class="flex gap-2">
              <button (click)="prevPage()" [disabled]="page() === 1" class="btn-secondary text-sm py-1.5">← Préc.</button>
              <button (click)="nextPage()" [disabled]="page() === data()!.totalPages" class="btn-secondary text-sm py-1.5">Suiv. →</button>
            </div>
          </div>
        }
      </main>
    </div>
  `,
})
export class PatientsReadonlyComponent implements OnInit {
  data = signal<PaginatedPatients | null>(null);
  loading = signal(true);
  page = signal(1);
  filtreStatut = signal('');
  filtrePathologie = signal('');

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.patientService
      .getPatients({
        page: this.page(),
        limit: 15,
        statut: this.filtreStatut() || undefined,
        pathologie: this.filtrePathologie() || undefined,
      })
      .subscribe({
        next: (d) => {
          this.data.set(d);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onStatutChange(e: Event): void {
    this.filtreStatut.set((e.target as HTMLSelectElement).value);
    this.page.set(1);
    this.load();
  }

  onPathologieChange(e: Event): void {
    this.filtrePathologie.set((e.target as HTMLInputElement).value);
    this.page.set(1);
    this.load();
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.load();
    }
  }

  nextPage(): void {
    if (this.data() && this.page() < this.data()!.totalPages) {
      this.page.update((p) => p + 1);
      this.load();
    }
  }

  calcAge(dateNaissance: string): number {
    if (!dateNaissance) return 0;
    const diff = Date.now() - new Date(dateNaissance).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }
}
