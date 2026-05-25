import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="text-center">
        <div class="text-8xl mb-4">🚫</div>
        <h1 class="text-4xl font-bold text-gray-900 mb-2">403</h1>
        <h2 class="text-xl text-gray-600 mb-4">Accès non autorisé</h2>
        <p class="text-gray-500 mb-8 max-w-sm mx-auto">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <div class="flex gap-3 justify-center">
          <a routerLink="/login" class="btn-primary">Se reconnecter</a>
          <button onclick="history.back()" class="btn-secondary">← Retour</button>
        </div>
      </div>
    </div>
  `,
})
export class ForbiddenComponent {}
