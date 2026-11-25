import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioResponse } from '../../models/usuario.model';
import { SessaoUsuario } from '../login/login';

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule],
  templateUrl: './usuarios.html'
})
export class Usuarios implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);

  protected readonly usuarios = signal<UsuarioResponse[]>([]);
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);

  // Controle do modal e menu de ações da linha
  protected readonly modalAberto = signal(false);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly menuAbertoId = signal<number | null>(null);

  // Filtros da listagem
  protected readonly filtroBusca = signal('');
  protected readonly filtroPerfil = signal('');
  protected readonly filtroTipoPessoa = signal('');

  // Lista filtrada reativa
  protected readonly usuariosFiltrados = computed(() => {
    const termo = this.filtroBusca().toLowerCase().trim();
    const perfil = this.filtroPerfil();
    const tipo = this.filtroTipoPessoa();

    return this.usuarios().filter((u) => {
      const docBruto = (u as any).cpf ? String((u as any).cpf).replace(/\D/g, '') : '';
      const ehPj = docBruto.length > 11;

      const bateBusca =
        !termo ||
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo) ||
        docBruto.includes(termo.replace(/\D/g, '')) ||
        ((u as any).cpf && String((u as any).cpf).toLowerCase().includes(termo));

      const batePerfil = !perfil || u.perfil === perfil;
      const bateTipo =
        !tipo ||
        (tipo === 'PF' && !ehPj) ||
        (tipo === 'PJ' && ehPj);

      return bateBusca && batePerfil && bateTipo;
    });
  });

  // Campos do formulário
  tipoPessoa: 'PF' | 'PJ' = 'PF';
  nome = '';
  email = '';
  senha = '';
  cpf = '';
  telefone = '';
  perfil = 'BENEFICIARIO';

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  usuarioSessao(): SessaoUsuario | null {
    const dados = localStorage.getItem('ta_share_usuario');
    if (!dados) return null;
    try {
      return JSON.parse(dados) as SessaoUsuario;
    } catch {
      return null;
    }
  }

  ehAdmin(): boolean {
    return this.usuarioSessao()?.perfil === 'ADMIN';
  }

  ehProprioUsuario(usuario: UsuarioResponse): boolean {
    const sessao = this.usuarioSessao();
    if (!sessao) return false;
    return sessao.id === usuario.id || sessao.email?.toLowerCase() === usuario.email?.toLowerCase();
  }

  podeGerenciar(usuario: UsuarioResponse): boolean {
    return this.ehAdmin() || this.ehProprioUsuario(usuario);
  }

  podeExcluir(usuario: UsuarioResponse): boolean {
    return this.ehAdmin() || this.ehProprioUsuario(usuario);
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
    if (!this.ehAdmin()) return;
    this.limparFormulario();
    this.modalAberto.set(true);
  }

  iniciarEdicao(usuario: UsuarioResponse): void {
    if (!this.podeGerenciar(usuario)) return;

    this.menuAbertoId.set(null);
    this.editandoId.set(usuario.id);
    this.nome = usuario.nome;
    this.email = usuario.email;
    this.senha = '';

    const docExistente = (usuario as any).cpf ? String((usuario as any).cpf) : '';
    const apenasDigitos = docExistente.replace(/\D/g, '');
    this.tipoPessoa = apenasDigitos.length > 11 ? 'PJ' : 'PF';
    this.cpf = docExistente;
    if (docExistente) {
      this.formatarDocumento(docExistente);
    }

    this.telefone = usuario.telefone ?? '';
    this.perfil = usuario.perfil || 'BENEFICIARIO';
    this.erro.set(null);
    this.modalAberto.set(true);
  }

  cancelarEdicao(): void {
    this.limparFormulario();
    this.modalAberto.set(false);
  }

  private limparFormulario(): void {
    this.editandoId.set(null);
    this.tipoPessoa = 'PF';
    this.nome = '';
    this.email = '';
    this.senha = '';
    this.cpf = '';
    this.telefone = '';
    this.perfil = 'BENEFICIARIO';
  }

  alternarMenuLinha(id: number): void {
    this.menuAbertoId.update((atual) => (atual === id ? null : id));
  }

  formatarDocumento(valor: string): void {
    const digitos = valor.replace(/\D/g, '');
    if (this.tipoPessoa === 'PF') {
      const d = digitos.slice(0, 11);
      if (d.length <= 3) this.cpf = d;
      else if (d.length <= 6) this.cpf = `${d.slice(0, 3)}.${d.slice(3)}`;
      else if (d.length <= 9) this.cpf = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
      else this.cpf = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
    } else {
      const d = digitos.slice(0, 14);
      if (d.length <= 2) this.cpf = d;
      else if (d.length <= 5) this.cpf = `${d.slice(0, 2)}.${d.slice(2)}`;
      else if (d.length <= 8) this.cpf = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
      else if (d.length <= 12) this.cpf = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
      else this.cpf = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
    }
  }

  formatarTelefone(valor: string): void {
    const d = valor.replace(/\D/g, '').slice(0, 11);
    if (d.length === 0) this.telefone = '';
    else if (d.length <= 2) this.telefone = `(${d}`;
    else if (d.length <= 6) this.telefone = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    else if (d.length <= 10) this.telefone = `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    else this.telefone = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  salvar(): void {
    const idAtual = this.editandoId();
    const editando = idAtual !== null;

    if (!editando && !this.ehAdmin()) {
      this.erro.set('Apenas administradores podem cadastrar novos usuários.');
      return;
    }

    if (!this.nome.trim() || !this.email.trim() || !this.perfil) {
      return;
    }

    if (!editando && (!this.senha.trim() || !this.cpf.trim())) {
      return;
    }

    this.erro.set(null);
    const payload = {
      nome: this.nome.trim(),
      email: this.email.trim(),
      senha: this.senha,
      cpf: this.cpf.trim(),
      telefone: this.telefone.trim() || null,
      perfil: this.perfil
    };

    if (editando) {
      this.usuarioService.atualizar(idAtual, payload).subscribe({
        next: () => {
          this.cancelarEdicao();
          this.carregarUsuarios();
        },
        error: (err) => {
          this.erro.set(err?.error?.message || 'Erro ao atualizar usuário.');
        }
      });
      return;
    }

    this.usuarioService.criar(payload).subscribe({
      next: () => {
        this.cancelarEdicao();
        this.carregarUsuarios();
      },
      error: (err) => {
        this.erro.set(err?.error?.message || 'Erro ao cadastrar usuário.');
      }
    });
  }

  excluir(usuario: UsuarioResponse): void {
    this.menuAbertoId.set(null);

    if (!this.podeExcluir(usuario)) {
      this.erro.set('Você não tem permissão para excluir outros usuários.');
      return;
    }

    const excluindoPropriaConta = this.ehProprioUsuario(usuario);
    const mensagemConfirmacao = excluindoPropriaConta
      ? 'Deseja realmente excluir sua própria conta? Você será desconectado do sistema.'
      : `Deseja realmente excluir o usuário ${usuario.nome}?`;

    if (!confirm(mensagemConfirmacao)) return;

    this.erro.set(null);
    this.usuarioService.deletar(usuario.id).subscribe({
      next: () => {
        if (excluindoPropriaConta) {
          localStorage.removeItem('ta_share_usuario');
          this.router.navigate(['/login']);
          return;
        }
        if (this.editandoId() === usuario.id) {
          this.cancelarEdicao();
        }
        this.carregarUsuarios();
      },
      error: (err) => {
        this.erro.set(err?.error?.message || 'Não foi possível excluir este usuário.');
      }
    });
  }

  iniciais(nome: string): string {
    const limpo = nome?.trim();
    if (!limpo) return 'US';
    const partes = limpo.split(/\s+/);
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  ehPessoaJuridica(usuario: UsuarioResponse): boolean {
    const doc = (usuario as any).cpf ? String((usuario as any).cpf).replace(/\D/g, '') : '';
    return doc.length > 11;
  }

  documentoFormatado(usuario: UsuarioResponse): string {
    const doc = (usuario as any).cpf ? String((usuario as any).cpf).trim() : '';
    if (!doc) return 'Não informado';
    const digitos = doc.replace(/\D/g, '');
    if (digitos.length === 14) {
      const cnpj = doc.includes('/')
        ? doc
        : `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12)}`;
      return `CNPJ ${cnpj}`;
    }
    const cpf = doc.includes('-')
      ? doc
      : digitos.length === 11
        ? `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`
        : doc;
    return `CPF ${cpf}`;
  }

  rotuloPerfil(perfil: string): string {
    const mapa: Record<string, string> = {
      ADMIN: 'Administrador',
      PROFISSIONAL: 'Profissional',
      BENEFICIARIO: 'Beneficiário',
      COMUM: 'Comum'
    };
    return mapa[perfil] || perfil;
  }
}