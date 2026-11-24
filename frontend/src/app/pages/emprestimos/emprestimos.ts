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
  protected readonly editandoId = signal<number | null>(null);

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

  iniciarEdicao(emprestimo: EmprestimoResponse): void {
    this.editandoId.set(emprestimo.id);
    this.usuarioId = emprestimo.usuarioId;
    this.equipamentoId = emprestimo.equipamentoId;
    this.dataEmprestimo = emprestimo.dataEmprestimo ?? '';
    this.dataDevolucaoPrevista = emprestimo.dataDevolucaoPrevista;
    this.status = emprestimo.status;
    this.observacoes = emprestimo.observacoes ?? '';
    this.erro.set(null);
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.usuarioId = '';
    this.equipamentoId = '';
    this.dataEmprestimo = '';
    this.dataDevolucaoPrevista = '';
    this.status = 'ATIVO';
    this.observacoes = '';
  }

  salvar(): void {
    if (!this.usuarioId || !this.equipamentoId || !this.dataDevolucaoPrevista || !this.status) {
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

    this.emprestimoService.atualizar(emprestimo.id, {
      usuarioId: emprestimo.usuarioId,
      equipamentoId: emprestimo.equipamentoId,
      dataEmprestimo: emprestimo.dataEmprestimo,
      dataDevolucaoPrevista: emprestimo.dataDevolucaoPrevista,
      dataDevolucaoReal: emprestimo.dataDevolucaoReal,
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
}
