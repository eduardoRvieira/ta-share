import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html'
})
export class Modal {
  readonly aberto = input.required<boolean>();
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string | null>(null);
  readonly mostrarAvisoObrigatorio = input(false);
  readonly tituloId = input('titulo-modal');
  readonly largura = input<'md' | 'lg'>('lg');

  readonly fechar = output<void>();
}