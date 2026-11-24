import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('TA.share');

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
    const vozPt = vozes.find(v => v.lang.toLowerCase().includes('pt-br')) || vozes[0];
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
