import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  imports: [FormsModule],
  template: `
    <div>
      <label [for]="inputId()" class="block text-xs font-bold text-main mb-1.5">
        {{ label() }}
      </label>
      <div class="relative">
        <svg class="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
        <input
          [id]="inputId()"
          type="text"
          [ngModel]="valor()"
          (ngModelChange)="valor.set($event)"
          [placeholder]="placeholder()"
          class="input-app w-full rounded-lg pl-10 pr-3.5 py-2 text-sm transition-colors">
      </div>
    </div>
  `
})
export class SearchInput {
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly placeholder = input('Buscar...');
  readonly valor = model('');
}