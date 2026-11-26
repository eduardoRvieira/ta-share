import { computed, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly titulo = signal('TA.share');
  readonly naTelaLogin = signal(false);
  readonly menuAberto = signal(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

  readonly exibirAreaLogada = computed(() => this.auth.estaLogado() && !this.naTelaLogin());

  constructor() {
    this.atualizarRota(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.atualizarRota(e.urlAfterRedirects));
  }

  private atualizarRota(url: string): void {
    this.naTelaLogin.set(url.startsWith('/login'));
  }

  alternarMenu(): void {
    this.menuAberto.update((v) => !v);
  }

  fecharMenuMobile(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.menuAberto.set(false);
    }
  }

  lerPagina(): void {
    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não suporta leitura em voz alta.');
      return;
    }

    window.speechSynthesis.cancel();

    const textoMain = document.querySelector('main')?.innerText.trim();
    const textoHeader = document.querySelector('header')?.innerText.trim();
    const conteudo = textoMain || textoHeader || 'Bem-vindo ao TA.share.';

    const utterance = new SpeechSynthesisUtterance(conteudo);
    utterance.lang = 'pt-BR';

    const vozes = window.speechSynthesis.getVoices();
    const vozPt = vozes.find((v) => v.lang.toLowerCase().includes('pt-br')) || vozes[0];
    if (vozPt) {
      utterance.voice = vozPt;
    }

    window.speechSynthesis.speak(utterance);
  }

  pararLeitura(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
