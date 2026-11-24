import { Component, inject, OnInit, signal } from '@angular/core';
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

  salvar(): void {
    if (!this.usuarioId || !this.equipamentoId || !this.dataDevolucaoPrevista || !this.status) {
      return;
    }

    this.erro.set(null);
    this.emprestimoService.criar({
      usuarioId: Number(this.usuarioId),
      equipamentoId: Number(this.equipamentoId),
      dataEmprestimo: this.dataEmprestimo || null,
      dataDevolucaoPrevista: this.dataDevolucaoPrevista,
      dataDevolucaoReal: null,
      status: this.status,
      observacoes: this.observacoes.trim() || null
    }).subscribe({
      next: () => {
        this.usuarioId = '';
        this.equipamentoId = '';
        this.dataEmprestimo = '';
        this.dataDevolucaoPrevista = '';
        this.status = 'ATIVO';
        this.observacoes = '';
        this.carregarEmprestimos();
        this.carregarOpcoes();
      },
      error: (err) => {
        this.erro.set(err?.error?.message || 'Erro ao registrar empréstimo.');
      }
    });
  }
}
