import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { LayoutService } from '../../services/layout.service';
import { AuthService } from '../../services/auth.service';
import { formatarDocumentoPorTipo, formatarTelefoneBr } from '../../shared/utils/formatadores';
import { extrairMensagemErro } from '../../shared/utils/http-erro';
import {
  ANEXO_CADUNICO_PADRAO,
  ANEXO_CFM_PADRAO,
  AnexoPdfSimulado,
  validarArquivoPdf
} from '../../shared/utils/anexo-simulado';

export interface SessaoUsuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

export const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html'
})
export class Login implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly usuarioService = inject(UsuarioService);
  private readonly layout = inject(LayoutService);
  private readonly auth = inject(AuthService);

  protected readonly erro = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);
  protected readonly enviando = signal(false);
  protected readonly modoCadastro = signal(false);
  protected readonly estados = ESTADOS_BR;

  // Campos de login
  email = '';
  senha = '';

  // Campos de cadastro
  tipoPessoa: 'PF' | 'PJ' = 'PF';
  nome = '';
  cpf = '';
  telefone = '';
  perfil = 'BENEFICIARIO';

  // Campos estéticos: Profissional (apenas PF)
  crm = '';
  estadoCrm = 'SC';
  documentoCfm = signal<AnexoPdfSimulado | null>({ ...ANEXO_CFM_PADRAO });

  // Campos estéticos: Beneficiário
  querFazerDoacoes = false;
  precisaReceberDoacoes = false;
  documentoRenda = signal<AnexoPdfSimulado | null>({ ...ANEXO_CADUNICO_PADRAO });

  ngOnInit(): void {
    const motivo = this.auth.motivoLogout();
    if (motivo) {
      this.aviso.set(motivo);
      this.auth.motivoLogout.set(null);
    }
  }

  alternarModo(): void {
    this.modoCadastro.update((v) => !v);
    this.erro.set(null);
    this.aviso.set(null);
  }

  aoMudarTipoPessoa(): void {
    this.cpf = '';
    if (this.tipoPessoa === 'PJ') {
      this.perfil = 'PROFISSIONAL';
    }
  }

  aoMudarPerfil(): void {
    if (this.perfil === 'PROFISSIONAL' && this.tipoPessoa === 'PF' && !this.documentoCfm()) {
      this.documentoCfm.set({ ...ANEXO_CFM_PADRAO });
    }
  }

  aoAlternarReceberDoacoes(): void {
    if (this.precisaReceberDoacoes && !this.documentoRenda()) {
      this.documentoRenda.set({ ...ANEXO_CADUNICO_PADRAO });
    }
  }

  selecionarPdf(event: Event, destino: 'CFM' | 'RENDA'): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) return;

    const resultado = validarArquivoPdf(arquivo);
    if (resultado.erro) {
      this.erro.set(resultado.erro);
      input.value = '';
      return;
    }

    this.erro.set(null);
    if (destino === 'CFM') {
      this.documentoCfm.set(resultado.anexo ?? null);
    } else {
      this.documentoRenda.set(resultado.anexo ?? null);
    }
    input.value = '';
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
    if (!this.nome.trim() || !this.email.trim() || !this.senha.trim() || !this.cpf.trim() || !this.telefone.trim()) return;

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
        this.crm = '';
        this.querFazerDoacoes = false;
        this.precisaReceberDoacoes = false;
        this.documentoCfm.set({ ...ANEXO_CFM_PADRAO });
        this.documentoRenda.set({ ...ANEXO_CADUNICO_PADRAO });
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