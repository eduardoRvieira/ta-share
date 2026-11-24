import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../services/categoria.service';
import { CategoriaResponse } from '../../models/categoria.model';

@Component({
  selector: 'app-categorias',
  imports: [FormsModule],
  templateUrl: './categorias.html'
})
export class Categorias implements OnInit {
  private readonly categoriaService = inject(CategoriaService);

  protected readonly categorias = signal<CategoriaResponse[]>([]);
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly editandoId = signal<number | null>(null);

  nome = '';
  descricao = '';

  ngOnInit(): void {
    this.carregarCategorias();
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

  iniciarEdicao(categoria: CategoriaResponse): void {
    this.editandoId.set(categoria.id);
    this.nome = categoria.nome;
    this.descricao = categoria.descricao ?? '';
    this.erro.set(null);
  }

  cancelarEdicao(): void {
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
        this.nome = '';
        this.descricao = '';
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
