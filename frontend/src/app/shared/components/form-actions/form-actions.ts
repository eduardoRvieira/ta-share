import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-form-actions',
  template: `
    <div class="flex flex-col sm:flex-row-reverse items-stretch sm:items-center justify-start gap-2.5 pt-2">
      <button type="submit" [disabled]="desabilitado()"
        class="btn-primary w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer">
        {{ textoSalvar() }}
      </button>
      <button type="button" (click)="cancelar.emit()"
        class="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg border border-app bg-app text-xs font-bold text-main hover:opacity-80 transition-opacity cursor-pointer">
        {{ textoCancelar() }}
      </button>
    </div>
  `
})
export class FormActions {
  readonly desabilitado = input(false);
  readonly textoSalvar = input('Salvar');
  readonly textoCancelar = input('Cancelar');
  readonly cancelar = output<void>();
}