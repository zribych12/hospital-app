import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { RendezVousService } from '../../../core/services/rendez-vous.service';
import { PublicRdvPayload } from '../../../core/models/rendez-vous.model';

type Step = 1 | 2 | 3 | 4;

@Component({
  selector: 'app-rendez-vous-public',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './rendez-vous-public.component.html',
})
export class RendezVousPublicComponent implements OnInit {
  step = signal<Step>(1);
  loading = signal(false);
  reference = signal('');
  errorMsg = signal('');

  medecins = signal<{ _id: string; nom: string; prenom: string; specialite: string }[]>([]);
  creneaux = signal<string[]>([]);
  creneauxLoading = signal(false);

  step1Form: FormGroup;
  step2Form: FormGroup;
  step3Form: FormGroup;

  constructor(private rdvService: RendezVousService, private fb: FormBuilder) {
    this.step1Form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      dateNaissance: [''],
      telephone: ['', Validators.required],
      email: [''],
    });

    this.step2Form = this.fb.group({
      medecinId: ['', Validators.required],
      motif: ['', Validators.required],
      niveauUrgence: ['faible'],
    });

    this.step3Form = this.fb.group({
      date: ['', Validators.required],
      heure: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.rdvService.getPublicMedecins().subscribe({
      next: (list) => this.medecins.set(list),
    });
  }

  goStep(s: Step): void {
    this.step.set(s);
  }

  onDateChange(): void {
    const { medecinId } = this.step2Form.value;
    const { date } = this.step3Form.value;
    if (!medecinId || !date) return;

    this.creneauxLoading.set(true);
    this.step3Form.patchValue({ heure: '' });
    this.rdvService.getPublicCreneaux(medecinId, date).subscribe({
      next: (list) => {
        this.creneaux.set(list);
        this.creneauxLoading.set(false);
      },
      error: () => this.creneauxLoading.set(false),
    });
  }

  confirm(): void {
    this.loading.set(true);
    this.errorMsg.set('');

    const payload: PublicRdvPayload = {
      ...this.step1Form.value,
      ...this.step2Form.value,
      ...this.step3Form.value,
    };

    this.rdvService.createPublicRdv(payload).subscribe({
      next: (res) => {
        this.reference.set(res.reference);
        this.loading.set(false);
        this.step.set(4);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Une erreur est survenue');
      },
    });
  }

  get selectedMedecin() {
    return this.medecins().find((m) => m._id === this.step2Form.value.medecinId);
  }

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
