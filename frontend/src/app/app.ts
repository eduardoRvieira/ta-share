import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessaoUsuario } from './pages/login/login';
import { TemaService } from './services/tema.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly router = inject(Router);
  readonly tema = inject(TemaService);

  // Signals: variáveis reativas que atualizam a interface automaticamente quando mudam
  protected readonly title = signal('TA.share');

  // Inicia aberto no desktop (>= 768px) e fechado no celular (< 768px)
  protected readonly menuAberto = signal(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  // Verifica se existe uma sessão salva no navegador para saber se o usuário está logado.
  estaLogado(): boolean {
    return !!localStorage.getItem('ta_share_usuario');
  }

  usuarioLogado(): SessaoUsuario | null {
    const dados = localStorage.getItem('ta_share_usuario');
    if (!dados) return null;

    try {
      return JSON.parse(dados) as SessaoUsuario;
    } catch {
      return null;
    }
  }

  // Gera as iniciais do nome do usuário para exibir em avatares (ex: "João Silva" -> "JS").
  iniciaisUsuario(): string {
    const nome = this.usuarioLogado()?.nome?.trim();

    if (!nome) return 'US';

    const partes = nome.split(/\s+/);

    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  // Traduz a chave do perfil do banco/sistema para um texto amigável na tela.
  perfilFormatado(): string {
    const perfil = this.usuarioLogado()?.perfil;
    const mapa: Record<string, string> = {
      ADMIN: 'Administrador',
      PROFISSIONAL: 'Profissional',
      BENEFICIARIO: 'Beneficiário',
      COMUM: 'Comum'
    };
    return perfil ? (mapa[perfil] || perfil) : '';
  }

  // Inverte o estado atual do menu
  alternarMenu(): void {
    this.menuAberto.update((v) => !v);
  }

  // Fecha o menu automaticamente ao navegar em telas de celular
  fecharMenuMobile(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.menuAberto.set(false);
    }
  }

  /**
   * Realiza o logout do usuário após confirmação, interrompe qualquer leitura de voz ativa,
   * fecha o menu no mobile, limpa os dados locais e redireciona para a tela de login.
   */
  sair(): void {
    if (!confirm('Deseja realmente sair?')) {
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.fecharMenuMobile();
    localStorage.removeItem('ta_share_usuario');
    this.router.navigate(['/login']);
  }

  /**
   * Recurso de acessibilidade: utiliza a API nativa do navegador (Web Speech API)
   * para ler em voz alta o conteúdo principal da página atual.
   */
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