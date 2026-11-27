import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { UsuarioResponse } from '../../models/usuario.model';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { ActionMenu } from '../../shared/components/action-menu/action-menu';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { SearchInput } from '../../shared/components/search-input/search-input';
import { UsuarioFormPayload, UsuarioModal } from './usuario-modal/usuario-modal';
import { correspondeBusca } from '../../shared/utils/busca';
import { extrairMensagemErro } from '../../shared/utils/http-erro';
import { ehCnpj, formatarDocumentoComRotulo, obterIniciais } from '../../shared/utils/formatadores';
import { ConfirmModal } from '../../shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule, PageHeader, ActionMenu, StatusBadge, SearchInput, UsuarioModal, ConfirmModal],
  templateUrl: './usuarios.html'
})
export class Usuarios implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  protected readonly auth = inject(AuthService);

  protected readonly usuarios = signal<UsuarioResponse[]>([]);
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly modalAberto = signal(false);
  protected readonly usuarioEmEdicao = signal<UsuarioResponse | null>(null);
  protected readonly usuarioParaExcluir = signal<UsuarioResponse | null>(null);

  protected readonly filtroBusca = signal('');
  protected readonly filtroPerfil = signal('');
  protected readonly filtroTipoPessoa = signal('');

  protected readonly iniciais = obterIniciais;
  protected readonly ehPessoaJuridica = (u: UsuarioResponse) => ehCnpj((u as any).cpf);
  protected readonly documentoFormatado = (u: UsuarioResponse) => formatarDocumentoComRotulo((u as any).cpf);

  protected readonly excluindoPropriaConta = computed(() => {
    const alvo = this.usuarioParaExcluir();
    return alvo !== null && this.ehProprioUsuario(alvo);
  });

  protected readonly usuariosFiltrados = computed(() => {
    const termo = this.filtroBusca();
    const perfil = this.filtroPerfil();
    const tipo = this.filtroTipoPessoa();
    const apenasDigitosBusca = termo.replace(/\D/g, '');

    return this.usuarios().filter((u) => {
      const docBruto = (u as any).cpf ? String((u as any).cpf).replace(/\D/g, '') : '';
      const ehPj = docBruto.length > 11;

      const bateBusca =
        correspondeBusca(termo, u.nome, u.email, (u as any).cpf) ||
        (!!apenasDigitosBusca && docBruto.includes(apenasDigitosBusca));

      const batePerfil = !perfil || u.perfil === perfil;
      const bateTipo = !tipo || (tipo === 'PF' && !ehPj) || (tipo === 'PJ' && ehPj);

      return bateBusca && batePerfil && bateTipo;
    });
  });

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  ehProprioUsuario(usuario: UsuarioResponse): boolean {
    return this.auth.ehProprioUsuario(usuario.id, usuario.email);
  }

  podeGerenciar(usuario: UsuarioResponse): boolean {
    return this.auth.ehAdmin() || this.ehProprioUsuario(usuario);
  }

  carregarUsuarios(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.usuarioService.listar().subscribe({
      next: (dados) => {
        this.usuarios.set(dados);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os usuários.');
        this.carregando.set(false);
      }
    });
  }

  abrirNovo(): void {
    if (!this.auth.ehAdmin()) return;
    this.usuarioEmEdicao.set(null);
    this.erro.set(null);
    this.modalAberto.set(true);
  }

  iniciarEdicao(usuario: UsuarioResponse): void {
    if (!this.podeGerenciar(usuario)) return;
    this.usuarioEmEdicao.set(usuario);
    this.erro.set(null);
    this.modalAberto.set(true);
  }

  fecharModal(): void {
    this.usuarioEmEdicao.set(null);
    this.modalAberto.set(false);
  }

  salvar({ id, payload }: { id: number | null; payload: UsuarioFormPayload }): void {
    if (id === null && !this.auth.ehAdmin()) {
      this.erro.set('Apenas administradores podem cadastrar novos usuários.');
      return;
    }

    this.erro.set(null);
    const tipo = ehCnpj(payload.cpf) ? 'PJ' : 'PF';
    const requisicao = id !== null
      ? this.usuarioService.atualizar(id, payload)
      : this.usuarioService.criar(payload);

    requisicao.subscribe({
      next: () => {
        this.fecharModal();
        this.carregarUsuarios();
      },
      error: (err) => {
        const fallback = id !== null ? 'Erro ao atualizar usuário.' : 'Erro ao cadastrar usuário.';
        this.erro.set(extrairMensagemErro(err, fallback, tipo));
      }
    });
  }

  solicitarExclusao(usuario: UsuarioResponse): void {
    if (!this.podeGerenciar(usuario)) {
      this.erro.set('Você não tem permissão para excluir outros usuários.');
      return;
    }

    this.erro.set(null);
    this.usuarioParaExcluir.set(usuario);
  }

  cancelarExclusao(): void {
    this.usuarioParaExcluir.set(null);
  }

  confirmarExclusao(): void {
    const alvo = this.usuarioParaExcluir();
    if (!alvo) return;

    const propriaConta = this.ehProprioUsuario(alvo);
    this.usuarioParaExcluir.set(null);
    this.erro.set(null);

    this.usuarioService.deletar(alvo.id).subscribe({
      next: () => {
        if (propriaConta) {
          this.auth.sair();
          return;
        }
        if (this.usuarioEmEdicao()?.id === alvo.id) {
          this.fecharModal();
        }
        this.carregarUsuarios();
      },
      error: (err) => {
        this.erro.set(extrairMensagemErro(err, 'Não foi possível excluir este usuário.'));
      }
    });
  }
}