import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { EmprestimoService } from '../../services/emprestimo.service';
import { UsuarioService } from '../../services/usuario.service';
import { EquipamentoService } from '../../services/equipamento.service';
import { EmprestimoResponse } from '../../models/emprestimo.model';
import { UsuarioResponse } from '../../models/usuario.model';
import { EquipamentoResponse } from '../../models/equipamento.model';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { ActionMenu } from '../../shared/components/action-menu/action-menu';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { SearchInput } from '../../shared/components/search-input/search-input';
import { EmprestimoFormPayload, EmprestimoModal } from './emprestimo-modal/emprestimo-modal';
import { correspondeBusca } from '../../shared/utils/busca';
import { extrairMensagemErro } from '../../shared/utils/http-erro';
import { formatarDataIso, isEmprestimoConcluido } from '../../shared/utils/formatadores';
import { ConfirmModal } from '../../shared/components/confirm-modal/confirm-modal';

type FiltroSituacao = 'TODOS' | 'ATIVO' | 'ATRASADO' | 'CONCLUIDO';

@Component({
  selector: 'app-emprestimos',
  imports: [PageHeader, ActionMenu, StatusBadge, SearchInput, EmprestimoModal, ConfirmModal],
  templateUrl: './emprestimos.html'
})
export class Emprestimos implements OnInit {
  private readonly emprestimoService = inject(EmprestimoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly equipamentoService = inject(EquipamentoService);

  protected readonly emprestimos = signal<EmprestimoResponse[]>([]);
  protected readonly usuarios = signal<UsuarioResponse[]>([]);
  protected readonly equipamentos = signal<EquipamentoResponse[]>([]);
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly modalAberto = signal(false);
  protected readonly emprestimoEmEdicao = signal<EmprestimoResponse | null>(null);
  protected readonly emprestimoParaExcluir = signal<EmprestimoResponse | null>(null);

  protected readonly filtroSituacao = signal<FiltroSituacao>('TODOS');
  protected readonly filtroBusca = signal('');

  protected readonly formatarData = formatarDataIso;
  protected readonly isConcluido = isEmprestimoConcluido;

  protected readonly opcoesFiltro = computed(() => {
    const lista = this.emprestimos();
    return [
      { valor: 'TODOS' as const, rotulo: 'Todos', qtd: lista.length },
      { valor: 'ATIVO' as const, rotulo: 'Ativos', qtd: lista.filter((e) => e.status === 'ATIVO').length },
      { valor: 'ATRASADO' as const, rotulo: 'Atrasados', qtd: lista.filter((e) => e.status === 'ATRASADO').length },
      { valor: 'CONCLUIDO' as const, rotulo: 'Concluídos', qtd: lista.filter((e) => isEmprestimoConcluido(e.status)).length }
    ];
  });

  protected readonly mapaEquipamentos = computed(() =>
    Object.fromEntries(this.equipamentos().map((eq) => [eq.id, eq])) as Record<number, EquipamentoResponse>
  );

  protected readonly mapaUsuarios = computed(() =>
    Object.fromEntries(this.usuarios().map((u) => [u.id, u])) as Record<number, UsuarioResponse>
  );

  protected readonly emprestimosFiltrados = computed(() => {
    const situacao = this.filtroSituacao();
    const termo = this.filtroBusca();

    return this.emprestimos().filter((emp) => {
      const bateSituacao =
        situacao === 'TODOS' ||
        (situacao === 'CONCLUIDO' ? isEmprestimoConcluido(emp.status) : emp.status === situacao);

      const patrimonio = this.mapaEquipamentos()[emp.equipamentoId]?.patrimonio;
      const emailUsuario = this.mapaUsuarios()[emp.usuarioId]?.email;
      const bateBusca = correspondeBusca(termo, emp.equipamentoNome, emp.usuarioNome, patrimonio, emailUsuario);

      return bateSituacao && bateBusca;
    });
  });

  ngOnInit(): void {
    this.carregarOpcoes();
    this.carregarEmprestimos();
  }

  carregarOpcoes(): void {
    this.usuarioService.listar().subscribe({
      next: (dados) => this.usuarios.set(dados),
      error: () => this.erro.set('Não foi possível carregar os usuários para o formulário.')
    });

    this.equipamentoService.listar().subscribe({
      next: (dados) => this.equipamentos.set(dados),
      error: () => this.erro.set('Não foi possível carregar os equipamentos para o formulário.')
    });
  }

  carregarEmprestimos(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.emprestimoService.listar().subscribe({
      next: (dados) => {
        this.emprestimos.set(dados);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os empréstimos.');
        this.carregando.set(false);
      }
    });
  }

  abrirNovo(): void {
    this.emprestimoEmEdicao.set(null);
    this.erro.set(null);
    this.modalAberto.set(true);
  }

  iniciarEdicao(emprestimo: EmprestimoResponse): void {
    this.emprestimoEmEdicao.set(emprestimo);
    this.erro.set(null);
    this.modalAberto.set(true);
  }

  fecharModal(): void {
    this.emprestimoEmEdicao.set(null);
    this.modalAberto.set(false);
  }

  salvar({ id, payload }: { id: number | null; payload: EmprestimoFormPayload }): void {
    this.erro.set(null);
    const requisicao = id !== null
      ? this.emprestimoService.atualizar(id, payload)
      : this.emprestimoService.criar(payload);

    requisicao.subscribe({
      next: () => {
        this.fecharModal();
        this.carregarEmprestimos();
        this.carregarOpcoes();
      },
      error: (err) => {
        const fallback = id !== null ? 'Erro ao atualizar empréstimo.' : 'Erro ao registrar empréstimo.';
        this.erro.set(extrairMensagemErro(err, fallback));
      }
    });
  }

  devolver(emprestimo: EmprestimoResponse): void {
    this.erro.set(null);
    const hoje = new Date().toISOString().split('T')[0];

    this.emprestimoService.atualizar(emprestimo.id, {
      usuarioId: emprestimo.usuarioId,
      equipamentoId: emprestimo.equipamentoId,
      dataEmprestimo: emprestimo.dataEmprestimo,
      dataDevolucaoPrevista: emprestimo.dataDevolucaoPrevista,
      dataDevolucaoReal: emprestimo.dataDevolucaoReal || hoje,
      status: 'DEVOLVIDO',
      observacoes: emprestimo.observacoes
    }).subscribe({
      next: () => {
        if (this.emprestimoEmEdicao()?.id === emprestimo.id) {
          this.fecharModal();
        }
        this.carregarEmprestimos();
        this.carregarOpcoes();
      },
      error: (err) => {
        this.erro.set(extrairMensagemErro(err, 'Erro ao registrar devolução do empréstimo.'));
      }
    });
  }

  solicitarExclusao(emprestimo: EmprestimoResponse): void {
    this.erro.set(null);
    this.emprestimoParaExcluir.set(emprestimo);
  }

  cancelarExclusao(): void {
    this.emprestimoParaExcluir.set(null);
  }

  confirmarExclusao(): void {
    const alvo = this.emprestimoParaExcluir();
    if (!alvo) return;

    this.emprestimoParaExcluir.set(null);
    this.erro.set(null);

    this.emprestimoService.deletar(alvo.id).subscribe({
      next: () => {
        if (this.emprestimoEmEdicao()?.id === alvo.id) {
          this.fecharModal();
        }
        this.carregarEmprestimos();
        this.carregarOpcoes();
      },
      error: (err) => {
        this.erro.set(extrairMensagemErro(err, 'Erro ao excluir empréstimo.'));
      }
    });
  }
}