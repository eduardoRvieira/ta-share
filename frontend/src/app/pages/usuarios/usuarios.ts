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

  salvar(): void {
    if (!this.nome.trim() || !this.email.trim() || !this.senha.trim() || !this.cpf.trim() || !this.perfil) {
      return;
    }

    this.erro.set(null);
    this.usuarioService.criar({
      nome: this.nome.trim(),
      email: this.email.trim(),
      senha: this.senha,
      cpf: this.cpf.trim(),
      telefone: this.telefone.trim() || null,
      perfil: this.perfil
    }).subscribe({
      next: () => {
        this.nome = '';
        this.email = '';
        this.senha = '';
        this.cpf = '';
        this.telefone = '';
        this.perfil = '';
        this.carregarUsuarios();
      },
      error: () => {
        this.erro.set('Erro ao cadastrar usuário. Verifique os dados (ex.: e-mail, CPF ou perfil).');
      }
    });
  }
}
