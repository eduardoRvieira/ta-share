import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

export interface SessaoUsuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html'
})
export class Login {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly usuarioService = inject(UsuarioService);

  protected readonly erro = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);
  protected readonly enviando = signal(false);
  protected readonly modoCadastro = signal(false);

  // Campos de login
  email = '';
  senha = '';

  // Campos extras de cadastro
  tipoPessoa: 'PF' | 'PJ' = 'PF';
  nome = '';
  cpf = '';
  telefone = '';
  perfil = 'BENEFICIARIO';

  alternarModo(): void {
    this.modoCadastro.update((v) => !v);
    this.erro.set(null);
    this.aviso.set(null);
  }

  formatarDocumento(valor: string): void {
    const numeros = valor.replace(/\D/g, '');
    if (this.tipoPessoa === 'PF') {
      this.cpf = numeros
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2') .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      this.cpf = numeros
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
  }

  formatarTelefone(valor: string): void {
    const numeros = valor.replace(/\D/g, '').slice(0, 11);
    if (numeros.length <= 10) {
      this.telefone = numeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      this.telefone = numeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  }

  entrar(): void {
    if (!this.email.trim() || !this.senha.trim()) return;

    this.erro.set(null);
    this.aviso.set(null);
    this.enviando.set(true);

    this.http.post<SessaoUsuario>('/api/auth/login', {
      email: this.email.trim(),
      senha: this.senha
    }).subscribe({
      next: (usuario) => {
        localStorage.setItem('ta_share_usuario', JSON.stringify(usuario));
        this.enviando.set(false);
        this.router.navigate(['/equipamentos']);
      },
      error: (err) => {
        this.enviando.set(false);
        this.erro.set(err?.error?.message || 'E-mail ou senha inválidos.');
      }
    });
  }

  cadastrar(): void {
    if (!this.nome.trim() || !this.email.trim() || !this.senha.trim() || !this.cpf.trim()) return;

    this.erro.set(null);
    this.aviso.set(null);
    this.enviando.set(true);

    this.usuarioService.criar({
      nome: this.nome.trim(),
      email: this.email.trim(),
      senha: this.senha,
      cpf: this.cpf.trim(),
      telefone: this.telefone.trim() || null,
      perfil: this.perfil
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.modoCadastro.set(false);
        this.nome = '';
        this.cpf = '';
        this.telefone = '';
        this.senha = '';
        this.aviso.set('Conta criada com sucesso! Agora faça login com seu e-mail e senha.');
      },
      error: (err) => {
        this.enviando.set(false);
        this.erro.set(err?.error?.message || 'Não foi possível criar a conta. Verifique os dados.');
      }
    });
  }
}