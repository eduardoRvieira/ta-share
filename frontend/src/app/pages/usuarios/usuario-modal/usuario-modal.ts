import { Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioResponse } from '../../../models/usuario.model';
import { Modal } from '../../../shared/components/modal/modal';
import { FormActions } from '../../../shared/components/form-actions/form-actions';
import { ehCnpj, formatarDocumentoPorTipo, formatarTelefoneBr } from '../../../shared/utils/formatadores';

export interface UsuarioFormPayload {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  telefone: string | null;
  perfil: string;
}

@Component({
  selector: 'app-usuario-modal',
  imports: [FormsModule, Modal, FormActions],
  templateUrl: './usuario-modal.html'
})
export class UsuarioModal {
  readonly aberto = input(false);
  readonly usuarioEmEdicao = input<UsuarioResponse | null>(null);
  readonly ehAdmin = input(false);

  readonly fechar = output<void>();
  readonly salvarFormulario = output<{ id: number | null; payload: UsuarioFormPayload }>();

  tipoPessoa: 'PF' | 'PJ' = 'PF';
  nome = '';
  email = '';
  senha = '';
  cpf = '';
  telefone = '';
  perfil = 'BENEFICIARIO';

  constructor() {
    effect(() => {
      if (!this.aberto()) return;
      const usuario = this.usuarioEmEdicao();

      if (!usuario) {
        this.tipoPessoa = 'PF';
        this.nome = '';
        this.email = '';
        this.senha = '';
        this.cpf = '';
        this.telefone = '';
        this.perfil = 'BENEFICIARIO';
        return;
      }

      const docExistente = (usuario as any).cpf ? String((usuario as any).cpf) : '';
      this.tipoPessoa = ehCnpj(docExistente) ? 'PJ' : 'PF';
      this.nome = usuario.nome;
      this.email = usuario.email;
      this.senha = '';
      this.cpf = docExistente ? formatarDocumentoPorTipo(docExistente, this.tipoPessoa) : '';
      this.telefone = usuario.telefone ?? '';
      this.perfil = usuario.perfil || 'BENEFICIARIO';
    });
  }

  formatarDocumento(valor: string): void {
    this.cpf = formatarDocumentoPorTipo(valor, this.tipoPessoa);
  }

  formatarTelefone(valor: string): void {
    this.telefone = formatarTelefoneBr(valor);
  }

  aoSubmeter(): void {
    const id = this.usuarioEmEdicao()?.id ?? null;
    if (!this.nome.trim() || !this.email.trim() || !this.perfil) return;
    if (id === null && (!this.senha.trim() || !this.cpf.trim())) return;

    this.salvarFormulario.emit({
      id,
      payload: {
        nome: this.nome.trim(),
        email: this.email.trim(),
        senha: this.senha,
        cpf: this.cpf.trim(),
        telefone: this.telefone.trim() || null,
        perfil: this.perfil
      }
    });
  }
}