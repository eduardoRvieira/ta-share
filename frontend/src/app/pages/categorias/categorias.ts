import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CategoriaService } from '../../services/categoria.service';
import { EquipamentoService } from '../../services/equipamento.service';
import { AuthService } from '../../services/auth.service';
import { CategoriaResponse } from '../../models/categoria.model';
import { EquipamentoResponse } from '../../models/equipamento.model';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { CategoriaFormPayload, CategoriaModal } from './categoria-modal/categoria-modal';
import { ConfirmModal } from '../../shared/components/confirm-modal/confirm-modal';
import { extrairMensagemErro } from '../../shared/utils/http-erro';

@Component({
  selector: 'app-categorias',
  imports: [PageHeader, CategoriaModal, ConfirmModal],
  templateUrl: './categorias.html'
})
export class Categorias implements OnInit {
  private readonly categoriaService = inject(CategoriaService);
  private readonly equipamentoService = inject(EquipamentoService);
  protected readonly auth = inject(AuthService);

  protected readonly categorias = signal<CategoriaResponse[]>([]);
  protected readonly equipamentos = signal<EquipamentoResponse[]>([]);
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly modalAberto = signal(false);
  protected readonly categoriaEmEdicao = signal<CategoriaResponse | null>(null);
  protected readonly categoriaParaExcluir = signal<CategoriaResponse | null>(null);

  protected readonly contagemPorCategoria = computed(() => {
    const mapa: Record<number, number> = {};
    for (const eq of this.equipamentos()) {
      mapa[eq.categoriaId] = (mapa[eq.categoriaId] || 0) + 1;
    }
    return mapa;
  });

  ngOnInit(): void {
    this.carregarCategorias();
    this.carregarEquipamentos();
  }

  carregarCategorias(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.categoriaService.listar().subscribe({
      next: (dados) => {
        this.categorias.set(dados);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar as categorias. Verifique se o backend está rodando.');
        this.carregando.set(false);
      }
    });
  }

  carregarEquipamentos(): void {
    this.equipamentoService.listar().subscribe({
      next: (dados) => this.equipamentos.set(dados),
      error: () => {}
    });
  }

  abrirNova(): void {
    if (!this.auth.ehAdmin()) return;
    this.categoriaEmEdicao.set(null);
    this.erro.set(null);
    this.modalAberto.set(true);
  }

  iniciarEdicao(categoria: CategoriaResponse): void {
    if (!this.auth.ehAdmin()) return;
    this.categoriaEmEdicao.set(categoria);
    this.erro.set(null);
    this.modalAberto.set(true);
  }

  fecharModal(): void {
    this.categoriaEmEdicao.set(null);
    this.modalAberto.set(false);
  }

  salvar({ id, payload }: { id: number | null; payload: CategoriaFormPayload }): void {
    if (!this.auth.ehAdmin()) return;

    this.erro.set(null);
    const requisicao = id !== null
      ? this.categoriaService.atualizar(id, payload)
      : this.categoriaService.criar(payload);

    requisicao.subscribe({
      next: () => {
        this.fecharModal();
        this.carregarCategorias();
      },
      error: (err) => {
        const fallback = id !== null ? 'Erro ao atualizar categoria.' : 'Erro ao cadastrar categoria.';
        this.erro.set(extrairMensagemErro(err, fallback));
      }
    });
  }

  solicitarExclusao(categoria: CategoriaResponse): void {
    if (!this.auth.ehAdmin()) return;
    this.erro.set(null);
    this.categoriaParaExcluir.set(categoria);
  }

  cancelarExclusao(): void {
    this.categoriaParaExcluir.set(null);
  }

  confirmarExclusao(): void {
    if (!this.auth.ehAdmin()) return;
    const alvo = this.categoriaParaExcluir();
    if (!alvo) return;

    this.categoriaParaExcluir.set(null);
    this.erro.set(null);

    this.categoriaService.deletar(alvo.id).subscribe({
      next: () => {
        if (this.categoriaEmEdicao()?.id === alvo.id) {
          this.fecharModal();
        }
        this.carregarCategorias();
      },
      error: (err) => {
        this.erro.set(extrairMensagemErro(err, 'Erro ao excluir categoria.'));
      }
    });
  }
}