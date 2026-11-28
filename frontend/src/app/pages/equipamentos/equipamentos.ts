import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EquipamentoService } from '../../services/equipamento.service';
import { CategoriaService } from '../../services/categoria.service';
import { EmprestimoService } from '../../services/emprestimo.service';
import { RegistroLocalService } from '../../services/registro-local.service';
import { EquipamentoResponse } from '../../models/equipamento.model';
import { CategoriaResponse } from '../../models/categoria.model';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { ActionMenu } from '../../shared/components/action-menu/action-menu';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { SearchInput } from '../../shared/components/search-input/search-input';
import { EquipamentoFormPayload, EquipamentoModal } from './equipamento-modal/equipamento-modal';
import { ConfirmModal } from '../../shared/components/confirm-modal/confirm-modal';
import { correspondeBusca } from '../../shared/utils/busca';
import { extrairMensagemErro } from '../../shared/utils/http-erro';

@Component({
  selector: 'app-equipamentos',
  imports: [FormsModule, PageHeader, ActionMenu, StatusBadge, SearchInput, EquipamentoModal, ConfirmModal],
  templateUrl: './equipamentos.html'
})
export class Equipamentos implements OnInit {
  private readonly equipamentoService = inject(EquipamentoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly emprestimoService = inject(EmprestimoService);
  protected readonly registroLocal = inject(RegistroLocalService);

  protected readonly equipamentos = signal<EquipamentoResponse[]>([]);
  protected readonly categorias = signal<CategoriaResponse[]>([]);
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly modalAberto = signal(false);
  protected readonly equipamentoEmEdicao = signal<EquipamentoResponse | null>(null);
  protected readonly equipamentoParaExcluir = signal<EquipamentoResponse | null>(null);

  protected readonly filtroBusca = signal('');
  protected readonly filtroCategoria = signal('');
  protected readonly filtroStatus = signal('');
  protected readonly filtroConservacao = signal('');

  protected readonly equipamentosFiltrados = computed(() => {
    const termo = this.filtroBusca();
    const catId = this.filtroCategoria();
    const status = this.filtroStatus();
    const conservacao = this.filtroConservacao();

    return this.equipamentos().filter((eq) => {
      const bateBusca = correspondeBusca(termo, eq.nome, eq.patrimonio, eq.descricao);
      const bateCategoria = !catId || String(eq.categoriaId) === catId;
      const bateStatus = !status || eq.statusItem === status;
      const bateConservacao = !conservacao || eq.estadoConservacao === conservacao;

      return bateBusca && bateCategoria && bateStatus && bateConservacao;
    });
  });

  ngOnInit(): void {
    this.carregarCategorias();
    this.carregarEquipamentos();
  }

  podeGerenciar(equipamento: EquipamentoResponse): boolean {
    return this.registroLocal.podeGerenciarEquipamento(equipamento.id);
  }

  nomeCriador(equipamento: EquipamentoResponse): string {
    return this.registroLocal.obterNomeCriadorEquipamento(equipamento.id);
  }

  carregarCategorias(): void {
    this.categoriaService.listar().subscribe({
      next: (dados) => this.categorias.set(dados),
      error: () => this.erro.set('Não foi possível carregar as categorias para o formulário.')
    });
  }

  carregarEquipamentos(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.equipamentoService.listar().subscribe({
      next: (dados) => {
        this.equipamentos.set(dados);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os equipamentos.');
        this.carregando.set(false);
      }
    });
  }

  abrirNovo(): void {
    this.equipamentoEmEdicao.set(null);
    this.erro.set(null);
    this.modalAberto.set(true);
  }

  iniciarEdicao(equipamento: EquipamentoResponse): void {
    if (!this.podeGerenciar(equipamento)) return;
    this.equipamentoEmEdicao.set(equipamento);
    this.erro.set(null);
    this.modalAberto.set(true);
  }

  fecharModal(): void {
    this.equipamentoEmEdicao.set(null);
    this.modalAberto.set(false);
  }

  salvar({ id, payload }: { id: number | null; payload: EquipamentoFormPayload }): void {
    if (id !== null && !this.registroLocal.podeGerenciarEquipamento(id)) {
      this.erro.set('Você só pode editar equipamentos cadastrados por você.');
      return;
    }

    this.erro.set(null);
    const requisicao = id !== null
      ? this.equipamentoService.atualizar(id, payload)
      : this.equipamentoService.criar(payload);

    requisicao.subscribe({
      next: (resposta) => {
        if (id === null && resposta?.id) {
          this.registroLocal.registrarDonoEquipamento(resposta.id);
        }
        this.fecharModal();
        this.carregarEquipamentos();
      },
      error: (err) => {
        const fallback = id !== null ? 'Erro ao atualizar equipamento.' : 'Erro ao cadastrar equipamento.';
        this.erro.set(extrairMensagemErro(err, fallback));
      }
    });
  }

  solicitarExclusao(equipamento: EquipamentoResponse): void {
    if (!this.podeGerenciar(equipamento)) return;
    this.erro.set(null);

    if (equipamento.statusItem === 'EMPRESTADO') {
      this.erro.set('Não é possível excluir este equipamento porque ele está emprestado no momento.');
      return;
    }

    this.emprestimoService.listar().subscribe({
      next: (emprestimos) => {
        const possuiVinculo = emprestimos.some((emp) => emp.equipamentoId === equipamento.id);

        if (possuiVinculo) {
          this.erro.set(
            `Não é possível excluir o equipamento "${equipamento.nome}" porque existem empréstimos vinculados a ele.`
          );
          return;
        }

        this.equipamentoParaExcluir.set(equipamento);
      },
      error: () => {
        this.equipamentoParaExcluir.set(equipamento);
      }
    });
  }

  cancelarExclusao(): void {
    this.equipamentoParaExcluir.set(null);
  }

  confirmarExclusao(): void {
    const alvo = this.equipamentoParaExcluir();
    if (!alvo || !this.podeGerenciar(alvo)) return;

    this.equipamentoParaExcluir.set(null);
    this.erro.set(null);

    this.equipamentoService.deletar(alvo.id).subscribe({
      next: () => {
        if (this.equipamentoEmEdicao()?.id === alvo.id) {
          this.fecharModal();
        }
        this.carregarEquipamentos();
      },
      error: (err) => {
        const msgBruta = extrairMensagemErro(err, 'Erro ao excluir equipamento.');
        const ehViolacaoFk =
          msgBruta.toLowerCase().includes('foreign key constraint') ||
          msgBruta.toLowerCase().includes('fk_emprestimo_equipamento') ||
          msgBruta.toLowerCase().includes('cannot delete or update a parent row');

        this.erro.set(
          ehViolacaoFk
            ? `Não é possível excluir o equipamento "${alvo.nome}" porque existem empréstimos vinculados a ele.`
            : msgBruta
        );
      }
    });
  }
}