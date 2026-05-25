import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="text-center">
        <div class="text-8xl mb-4">🔍</div>
        <h1 class="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 class="text-xl text-gray-600 mb-4">Page introuvable</h2>
        <a routerLink="/login" class="btn-primary">Retour à l'accueil</a>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
