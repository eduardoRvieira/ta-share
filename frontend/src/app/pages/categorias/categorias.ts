import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../services/categoria.service';
import { EquipamentoService } from '../../services/equipamento.service';
import { CategoriaResponse } from '../../models/categoria.model';
import { EquipamentoResponse } from '../../models/equipamento.model';

@Component({
  selector: 'app-categorias',
  imports: [FormsModule],
  templateUrl: './categorias.html'
})
export class Categorias implements OnInit {
  private readonly categoriaService = inject(CategoriaService);
  private readonly equipamentoService = inject(EquipamentoService);

  protected readonly categorias = signal<CategoriaResponse[]>([]);
  protected readonly equipamentos = signal<EquipamentoResponse[]>([]);
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);

  // Controle do modal
  protected readonly modalAberto = signal(false);
  protected readonly editandoId = signal<number | null>(null);

  // Mapa reativo com a contagem de equipamentos por categoriaId
  protected readonly contagemPorCategoria = computed(() => {
    const mapa: Record<number, number> = {};
    for (const eq of this.equipamentos()) {
      mapa[eq.categoriaId] = (mapa[eq.categoriaId] || 0) + 1;
    }
    return mapa;
  });

  nome = '';
  descricao = '';

  ngOnInit(): void {
    this.carregarCategorias();
    this.carregarEquipamentos();
  }

  carregarCategorias(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.categoriaService.listar().subscribe({
      next: (dados) => {
        this.categorias.set(dados);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar as categorias. Verifique se o backend está rodando.');
        this.carregando.set(false);
      }
    });
  }

  carregarEquipamentos(): void {
    this.equipamentoService.listar().subscribe({
      next: (dados) => this.equipamentos.set(dados),
      error: () => {
        // Falha silenciosa apenas na contagem auxiliar
      }
    });
  }

  abrirNova(): void {
    this.limparFormulario();
    this.modalAberto.set(true);
  }

  iniciarEdicao(categoria: CategoriaResponse): void {
    this.editandoId.set(categoria.id);
    this.nome = categoria.nome;
    this.descricao = categoria.descricao ?? '';
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
    this.descricao = '';
  }

  salvar(): void {
    if (!this.nome.trim()) return;

    this.erro.set(null);
    const payload = {
      nome: this.nome.trim(),
      descricao: this.descricao.trim() || null
    };

    const idAtual = this.editandoId();

    if (idAtual !== null) {
      this.categoriaService.atualizar(idAtual, payload).subscribe({
        next: () => {
          this.cancelarEdicao();
          this.carregarCategorias();
        },
        error: (err) => {
          this.erro.set(err?.error?.message || 'Erro ao atualizar categoria.');
        }
      });
      return;
    }

    this.categoriaService.criar(payload).subscribe({
      next: () => {
        this.cancelarEdicao();
        this.carregarCategorias();
      },
      error: (err) => {
        this.erro.set(err?.error?.message || 'Erro ao cadastrar categoria.');
      }
    });
  }

  excluir(id: number): void {
    if (!confirm('Deseja realmente excluir esta categoria?')) return;

    this.erro.set(null);
    this.categoriaService.deletar(id).subscribe({
      next: () => {
        if (this.editandoId() === id) {
          this.cancelarEdicao();
        }
        this.carregarCategorias();
      },
      error: (err) => {
        this.erro.set(err?.error?.message || 'Erro ao excluir categoria.');
      }
    });
  }
}