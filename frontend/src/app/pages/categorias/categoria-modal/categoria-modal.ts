import { Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriaResponse } from '../../../models/categoria.model';
import { Modal } from '../../../shared/components/modal/modal';
import { FormActions } from '../../../shared/components/form-actions/form-actions';

export interface CategoriaFormPayload {
  nome: string;
  descricao: string | null;
}

@Component({
  selector: 'app-categoria-modal',
  imports: [FormsModule, Modal, FormActions],
  templateUrl: './categoria-modal.html'
})
export class CategoriaModal {
  readonly aberto = input(false);
  readonly categoriaEmEdicao = input<CategoriaResponse | null>(null);

  readonly fechar = output<void>();
  readonly salvarFormulario = output<{ id: number | null; payload: CategoriaFormPayload }>();

  nome = '';
  descricao = '';

  constructor() {
    effect(() => {
      if (!this.aberto()) return;
      const cat = this.categoriaEmEdicao();

      if (!cat) {
        this.nome = '';
        this.descricao = '';
        return;
      }

      this.nome = cat.nome;
      this.descricao = cat.descricao ?? '';
    });
  }

  aoSubmeter(): void {
    if (!this.nome.trim()) return;

    this.salvarFormulario.emit({
      id: this.categoriaEmEdicao()?.id ?? null,
      payload: {
        nome: this.nome.trim(),
        descricao: this.descricao.trim() || null
      }
    });
  }
}