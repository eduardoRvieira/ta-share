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
  protected readonly editandoId = signal<number | null>(null);

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

  iniciarEdicao(equipamento: EquipamentoResponse): void {
    this.editandoId.set(equipamento.id);
    this.nome = equipamento.nome;
    this.patrimonio = equipamento.patrimonio;
    this.categoriaId = equipamento.categoriaId;
    this.estadoConservacao = equipamento.estadoConservacao;
    this.statusItem = equipamento.statusItem;
    this.descricao = equipamento.descricao ?? '';
    this.erro.set(null);
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.nome = '';
    this.patrimonio = '';
    this.categoriaId = '';
    this.estadoConservacao = '';
    this.statusItem = 'DISPONIVEL';
    this.descricao = '';
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
}
