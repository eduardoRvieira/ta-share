import { Component, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-action-menu',
  templateUrl: './action-menu.html'
})
export class ActionMenu {
  private readonly elementRef = inject(ElementRef);

  readonly ariaLabel = input('Mais ações');
  readonly abrirParaCima = input(false);
  readonly mostrarEditar = input(true);
  readonly mostrarExcluir = input(true);

  readonly editar = output<void>();
  readonly excluir = output<void>();

  protected readonly aberto = signal(false);

  alternar(): void {
    this.aberto.update((v) => !v);
  }

  aoEditar(): void {
    this.aberto.set(false);
    this.editar.emit();
  }

  aoExcluir(): void {
    this.aberto.set(false);
    this.excluir.emit();
  }

  @HostListener('document:click', ['$event'])
  aoClicarFora(event: MouseEvent): void {
    if (this.aberto() && !this.elementRef.nativeElement.contains(event.target)) {
      this.aberto.set(false);
    }
  }
}