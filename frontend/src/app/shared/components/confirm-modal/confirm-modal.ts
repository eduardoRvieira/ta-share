import { Component, input, output } from '@angular/core';
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-confirm-modal',
  imports: [Modal],
  templateUrl: './confirm-modal.html'
})
export class ConfirmModal {
  readonly aberto = input(false);
  readonly tituloId = input('titulo-confirmacao');
  readonly titulo = input('Confirmar ação');
  readonly subtitulo = input('');
  readonly mensagem = input('Deseja realmente prosseguir?');
  readonly textoConfirmar = input('Excluir');
  readonly textoCancelar = input('Cancelar');

  readonly confirmar = output<void>();
  readonly cancelar = output<void>();
}