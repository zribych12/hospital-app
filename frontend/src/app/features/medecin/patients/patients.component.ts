import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass, DatePipe, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PatientService } from '../../../core/services/patient.service';
import { Patient, PaginatedPatients } from '../../../core/models/patient.model';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [SidebarComponent, StatusBadgeComponent, RouterLink, NgClass, DatePipe, NgIf, ReactiveFormsModule],
  templateUrl: './patients.component.html',
})
export class PatientsComponent implements OnInit {
  data = signal<PaginatedPatients | null>(null);
  loading = signal(true);
  page = signal(1);
  limit = 12;
  filtreStatut = signal('');
  filtrePathologie = signal('');
  showAddModal = signal(false);
  addLoading = signal(false);
  addError = signal('');
  deletingId = signal<string | null>(null);
  patientAddForm: FormGroup;

  constructor(private patientService: PatientService, private fb: FormBuilder) {
    this.patientAddForm = this.fb.group({
      prenom:        ['', Validators.required],
      nom:           ['', Validators.required],
      dateNaissance: ['', Validators.required],
      telephone:     [''],
      email:         ['', Validators.email],
      adresse:       [''],
      pathologie:    [''],
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.patientService
      .getPatients({
        page: this.page(),
        limit: this.limit,
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
    if (this.page() > 1) { this.page.update((p) => p - 1); this.load(); }
  }

  nextPage(): void {
    if (this.data() && this.page() < this.data()!.totalPages) {
      this.page.update((p) => p + 1); this.load();
    }
  }

  openAddModal(): void {
    this.patientAddForm.reset();
    this.addError.set('');
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  submitAdd(): void {
    if (this.patientAddForm.invalid || this.addLoading()) return;
    this.addLoading.set(true);
    this.addError.set('');
    this.patientService.createPatient(this.patientAddForm.value).subscribe({
      next: () => {
        this.addLoading.set(false);
        this.showAddModal.set(false);
        this.page.set(1);
        this.load();
      },
      error: (err) => {
        this.addLoading.set(false);
        this.addError.set(err?.error?.message || 'Erreur lors de la création');
      },
    });
  }

  calcAge(dateNaissance: string): number {
    if (!dateNaissance) return 0;
    const diff = Date.now() - new Date(dateNaissance).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  confirmDelete(id: string): void {
    if (!confirm('Supprimer ce patient ? Cette action est irréversible.')) return;
    this.deletingId.set(id);
    this.patientService.deletePatient(id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.load();
      },
      error: () => this.deletingId.set(null),
    });
  }
}
