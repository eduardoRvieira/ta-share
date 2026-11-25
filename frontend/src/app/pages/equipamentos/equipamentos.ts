import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EquipamentoService } from '../../services/equipamento.service';
import { CategoriaService } from '../../services/categoria.service';
import { EquipamentoResponse } from '../../models/equipamento.model';
import { CategoriaResponse } from '../../models/categoria.model';

@Component({
  selector: 'app-equipamentos',
  imports: [FormsModule],
  templateUrl: './equipamentos.html'
})

export class Equipamentos implements OnInit {
  private readonly equipamentoService = inject(EquipamentoService);
  private readonly categoriaService = inject(CategoriaService);

  protected readonly equipamentos = signal<EquipamentoResponse[]>([]);
  protected readonly categorias = signal<CategoriaResponse[]>([]);
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);

  // Controle do modal de formulário e menu de ações da linha
  protected readonly modalAberto = signal(false);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly menuAbertoId = signal<number | null>(null);

  // Filtros da listagem
  protected readonly filtroBusca = signal('');
  protected readonly filtroCategoria = signal('');
  protected readonly filtroStatus = signal('');
  protected readonly filtroConservacao = signal('');

  // Lista filtrada reativa
  protected readonly equipamentosFiltrados = computed(() => {
    const termo = this.filtroBusca().toLowerCase().trim();
    const catId = this.filtroCategoria();
    const status = this.filtroStatus();
    const conservacao = this.filtroConservacao();

    return this.equipamentos().filter((eq) => {
      const bateBusca =
        !termo ||
        eq.nome.toLowerCase().includes(termo) ||
        eq.patrimonio.toLowerCase().includes(termo) ||
        (eq.descricao && eq.descricao.toLowerCase().includes(termo));

      const bateCategoria = !catId || String(eq.categoriaId) === catId;
      const bateStatus = !status || eq.statusItem === status;
      const bateConservacao = !conservacao || eq.estadoConservacao === conservacao;

      return bateBusca && bateCategoria && bateStatus && bateConservacao;
    });
  });

  // Campos do formulário
  nome = '';
  patrimonio = '';
  categoriaId: number | '' = '';
  estadoConservacao = 'BOM';
  statusItem = 'DISPONIVEL';
  descricao = '';

  ngOnInit(): void {
    this.carregarCategorias();
    this.carregarEquipamentos();
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
    this.limparFormulario();
    this.modalAberto.set(true);
  }

  iniciarEdicao(equipamento: EquipamentoResponse): void {
    this.menuAbertoId.set(null);
    this.editandoId.set(equipamento.id);
    this.nome = equipamento.nome;
    this.patrimonio = equipamento.patrimonio;
    this.categoriaId = equipamento.categoriaId;
    this.estadoConservacao = equipamento.estadoConservacao;
    this.statusItem = equipamento.statusItem;
    this.descricao = equipamento.descricao ?? '';
    this.erro.set(null);
    this.modalAberto.set(true);
  }

  cancelarEdicao(): void {
    this.limparFormulario();
    this.modalAberto.set(false);
  }

  private limparFormulario(): void {
    this.editandoId.set(null);
    this.nome = '';
    this.patrimonio = '';
    this.categoriaId = '';
    this.estadoConservacao = 'BOM';
    this.statusItem = 'DISPONIVEL';
    this.descricao = '';
  }

  alternarMenuLinha(id: number): void {
    this.menuAbertoId.update((atual) => (atual === id ? null : id));
  }

  salvar(): void {
    if (!this.nome.trim() || !this.patrimonio.trim() || !this.categoriaId || !this.estadoConservacao.trim()) {
      return;
    }

    this.erro.set(null);
    const payload = {
      nome: this.nome.trim(),
      patrimonio: this.patrimonio.trim(),
      categoriaId: Number(this.categoriaId),
      estadoConservacao: this.estadoConservacao.trim(),
      statusItem: this.statusItem,
      descricao: this.descricao.trim() || null
    };

    const idAtual = this.editandoId();

    if (idAtual !== null) {
      this.equipamentoService.atualizar(idAtual, payload).subscribe({
        next: () => {
          this.cancelarEdicao();
          this.carregarEquipamentos();
        },
        error: (err) => {
          this.erro.set(err?.error?.message || 'Erro ao atualizar equipamento.');
        }
      });
      return;
    }

    this.equipamentoService.criar(payload).subscribe({
      next: () => {
        this.cancelarEdicao();
        this.carregarEquipamentos();
      },
      error: (err) => {
        this.erro.set(err?.error?.message || 'Erro ao cadastrar equipamento.');
      }
    });
  }

  excluir(id: number): void {
    this.menuAbertoId.set(null);
    if (!confirm('Deseja realmente excluir este equipamento?')) return;

    this.erro.set(null);
    this.equipamentoService.deletar(id).subscribe({
      next: () => {
        if (this.editandoId() === id) {
          this.cancelarEdicao();
        }
        this.carregarEquipamentos();
      },
      error: (err) => {
        this.erro.set(err?.error?.message || 'Erro ao excluir equipamento.');
      }
    });
  }

  rotuloConservacao(valor: string): string {
    const mapa: Record<string, string> = {
      NOVO: 'Novo',
      BOM: 'Bom',
      NECESSITA_MANUTENCAO: 'Necessita manutenção'
    };
    return mapa[valor] || valor;
  }

  rotuloStatus(valor: string): string {
    const mapa: Record<string, string> = {
      DISPONIVEL: 'Disponível',
      EMPRESTADO: 'Emprestado',
      MANUTENCAO: 'Manutenção'
    };
    return mapa[valor] || valor;
  }
}