import { Component, inject, OnInit, signal } from '@angular/core';
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

  nome = '';
  patrimonio = '';
  categoriaId: number | '' = '';
  estadoConservacao = '';
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

  salvar(): void {
    if (!this.nome.trim() || !this.patrimonio.trim() || !this.categoriaId || !this.estadoConservacao.trim()) {
      return;
    }

    this.erro.set(null);
    this.equipamentoService.criar({
      nome: this.nome.trim(),
      patrimonio: this.patrimonio.trim(),
      categoriaId: Number(this.categoriaId),
      estadoConservacao: this.estadoConservacao.trim(),
      statusItem: this.statusItem,
      descricao: this.descricao.trim() || null
    }).subscribe({
      next: () => {
        this.nome = '';
        this.patrimonio = '';
        this.categoriaId = '';
        this.estadoConservacao = '';
        this.statusItem = 'DISPONIVEL';
        this.descricao = '';
        this.carregarEquipamentos();
      },
      error: () => {
        this.erro.set('Erro ao cadastrar equipamento.');
      }
    });
  }
}
