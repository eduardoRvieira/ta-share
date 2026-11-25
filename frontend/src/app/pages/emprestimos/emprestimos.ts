import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmprestimoService } from '../../services/emprestimo.service';
import { UsuarioService } from '../../services/usuario.service';
import { EquipamentoService } from '../../services/equipamento.service';
import { EmprestimoResponse } from '../../models/emprestimo.model';
import { UsuarioResponse } from '../../models/usuario.model';
import { EquipamentoResponse } from '../../models/equipamento.model';

@Component({
  selector: 'app-emprestimos',
  imports: [FormsModule],
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

  // Controle do modal e menu de ações da linha
  protected readonly modalAberto = signal(false);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly menuAbertoId = signal<number | null>(null);

  // Filtros da listagem
  protected readonly filtroSituacao = signal<'TODOS' | 'ATIVO' | 'ATRASADO' | 'CONCLUIDO'>('TODOS');
  protected readonly filtroBusca = signal('');

  // Mapas auxiliares para exibir patrimônio e e-mail na tabela
  protected readonly mapaEquipamentos = computed(() => {
    const mapa: Record<number, EquipamentoResponse> = {};
    for (const eq of this.equipamentos()) {
      mapa[eq.id] = eq;
    }
    return mapa;
  });

  protected readonly mapaUsuarios = computed(() => {
    const mapa: Record<number, UsuarioResponse> = {};
    for (const u of this.usuarios()) {
      mapa[u.id] = u;
    }
    return mapa;
  });

  // Equipamentos disponíveis para o select de novo empréstimo
  protected readonly equipamentosDisponiveis = computed(() => {
    const idEditando = this.editandoId();
    return this.equipamentos().filter(
      (eq) => eq.statusItem === 'DISPONIVEL' || (idEditando !== null && eq.id === Number(this.equipamentoId))
    );
  });

  // Contadores para os botões de filtro
  protected readonly contadores = computed(() => {
    const lista = this.emprestimos();
    return {
      todos: lista.length,
      ativos: lista.filter((e) => e.status === 'ATIVO').length,
      atrasados: lista.filter((e) => e.status === 'ATRASADO').length,
      concluidos: lista.filter((e) => e.status === 'DEVOLVIDO' || e.status === 'CONCLUIDO').length
    };
  });

  // Lista filtrada reativa
  protected readonly emprestimosFiltrados = computed(() => {
    const situacao = this.filtroSituacao();
    const termo = this.filtroBusca().toLowerCase().trim();

    return this.emprestimos().filter((emp) => {
      const bateSituacao =
        situacao === 'TODOS' ||
        (situacao === 'CONCLUIDO'
          ? emp.status === 'DEVOLVIDO' || emp.status === 'CONCLUIDO'
          : emp.status === situacao);

      const patrimonio = this.mapaEquipamentos()[emp.equipamentoId]?.patrimonio?.toLowerCase() ?? '';
      const emailUsuario = this.mapaUsuarios()[emp.usuarioId]?.email?.toLowerCase() ?? '';

      const bateBusca =
        !termo ||
        emp.equipamentoNome.toLowerCase().includes(termo) ||
        emp.usuarioNome.toLowerCase().includes(termo) ||
        patrimonio.includes(termo) ||
        emailUsuario.includes(termo);

      return bateSituacao && bateBusca;
    });
  });

  // Campos do formulário
  usuarioId: number | '' = '';
  equipamentoId: number | '' = '';
  dataEmprestimo = '';
  dataDevolucaoPrevista = '';
  status = 'ATIVO';
  observacoes = '';

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
    this.limparFormulario();
    const hoje = new Date();
    const prevista = new Date();
    prevista.setDate(hoje.getDate() + 30);

    this.dataEmprestimo = hoje.toISOString().split('T')[0];
    this.dataDevolucaoPrevista = prevista.toISOString().split('T')[0];
    this.modalAberto.set(true);
  }

  iniciarEdicao(emprestimo: EmprestimoResponse): void {
    this.menuAbertoId.set(null);
    this.editandoId.set(emprestimo.id);
    this.usuarioId = emprestimo.usuarioId;
    this.equipamentoId = emprestimo.equipamentoId;
    this.dataEmprestimo = emprestimo.dataEmprestimo ?? '';
    this.dataDevolucaoPrevista = emprestimo.dataDevolucaoPrevista;
    this.status = emprestimo.status;
    this.observacoes = emprestimo.observacoes ?? '';
    this.erro.set(null);
    this.modalAberto.set(true);
  }

  cancelarEdicao(): void {
    this.limparFormulario();
    this.modalAberto.set(false);
  }

  private limparFormulario(): void {
    this.editandoId.set(null);
    this.usuarioId = '';
    this.equipamentoId = '';
    this.dataEmprestimo = '';
    this.dataDevolucaoPrevista = '';
    this.status = 'ATIVO';
    this.observacoes = '';
  }

  alternarMenuLinha(id: number): void {
    this.menuAbertoId.update((atual) => (atual === id ? null : id));
  }

  salvar(): void {
    if (!this.usuarioId || !this.equipamentoId || !this.dataEmprestimo || !this.dataDevolucaoPrevista || !this.status) {
      return;
    }

    this.erro.set(null);
    const payload = {
      usuarioId: Number(this.usuarioId),
      equipamentoId: Number(this.equipamentoId),
      dataEmprestimo: this.dataEmprestimo || null,
      dataDevolucaoPrevista: this.dataDevolucaoPrevista,
      dataDevolucaoReal: null,
      status: this.status,
      observacoes: this.observacoes.trim() || null
    };

    const idAtual = this.editandoId();

    if (idAtual !== null) {
      this.emprestimoService.atualizar(idAtual, payload).subscribe({
        next: () => {
          this.cancelarEdicao();
          this.carregarEmprestimos();
          this.carregarOpcoes();
        },
        error: (err) => {
          this.erro.set(err?.error?.message || 'Erro ao atualizar empréstimo.');
        }
      });
      return;
    }

    this.emprestimoService.criar(payload).subscribe({
      next: () => {
        this.cancelarEdicao();
        this.carregarEmprestimos();
        this.carregarOpcoes();
      },
      error: (err) => {
        this.erro.set(err?.error?.message || 'Erro ao registrar empréstimo.');
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
        if (this.editandoId() === emprestimo.id) {
          this.cancelarEdicao();
        }
        this.carregarEmprestimos();
        this.carregarOpcoes();
      },
      error: (err) => {
        this.erro.set(err?.error?.message || 'Erro ao registrar devolução do empréstimo.');
      }
    });
  }

  excluir(id: number): void {
    this.menuAbertoId.set(null);
    if (!confirm('Deseja realmente excluir este empréstimo?')) return;

    this.erro.set(null);
    this.emprestimoService.deletar(id).subscribe({
      next: () => {
        if (this.editandoId() === id) {
          this.cancelarEdicao();
        }
        this.carregarEmprestimos();
        this.carregarOpcoes();
      },
      error: (err) => {
        this.erro.set(err?.error?.message || 'Erro ao excluir empréstimo.');
      }
    });
  }

  formatarData(dataIso: string | null | undefined): string {
    if (!dataIso) return '—';
    const partes = dataIso.split('T')[0].split('-');
    if (partes.length !== 3) return dataIso;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  isConcluido(status: string): boolean {
    return status === 'DEVOLVIDO' || status === 'CONCLUIDO';
  }
}