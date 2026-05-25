import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-rdv-status-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span
      [ngClass]="{
        'bg-yellow-100 text-yellow-800': statut === 'en attente',
        'bg-blue-100 text-blue-800': statut === 'confirmé',
        'bg-gray-100 text-gray-600': statut === 'annulé',
        'bg-green-100 text-green-800': statut === 'présent',
        'bg-red-100 text-red-700': statut === 'absent'
      }"
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    >{{ statut }}</span>
  `,
})
export class RdvStatusBadgeComponent {
  @Input() statut = '';
}
