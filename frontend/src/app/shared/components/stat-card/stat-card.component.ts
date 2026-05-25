import { Component, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NgClass, NgIf],
  template: `
    <div class="card flex items-start gap-4">
      <div
        class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        [ngClass]="iconBg"
      >
        {{ icon }}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm text-gray-500 font-medium truncate">{{ label }}</p>
        <p class="text-2xl font-bold text-gray-900 mt-0.5">{{ value }}</p>
        <p *ngIf="subtitle" class="text-xs text-gray-400 mt-0.5">{{ subtitle }}</p>
      </div>
    </div>
  `,
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() icon = '';
  @Input() iconBg = 'bg-primary-100';
  @Input() subtitle = '';
}
