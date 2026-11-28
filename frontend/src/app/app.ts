import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Sidebar } from './layout/sidebar/sidebar';
import { Footer } from './layout/footer/footer';
import { ConfirmModal } from './shared/components/confirm-modal/confirm-modal';
import { Modal } from './shared/components/modal/modal';
import { AuthService } from './services/auth.service';
import { EmprestimoService } from './services/emprestimo.service';
import { EquipamentoService } from './services/equipamento.service';
import { RegistroLocalService } from './services/registro-local.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Sidebar, Footer, ConfirmModal, Modal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly auth = inject(AuthService);
  private readonly emprestimoService = inject(EmprestimoService);
  private readonly equipamentoService = inject(EquipamentoService);
  private readonly registroLocal = inject(RegistroLocalService);

  readonly pendenciaEmprestimo = computed(() => {
    if (!this.auth.estaLogado()) return null;
    return this.registroLocal.obterPendenciaParaUsuarioAtual();
  });

  confirmarAluguelPendente(): void {
    const pendencia = this.pendenciaEmprestimo();
    if (!pendencia) return;
    this.registroLocal.removerPendencia(pendencia.emprestimoId);
  }

  recusarAluguelPendente(): void {
    const pendencia = this.pendenciaEmprestimo();
    if (!pendencia) return;

    const { emprestimoId, equipamentoId } = pendencia;
    this.registroLocal.removerPendencia(emprestimoId);

    this.emprestimoService.deletar(emprestimoId).subscribe({
      next: () => this.liberarEquipamento(equipamentoId),
      error: () => this.liberarEquipamento(equipamentoId)
    });
  }

  private liberarEquipamento(equipamentoId: number): void {
    if (!equipamentoId) {
      this.recarregarSeNecessario();
      return;
    }

    this.equipamentoService.listar().subscribe({
      next: (lista) => {
        const eq = lista.find((item) => item.id === equipamentoId);
        if (!eq || eq.statusItem === 'DISPONIVEL') {
          this.recarregarSeNecessario();
          return;
        }

        this.equipamentoService.atualizar(eq.id, {
          nome: eq.nome,
          patrimonio: eq.patrimonio,
          categoriaId: eq.categoriaId,
          estadoConservacao: eq.estadoConservacao,
          statusItem: 'DISPONIVEL',
          descricao: eq.descricao
        }).subscribe({
          next: () => this.recarregarSeNecessario(),
          error: () => this.recarregarSeNecessario()
        });
      },
      error: () => this.recarregarSeNecessario()
    });
  }

  private recarregarSeNecessario(): void {
    if (typeof window === 'undefined') return;
    const rota = window.location.pathname;
    if (rota.includes('/emprestimos') || rota.includes('/equipamentos')) {
      window.location.reload();
    }
  }
}