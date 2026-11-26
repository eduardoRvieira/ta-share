import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { LayoutService } from '../../services/layout.service';
import { AuthService } from '../../services/auth.service';
import { formatarDocumentoPorTipo, formatarTelefoneBr } from '../../shared/utils/formatadores';
import { extrairMensagemErro } from '../../shared/utils/http-erro';

export interface SessaoUsuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html'
})
export class Login {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly usuarioService = inject(UsuarioService);
  private readonly layout = inject(LayoutService);
  private readonly auth = inject(AuthService);

  protected readonly erro = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);
  protected readonly enviando = signal(false);
  protected readonly modoCadastro = signal(false);

  // Campos de login
  email = '';
  senha = '';

  // Campos extras de cadastro
  tipoPessoa: 'PF' | 'PJ' = 'PF';
  nome = '';
  cpf = '';
  telefone = '';
  perfil = 'BENEFICIARIO';

  alternarModo(): void {
    this.modoCadastro.update((v) => !v);
    this.erro.set(null);
    this.aviso.set(null);
  }

  formatarDocumento(valor: string): void {
    this.cpf = formatarDocumentoPorTipo(valor, this.tipoPessoa);
  }

  formatarTelefone(valor: string): void {
    this.telefone = formatarTelefoneBr(valor);
  }

  entrar(): void {
    if (!this.email.trim() || !this.senha.trim()) return;

    this.erro.set(null);
    this.aviso.set(null);
    this.enviando.set(true);

    this.http.post<SessaoUsuario>('/api/auth/login', {
      email: this.email.trim(),
      senha: this.senha
    }).subscribe({
      next: (usuario) => {
        this.auth.definirSessao(usuario);
        if (typeof window !== 'undefined' && window.innerWidth >= 768) {
          this.layout.menuAberto.set(true);
        }
        this.enviando.set(false);
        this.router.navigate(['/equipamentos']);
      },
      error: (err) => {
        this.enviando.set(false);
        this.erro.set(extrairMensagemErro(err, 'E-mail ou senha inválidos.'));
      }
    });
  }

  cadastrar(): void {
    if (!this.nome.trim() || !this.email.trim() || !this.senha.trim() || !this.cpf.trim()) return;

    this.erro.set(null);
    this.aviso.set(null);
    this.enviando.set(true);

    this.usuarioService.criar({
      nome: this.nome.trim(),
      email: this.email.trim(),
      senha: this.senha,
      cpf: this.cpf.trim(),
      telefone: this.telefone.trim() || null,
      perfil: this.perfil
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.modoCadastro.set(false);
        this.nome = '';
        this.cpf = '';
        this.telefone = '';
        this.senha = '';
        this.aviso.set('Conta criada com sucesso! Agora faça login com seu e-mail e senha.');
      },
      error: (err) => {
        this.enviando.set(false);
        this.erro.set(
          extrairMensagemErro(
            err,
            'Não foi possível concluir o cadastro. Verifique os dados informados.',
            this.tipoPessoa
          )
        );
      }
    });
  }
}