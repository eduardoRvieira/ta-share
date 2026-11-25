import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TemaService {
  readonly temaEscuro = signal<boolean>(true);
  readonly altoContraste = signal<boolean>(false);

  constructor() {
    const salvoEscuro = localStorage.getItem('ta_share_escuro');
    const salvoContraste = localStorage.getItem('ta_share_contraste');

    if (salvoEscuro !== null) this.temaEscuro.set(salvoEscuro === 'true');
    if (salvoContraste !== null) this.altoContraste.set(salvoContraste === 'true');

    effect(() => {
      const escuro = this.temaEscuro();
      const contraste = this.altoContraste();

      localStorage.setItem('ta_share_escuro', String(escuro));
      localStorage.setItem('ta_share_contraste', String(contraste));

      document.body.classList.remove(
        'tema-escuro',
        'tema-claro',
        'tema-escuro-contraste',
        'tema-claro-contraste'
      );

      if (escuro && contraste) {
        document.body.classList.add('tema-escuro-contraste');
      } else if (!escuro && contraste) {
        document.body.classList.add('tema-claro-contraste');
      } else if (!escuro) {
        document.body.classList.add('tema-claro');
      } else {
        document.body.classList.add('tema-escuro');
      }
    });
  }

  alternarTema(): void {
    this.temaEscuro.update((v) => !v);
  }

  alternarAltoContraste(): void {
    this.altoContraste.update((v) => !v);
  }
}