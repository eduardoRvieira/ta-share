import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.html'
})
export class StatusBadge {
  readonly tipo = input.required<'status-equipamento' | 'conservacao' | 'emprestimo' | 'perfil'>();
  readonly valor = input.required<string>();
  readonly compacto = input(false);
}