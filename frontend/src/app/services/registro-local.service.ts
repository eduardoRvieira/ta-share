import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';

export interface AutorRegistro {
  usuarioId: number;
  usuarioNome: string;
}

export interface ConfirmacaoEmprestimoPendente {
  emprestimoId: number;
  equipamentoId: number;
  equipamentoNome: string;
  ofertanteId: number;
  ofertanteNome: string;
  recebedorId: number;
}

const CHAVE_DONOS_EQUIPAMENTOS = 'ta_share_donos_equipamentos';
const CHAVE_DONOS_EMPRESTIMOS = 'ta_share_donos_emprestimos';
const CHAVE_CONFIRMACOES_PENDENTES = 'ta_share_confirmacoes_emprestimo';

@Injectable({ providedIn: 'root' })
export class RegistroLocalService {
  private readonly auth = inject(AuthService);

  private readonly donosEquipamentos = signal<Record<number, AutorRegistro>>(
    this.lerMapa(CHAVE_DONOS_EQUIPAMENTOS)
  );
  private readonly donosEmprestimos = signal<Record<number, AutorRegistro>>(
    this.lerMapa(CHAVE_DONOS_EMPRESTIMOS)
  );
  readonly confirmacoesPendentes = signal<ConfirmacaoEmprestimoPendente[]>(
    this.lerLista(CHAVE_CONFIRMACOES_PENDENTES)
  );

  private lerMapa(chave: string): Record<number, AutorRegistro> {
    if (typeof localStorage === 'undefined') return {};
    try {
      const bruto = localStorage.getItem(chave);
      return bruto ? (JSON.parse(bruto) as Record<number, AutorRegistro>) : {};
    } catch {
      return {};
    }
  }

  private salvarMapa(chave: string, mapa: Record<number, AutorRegistro>): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(chave, JSON.stringify(mapa));
  }

  private lerLista(chave: string): ConfirmacaoEmprestimoPendente[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const bruto = localStorage.getItem(chave);
      return bruto ? (JSON.parse(bruto) as ConfirmacaoEmprestimoPendente[]) : [];
    } catch {
      return [];
    }
  }

  private salvarLista(chave: string, lista: ConfirmacaoEmprestimoPendente[]): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(chave, JSON.stringify(lista));
  }

  // --- EQUIPAMENTOS ---

  registrarDonoEquipamento(equipamentoId: number): void {
    const sessao = this.auth.usuario();
    if (!sessao) return;

    const atualizado = {
      ...this.donosEquipamentos(),
      [equipamentoId]: { usuarioId: sessao.id, usuarioNome: sessao.nome }
    };
    this.donosEquipamentos.set(atualizado);
    this.salvarMapa(CHAVE_DONOS_EQUIPAMENTOS, atualizado);
  }

  obterDonoEquipamento(equipamentoId: number): AutorRegistro | null {
    return this.donosEquipamentos()[equipamentoId] ?? null;
  }

  obterNomeCriadorEquipamento(equipamentoId: number): string {
    return this.donosEquipamentos()[equipamentoId]?.usuarioNome ?? 'Administração TA.share';
  }

  ehDonoEquipamento(equipamentoId: number): boolean {
    const sessao = this.auth.usuario();
    if (!sessao) return false;
    const dono = this.donosEquipamentos()[equipamentoId];
    return dono !== undefined && dono.usuarioId === sessao.id;
  }

  podeGerenciarEquipamento(equipamentoId: number): boolean {
    return this.auth.ehAdmin() || this.ehDonoEquipamento(equipamentoId);
  }

  // --- EMPRÉSTIMOS ---

  registrarDonoEmprestimo(emprestimoId: number): void {
    const sessao = this.auth.usuario();
    if (!sessao) return;

    const atualizado = {
      ...this.donosEmprestimos(),
      [emprestimoId]: { usuarioId: sessao.id, usuarioNome: sessao.nome }
    };
    this.donosEmprestimos.set(atualizado);
    this.salvarMapa(CHAVE_DONOS_EMPRESTIMOS, atualizado);
  }

  obterDonoEmprestimo(emprestimoId: number): AutorRegistro | null {
    return this.donosEmprestimos()[emprestimoId] ?? null;
  }

  ehDonoEmprestimo(emprestimoId: number): boolean {
    const sessao = this.auth.usuario();
    if (!sessao) return false;
    const dono = this.donosEmprestimos()[emprestimoId];
    return dono !== undefined && dono.usuarioId === sessao.id;
  }

  podeGerenciarEmprestimo(emprestimoId: number): boolean {
    return this.auth.ehAdmin() || this.ehDonoEmprestimo(emprestimoId);
  }

  // --- POP-UP DE ACEITE DO RECEBEDOR ---

  registrarConfirmacaoPendente(dados: Omit<ConfirmacaoEmprestimoPendente, 'ofertanteId' | 'ofertanteNome'>): void {
    const sessao = this.auth.usuario();
    if (!sessao || sessao.id === dados.recebedorId) return;

    const nova: ConfirmacaoEmprestimoPendente = {
      ...dados,
      ofertanteId: sessao.id,
      ofertanteNome: sessao.nome
    };

    const semDuplicada = this.confirmacoesPendentes().filter(
      (item) => item.emprestimoId !== dados.emprestimoId
    );
    const atualizada = [...semDuplicada, nova];
    this.confirmacoesPendentes.set(atualizada);
    this.salvarLista(CHAVE_CONFIRMACOES_PENDENTES, atualizada);
  }

  obterPendenciaParaUsuarioAtual(): ConfirmacaoEmprestimoPendente | null {
    const sessao = this.auth.usuario();
    if (!sessao) return null;
    return this.confirmacoesPendentes().find((item) => item.recebedorId === sessao.id) ?? null;
  }

  removerPendencia(emprestimoId: number): void {
    const atualizada = this.confirmacoesPendentes().filter(
      (item) => item.emprestimoId !== emprestimoId
    );
    this.confirmacoesPendentes.set(atualizada);
    this.salvarLista(CHAVE_CONFIRMACOES_PENDENTES, atualizada);
  }
}