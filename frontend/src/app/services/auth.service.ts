import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessaoUsuario } from '../pages/login/login';

const CHAVE_SESSAO = 'ta_share_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  readonly usuario = signal<SessaoUsuario | null>(this.lerSessaoStorage());
  readonly estaLogado = computed(() => this.usuario() !== null);
  readonly ehAdmin = computed(() => this.usuario()?.perfil === 'ADMIN');

  private lerSessaoStorage(): SessaoUsuario | null {
    if (typeof localStorage === 'undefined') return null;
    const dados = localStorage.getItem(CHAVE_SESSAO);
    if (!dados) return null;
    try {
      return JSON.parse(dados) as SessaoUsuario;
    } catch {
      return null;
    }
  }

  definirSessao(usuario: SessaoUsuario): void {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario));
    this.usuario.set(usuario);
  }

  sair(pedirConfirmacao = true): void {
    if (pedirConfirmacao && !confirm('Deseja realmente sair?')) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    localStorage.removeItem(CHAVE_SESSAO);
    this.usuario.set(null);
    this.router.navigate(['/login']);
  }

  ehProprioUsuario(id?: number, email?: string): boolean {
    const sessao = this.usuario();
    if (!sessao) return false;
    return (
      (id !== undefined && sessao.id === id) ||
      (!!email && sessao.email?.toLowerCase() === email.toLowerCase())
    );
  }
}
