import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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

  protected readonly erro = signal<string | null>(null);
  protected readonly enviando = signal(false);

  email = '';
  senha = '';

  entrar(): void {
    if (!this.email.trim() || !this.senha.trim()) return;

    this.erro.set(null);
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
}
