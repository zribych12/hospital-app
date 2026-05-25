import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, TitleCasePipe, NgFor, NgIf } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PatientService } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';
import { Patient, ConsultationNote, StatutPatient } from '../../../core/models/patient.model';

@Component({
  selector: 'app-fiche-patient',
  standalone: true,
  imports: [SidebarComponent, StatusBadgeComponent, RouterLink, ReactiveFormsModule, DatePipe, TitleCasePipe, NgFor, NgIf],
  templateUrl: './fiche-patient.component.html',
})
export class FichePatientComponent implements OnInit {
  patient = signal<Patient | null>(null);
  consultations = signal<ConsultationNote[]>([]);
  loading = signal(true);
  saving = signal(false);
  saveSuccess = signal(false);
  savingInfo = signal(false);
  saveInfoSuccess = signal(false);
  showInfoEdit = signal(false);
  showNotesEdit = signal(false);
  showConsultForm = signal(false);
  consultLoading = signal(false);
  consultSuccess = signal(false);
  editingConsultId = signal<string | null>(null);
  editConsultLoading = signal(false);
  deletingConsultId = signal<string | null>(null);

  notesForm: FormGroup;
  patientInfoForm: FormGroup;
  consultForm: FormGroup;
  editConsultForm: FormGroup;

  statuts: StatutPatient[] = ['stable', 'en observation', 'critique', 'guéri'];

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService,
    public auth: AuthService,
    private fb: FormBuilder
  ) {
    this.notesForm = this.fb.group({
      notesMedicales: [''],
      statut: ['stable'],
    });
    this.patientInfoForm = this.fb.group({
      prenom:        [''],
      nom:           [''],
      telephone:     [''],
      email:         [''],
      adresse:       [''],
      pathologie:    [''],
      dateNaissance: [''],
    });
    this.consultForm = this.fb.group({
      diagnostic:    ['', Validators.required],
      traitement:    [''],
      notes:         [''],
      statutPatient: ['stable'],
    });
    this.editConsultForm = this.fb.group({
      diagnostic:    ['', Validators.required],
      traitement:    [''],
      notes:         [''],
      statutPatient: ['stable'],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.patientService.getPatientById(id).subscribe({
      next: ({ patient, consultations }) => {
        this.patient.set(patient);
        this.consultations.set(consultations);
        this.notesForm.patchValue({
          notesMedicales: patient.notesMedicales ?? '',
          statut: patient.statut,
        });
        this.patientInfoForm.patchValue({
          prenom:        patient.prenom,
          nom:           patient.nom,
          telephone:     patient.telephone ?? '',
          email:         patient.email ?? '',
          adresse:       patient.adresse ?? '',
          pathologie:    patient.pathologie ?? '',
          dateNaissance: patient.dateNaissance ? new Date(patient.dateNaissance).toISOString().split('T')[0] : '',
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  saveNotes(): void {
    if (this.saving() || !this.patient()) return;
    this.saving.set(true);
    this.saveSuccess.set(false);

    const { notesMedicales, statut } = this.notesForm.value;
    this.patientService.updateNotes(this.patient()!._id, notesMedicales, statut).subscribe({
      next: (updated) => {
        this.patient.set(updated);
        this.saving.set(false);
        this.saveSuccess.set(true);
        this.showNotesEdit.set(false);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: () => this.saving.set(false),
    });
  }

  savePatientInfo(): void {
    if (this.savingInfo() || !this.patient()) return;
    this.savingInfo.set(true);
    this.saveInfoSuccess.set(false);
    this.patientService.updatePatient(this.patient()!._id, this.patientInfoForm.value).subscribe({
      next: (updated) => {
        this.patient.set(updated);
        this.savingInfo.set(false);
        this.saveInfoSuccess.set(true);
        this.showInfoEdit.set(false);
        setTimeout(() => this.saveInfoSuccess.set(false), 3000);
      },
      error: () => this.savingInfo.set(false),
    });
  }

  submitConsultation(): void {
    if (this.consultForm.invalid || this.consultLoading() || !this.patient()) return;
    this.consultLoading.set(true);
    this.consultSuccess.set(false);
    this.patientService.createConsultation(this.patient()!._id, this.consultForm.value).subscribe({
      next: (newConsult) => {
        this.consultations.update(list => [newConsult, ...list]);
        this.consultForm.reset({ statutPatient: 'stable' });
        this.consultLoading.set(false);
        this.consultSuccess.set(true);
        this.showConsultForm.set(false);
        setTimeout(() => this.consultSuccess.set(false), 4000);
      },
      error: () => this.consultLoading.set(false),
    });
  }

  startEditConsult(c: ConsultationNote): void {
    this.editingConsultId.set(c._id);
    this.editConsultForm.patchValue({
      diagnostic:    c.diagnostic,
      traitement:    c.traitement ?? '',
      notes:         c.notes ?? '',
      statutPatient: c.statutPatient ?? 'stable',
    });
  }

  cancelEditConsult(): void {
    this.editingConsultId.set(null);
  }

  saveEditConsult(id: string): void {
    if (this.editConsultForm.invalid || this.editConsultLoading()) return;
    this.editConsultLoading.set(true);
    this.patientService.updateConsultation(id, this.editConsultForm.value).subscribe({
      next: (updated) => {
        this.consultations.update(list => list.map(c => c._id === id ? updated : c));
        this.editingConsultId.set(null);
        this.editConsultLoading.set(false);
      },
      error: () => this.editConsultLoading.set(false),
    });
  }

  deleteConsult(id: string): void {
    if (!confirm('Supprimer cette consultation ?')) return;
    this.deletingConsultId.set(id);
    this.patientService.deleteConsultation(id).subscribe({
      next: () => {
        this.consultations.update(list => list.filter(c => c._id !== id));
        this.deletingConsultId.set(null);
      },
      error: () => this.deletingConsultId.set(null),
    });
  }
}
