import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioResponse } from '../../models/usuario.model';

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule],
  templateUrl: './usuarios.html'
})
export class Usuarios implements OnInit {
  private readonly usuarioService = inject(UsuarioService);

  protected readonly usuarios = signal<UsuarioResponse[]>([]);
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly editandoId = signal<number | null>(null);

  nome = '';
  email = '';
  senha = '';
  cpf = '';
  telefone = '';
  perfil = '';

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.usuarioService.listar().subscribe({
      next: (dados) => {
        this.usuarios.set(dados);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os usuários.');
        this.carregando.set(false);
      }
    });
  }

  iniciarEdicao(usuario: UsuarioResponse): void {
    this.editandoId.set(usuario.id);
    this.nome = usuario.nome;
    this.email = usuario.email;
    this.senha = '';
    this.cpf = '';
    this.telefone = usuario.telefone ?? '';
    this.perfil = usuario.perfil;
    this.erro.set(null);
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.nome = '';
    this.email = '';
    this.senha = '';
    this.cpf = '';
    this.telefone = '';
    this.perfil = '';
  }

  salvar(): void {
    const idAtual = this.editandoId();
    const editando = idAtual !== null;

    if (!this.nome.trim() || !this.email.trim() || !this.perfil) {
      return;
    }

    if (!editando && (!this.senha.trim() || !this.cpf.trim())) {
      return;
    }

    this.erro.set(null);
    const payload = {
      nome: this.nome.trim(),
      email: this.email.trim(),
      senha: this.senha,
      cpf: this.cpf.trim(),
      telefone: this.telefone.trim() || null,
      perfil: this.perfil
    };

    if (editando) {
      this.usuarioService.atualizar(idAtual, payload).subscribe({
        next: () => {
          this.cancelarEdicao();
          this.carregarUsuarios();
        },
        error: (err) => {
          this.erro.set(err?.error?.message || 'Erro ao atualizar usuário.');
        }
      });
      return;
    }

    this.usuarioService.criar(payload).subscribe({
      next: () => {
        this.cancelarEdicao();
        this.carregarUsuarios();
      },
      error: (err) => {
        this.erro.set(err?.error?.message || 'Erro ao cadastrar usuário. Verifique os dados (ex.: e-mail, CPF ou perfil).');
      }
    });
  }

  excluir(id: number): void {
    if (!confirm('Deseja realmente excluir este usuário?')) return;

    this.erro.set(null);
    this.usuarioService.deletar(id).subscribe({
      next: () => {
        if (this.editandoId() === id) {
          this.cancelarEdicao();
        }
        this.carregarUsuarios();
      },
      error: (err) => {
        this.erro.set(err?.error?.message || 'Erro ao excluir usuário.');
      }
    });
  }
}
