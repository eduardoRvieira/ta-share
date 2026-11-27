import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SessaoUsuario } from '../pages/login/login';

const CHAVE_SESSAO = 'ta_share_usuario';
const TEMPO_INATIVIDADE_MS = 30 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  readonly usuario = signal<SessaoUsuario | null>(this.lerSessaoStorage());
  readonly estaLogado = computed(() => this.usuario() !== null);
  readonly ehAdmin = computed(() => this.usuario()?.perfil === 'ADMIN');
  readonly motivoLogout = signal<string | null>(null);
  readonly modalSairAberto = signal(false);

  constructor() {
    effect((onCleanup) => {
      if (!this.estaLogado() || typeof window === 'undefined') return;

      let timerId: ReturnType<typeof setTimeout>;
      let ultimaAtividade = Date.now();

      const encerrarPorInatividade = () => {
        this.motivoLogout.set('Sua sessão expirou por inatividade após 30 minutos.');
        this.sair();
      };

      const reiniciarTimer = () => {
        clearTimeout(timerId);
        timerId = setTimeout(encerrarPorInatividade, TEMPO_INATIVIDADE_MS);
      };

      const aoInteragir = () => {
        const agora = Date.now();
        if (agora - ultimaAtividade < 1000) return;
        ultimaAtividade = agora;
        reiniciarTimer();
      };

      const eventos: (keyof WindowEventMap)[] = [
        'mousemove',
        'mousedown',
        'keydown',
        'scroll',
        'touchstart'
      ];

      eventos.forEach((ev) => window.addEventListener(ev, aoInteragir, { passive: true }));
      reiniciarTimer();

      onCleanup(() => {
        clearTimeout(timerId);
        eventos.forEach((ev) => window.removeEventListener(ev, aoInteragir));
      });
    });
  }

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
    this.motivoLogout.set(null);
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario));
    this.usuario.set(usuario);
  }

  solicitarSaida(): void {
    this.modalSairAberto.set(true);
  }

  cancelarSaida(): void {
    this.modalSairAberto.set(false);
  }

  sair(): void {
    this.modalSairAberto.set(false);
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