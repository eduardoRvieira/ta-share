import { Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EquipamentoResponse } from '../../../models/equipamento.model';
import { CategoriaResponse } from '../../../models/categoria.model';
import { Modal } from '../../../shared/components/modal/modal';
import { FormActions } from '../../../shared/components/form-actions/form-actions';

export interface EquipamentoFormPayload {
  nome: string;
  patrimonio: string;
  categoriaId: number;
  estadoConservacao: string;
  statusItem: string;
  descricao: string | null;
}

@Component({
  selector: 'app-equipamento-modal',
  imports: [FormsModule, Modal, FormActions],
  templateUrl: './equipamento-modal.html'
})
export class EquipamentoModal {
  readonly aberto = input(false);
  readonly equipamentoEmEdicao = input<EquipamentoResponse | null>(null);
  readonly categorias = input<CategoriaResponse[]>([]);

  readonly fechar = output<void>();
  readonly salvarFormulario = output<{ id: number | null; payload: EquipamentoFormPayload }>();

  nome = '';
  patrimonio = '';
  categoriaId: number | '' = '';
  estadoConservacao = 'BOM';
  statusItem = 'DISPONIVEL';
  descricao = '';

  constructor() {
    effect(() => {
      if (!this.aberto()) return;
      const eq = this.equipamentoEmEdicao();

      if (!eq) {
        this.nome = '';
        this.patrimonio = '';
        this.categoriaId = '';
        this.estadoConservacao = 'BOM';
        this.statusItem = 'DISPONIVEL';
        this.descricao = '';
        return;
      }

      this.nome = eq.nome;
      this.patrimonio = eq.patrimonio;
      this.categoriaId = eq.categoriaId;
      this.estadoConservacao = eq.estadoConservacao;
      this.statusItem = eq.statusItem;
      this.descricao = eq.descricao ?? '';
    });
  }

  aoSubmeter(): void {
    if (!this.nome.trim() || !this.patrimonio.trim() || !this.categoriaId || !this.estadoConservacao.trim()) {
      return;
    }

    this.salvarFormulario.emit({
      id: this.equipamentoEmEdicao()?.id ?? null,
      payload: {
        nome: this.nome.trim(),
        patrimonio: this.patrimonio.trim(),
        categoriaId: Number(this.categoriaId),
        estadoConservacao: this.estadoConservacao.trim(),
        statusItem: this.statusItem,
        descricao: this.descricao.trim() || null
      }
    });
  }
}