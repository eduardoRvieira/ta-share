import { Component, computed, effect, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmprestimoResponse } from '../../../models/emprestimo.model';
import { UsuarioResponse } from '../../../models/usuario.model';
import { EquipamentoResponse } from '../../../models/equipamento.model';
import { AuthService } from '../../../services/auth.service';
import { RegistroLocalService } from '../../../services/registro-local.service';
import { Modal } from '../../../shared/components/modal/modal';
import { FormActions } from '../../../shared/components/form-actions/form-actions';

export interface EmprestimoFormPayload {
  usuarioId: number;
  equipamentoId: number;
  dataEmprestimo: string | null;
  dataDevolucaoPrevista: string;
  dataDevolucaoReal: string | null;
  status: string;
  observacoes: string | null;
}

@Component({
  selector: 'app-emprestimo-modal',
  imports: [FormsModule, Modal, FormActions],
  templateUrl: './emprestimo-modal.html'
})
export class EmprestimoModal {
  protected readonly auth = inject(AuthService);
  private readonly registroLocal = inject(RegistroLocalService);

  readonly aberto = input(false);
  readonly emprestimoEmEdicao = input<EmprestimoResponse | null>(null);
  readonly usuarios = input<UsuarioResponse[]>([]);
  readonly equipamentos = input<EquipamentoResponse[]>([]);

  readonly fechar = output<void>();
  readonly salvarFormulario = output<{ id: number | null; payload: EmprestimoFormPayload }>();

  usuarioId: number | '' = '';
  equipamentoId: number | '' = '';
  dataEmprestimo = '';
  dataDevolucaoPrevista = '';
  status = 'ATIVO';
  observacoes = '';

  protected readonly usuariosElegiveis = computed(() => {
    const idLogado = this.auth.usuario()?.id;
    return this.usuarios().filter(
      (u) => u.perfil !== 'PROFISSIONAL' && u.id !== idLogado
    );
  });

  protected readonly equipamentosDisponiveis = computed(() => {
    const emp = this.emprestimoEmEdicao();
    const apenasDoCriador = !this.auth.ehAdmin();

    return this.equipamentos().filter((eq) => {
      if (emp !== null && eq.id === emp.equipamentoId) return true;
      if (eq.statusItem !== 'DISPONIVEL') return false;
      if (apenasDoCriador && !this.registroLocal.ehDonoEquipamento(eq.id)) return false;
      return true;
    });
  });

  constructor() {
    effect(() => {
      if (!this.aberto()) return;
      const emp = this.emprestimoEmEdicao();

      if (!emp) {
        const hoje = new Date();
        const prevista = new Date();
        prevista.setDate(hoje.getDate() + 30);

        this.usuarioId = '';
        this.equipamentoId = '';
        this.dataEmprestimo = hoje.toISOString().split('T')[0];
        this.dataDevolucaoPrevista = prevista.toISOString().split('T')[0];
        this.status = 'ATIVO';
        this.observacoes = '';
        return;
      }

      this.usuarioId = emp.usuarioId;
      this.equipamentoId = emp.equipamentoId;
      this.dataEmprestimo = emp.dataEmprestimo ?? '';
      this.dataDevolucaoPrevista = emp.dataDevolucaoPrevista;
      this.status = emp.status;
      this.observacoes = emp.observacoes ?? '';
    });
  }

  aoSubmeter(): void {
    if (!this.usuarioId || !this.equipamentoId || !this.dataEmprestimo || !this.dataDevolucaoPrevista || !this.status) {
      return;
    }

    const emp = this.emprestimoEmEdicao();
    this.salvarFormulario.emit({
      id: emp?.id ?? null,
      payload: {
        usuarioId: Number(this.usuarioId),
        equipamentoId: Number(this.equipamentoId),
        dataEmprestimo: this.dataEmprestimo || null,
        dataDevolucaoPrevista: this.dataDevolucaoPrevista,
        dataDevolucaoReal: emp?.dataDevolucaoReal ?? null,
        status: this.status,
        observacoes: this.observacoes.trim() || null
      }
    });
  }
}