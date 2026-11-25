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
  protected readonly menuAberto = signal(true); 

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
}