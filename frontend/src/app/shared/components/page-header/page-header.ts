import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.html'
})
export class PageHeader {
  readonly titulo = input.required<string>();
  readonly subtitulo = input.required<string>();
  readonly tituloId = input('titulo-pagina');
  readonly textoBotao = input<string | null>(null);
  readonly mostrarBotao = input(true);

  readonly acaoPrimaria = output<void>();
}