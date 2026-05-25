import { Component, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgClass, DatePipe } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RdvStatusBadgeComponent } from '../../../shared/components/rdv-status-badge/rdv-status-badge.component';
import { RendezVousService } from '../../../core/services/rendez-vous.service';
import { PatientService } from '../../../core/services/patient.service';
import { RendezVous, TypeRdv, StatutRdv } from '../../../core/models/rendez-vous.model';
import { Patient } from '../../../core/models/patient.model';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [SidebarComponent, RdvStatusBadgeComponent, ReactiveFormsModule, NgClass, DatePipe],
  templateUrl: './planning.component.html',
})
export class PlanningComponent implements OnInit {
  currentWeekStart = signal<Date>(this.getMonday(new Date()));
  rdvList = signal<RendezVous[]>([]);
  patients = signal<Patient[]>([]);
  creneaux = signal<string[]>([]);
  loading = signal(false);

  showModal = signal(false);
  editingRdv = signal<RendezVous | null>(null);
  formLoading = signal(false);

  form: FormGroup;

  weekDays = computed(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(this.currentWeekStart());
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  });

  weekStats = computed(() => {
    const list = this.rdvList();
    return {
      total:     list.length,
      confirmes: list.filter(r => r.statut === 'confirmé').length,
      attente:   list.filter(r => r.statut === 'en attente').length,
      present:   list.filter(r => r.statut === 'présent').length,
      absent:    list.filter(r => r.statut === 'absent').length,
    };
  });

  today_date = new Date();

  hours = Array.from({ length: 20 }, (_, i) => {
    const h = Math.floor(i / 2) + 8;
    const m = i % 2 === 0 ? '00' : '30';
    return `${String(h).padStart(2, '0')}:${m}`;
  });

  constructor(
    private rdvService: RendezVousService,
    private patientService: PatientService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      patient: ['', Validators.required],
      date: ['', Validators.required],
      heure: ['', Validators.required],
      motif: ['', Validators.required],
      type: ['consultation'],
      duree: [30],
      niveauUrgence: ['faible'],
    });
  }

  ngOnInit(): void {
    this.loadWeek();
    this.patientService.getPatients({ limit: 100 }).subscribe({
      next: (d) => this.patients.set(d.patients),
    });
  }

  loadWeek(): void {
    this.loading.set(true);
    const start = this.currentWeekStart();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    this.rdvService
      .getRendezVous({
        startDate: this.toLocalDateStr(start),
        endDate:   this.toLocalDateStr(end),
      })
      .subscribe({
        next: (list) => {
          this.rdvList.set(list);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  getRdvForSlot(day: Date, hour: string): RendezVous[] {
    return this.rdvList().filter((r) => {
      const d = new Date(r.date);
      return (
        d.toDateString() === day.toDateString() &&
        r.heure === hour &&
        r.statut !== 'annulé'
      );
    });
  }

  getRdvColor(type: TypeRdv): string {
    const colors: Record<TypeRdv, string> = {
      consultation: 'bg-blue-100 border-blue-300 text-blue-800',
      urgence: 'bg-red-100 border-red-300 text-red-800',
      suivi: 'bg-green-100 border-green-300 text-green-800',
    };
    return colors[type] ?? colors.consultation;
  }

  prevWeek(): void {
    const d = new Date(this.currentWeekStart().getTime());
    d.setDate(d.getDate() - 7);
    this.currentWeekStart.set(d);
    this.loadWeek();
  }

  nextWeek(): void {
    const d = new Date(this.currentWeekStart().getTime());
    d.setDate(d.getDate() + 7);
    this.currentWeekStart.set(d);
    this.loadWeek();
  }

  today(): void {
    this.currentWeekStart.set(this.getMonday(new Date()));
    this.loadWeek();
  }

  openModal(rdv?: RendezVous): void {
    this.editingRdv.set(rdv ?? null);
    if (rdv) {
      this.form.patchValue({
        patient: typeof rdv.patient === 'object' ? rdv.patient?._id : rdv.patient,
        date: new Date(rdv.date).toISOString().split('T')[0],
        heure: rdv.heure,
        motif: rdv.motif,
        type: rdv.type,
        duree: rdv.duree,
        niveauUrgence: rdv.niveauUrgence,
      });
    } else {
      this.form.reset({ type: 'consultation', duree: 30, niveauUrgence: 'faible' });
    }
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveRdv(): void {
    if (this.form.invalid || this.formLoading()) return;
    this.formLoading.set(true);

    const data = this.form.value;
    const obs = this.editingRdv()
      ? this.rdvService.updateRendezVous(this.editingRdv()!._id, data)
      : this.rdvService.createRendezVous(data);

    obs.subscribe({
      next: () => {
        this.formLoading.set(false);
        this.closeModal();
        this.loadWeek();
      },
      error: () => this.formLoading.set(false),
    });
  }

  cancelRdv(rdv: RendezVous): void {
    if (!confirm('Annuler ce rendez-vous ?')) return;
    this.rdvService.cancelRendezVous(rdv._id).subscribe({ next: () => this.loadWeek() });
  }

  updateStatutRdv(rdv: RendezVous, statut: StatutRdv, event: Event): void {
    event.stopPropagation();
    this.rdvService.updateRendezVous(rdv._id, { statut }).subscribe({
      next: () => this.loadWeek(),
    });
  }

  getPatientName(rdv: RendezVous): string {
    if (rdv.patient) return `${rdv.patient.prenom} ${rdv.patient.nom}`;
    if (rdv.patientPublic) return `${rdv.patientPublic.prenom} ${rdv.patientPublic.nom} (public)`;
    return 'Inconnu';
  }

  private getMonday(d: Date): Date {
    const copy = new Date(d.getTime());
    const day = copy.getDay();
    const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
    copy.setDate(diff);
    return copy;
  }

  /** Formate une date en 'YYYY-MM-DD' en heure LOCALE (évite le décalage UTC) */
  private toLocalDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
