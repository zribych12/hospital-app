import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgClass, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-medecins',
  standalone: true,
  imports: [SidebarComponent, ReactiveFormsModule, NgClass, DatePipe, RouterLink],
  templateUrl: './medecins.component.html',
})
export class MedecinsComponent implements OnInit {
  medecins = signal<User[]>([]);
  loading = signal(true);
  showModal = signal(false);
  formLoading = signal(false);
  tempPassword = signal('');
  showTempPassword = signal(false);
  errorMsg = signal('');

  form: FormGroup;

  constructor(private userService: UserService, private fb: FormBuilder) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      specialite: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.userService.getMedecins().subscribe({
      next: (data) => {
        this.medecins.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openModal(): void {
    this.form.reset();
    this.errorMsg.set('');
    this.tempPassword.set('');
    this.showTempPassword.set(false);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  createMedecin(): void {
    if (this.form.invalid || this.formLoading()) return;
    this.formLoading.set(true);
    this.errorMsg.set('');

    this.userService.createMedecin(this.form.value).subscribe({
      next: (res) => {
        this.formLoading.set(false);
        this.tempPassword.set(res.tempPassword);
        this.showTempPassword.set(true);
        this.load();
      },
      error: (err) => {
        this.formLoading.set(false);
        this.errorMsg.set(err.error?.message || 'Erreur lors de la création');
      },
    });
  }

  toggleStatus(medecin: User): void {
    this.userService.toggleStatus(medecin._id).subscribe({
      next: () => this.load(),
    });
  }

  resetPassword(medecin: User): void {
    if (!confirm(`Réinitialiser le mot de passe de Dr. ${medecin.prenom} ${medecin.nom} ?`)) return;
    this.userService.resetPassword(medecin._id).subscribe({
      next: (res) => {
        alert(`Nouveau mot de passe temporaire : ${res.tempPassword}`);
      },
    });
  }
}
