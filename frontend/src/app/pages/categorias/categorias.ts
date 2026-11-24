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

  salvar(): void {
    if (!this.nome.trim()) return;

    this.erro.set(null);
    this.categoriaService.criar({
      nome: this.nome.trim(),
      descricao: this.descricao.trim() || null
    }).subscribe({
      next: () => {
        this.nome = '';
        this.descricao = '';
        this.carregarCategorias();
      },
      error: () => {
        this.erro.set('Erro ao cadastrar categoria.');
      }
    });
  }
}
