import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { StatutPatient } from '../../../core/models/patient.model';

const STATUS_CONFIG: Record<StatutPatient, { label: string; css: string }> = {
  stable: { label: 'Stable', css: 'badge-stable' },
  'en observation': { label: 'En observation', css: 'badge-observation' },
  critique: { label: 'Critique', css: 'badge-critique' },
  guéri: { label: 'Guéri', css: 'badge-gueri' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span [ngClass]="config.css">{{ config.label }}</span>
  `,
})
export class StatusBadgeComponent {
  config = STATUS_CONFIG['stable'];

  @Input() set statut(value: StatutPatient) {
    this.config = STATUS_CONFIG[value] ?? { label: value, css: 'badge-stable' };
  }
}
