import { Component, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutService } from '../../services/layout.service';
import { AuthService } from '../../services/auth.service';

interface ItemNavegacao {
  rota: string;
  rotulo: string;
  icone: 'equipamentos' | 'emprestimos' | 'usuarios' | 'categorias';
}

interface SecaoNavegacao {
  titulo: string;
  itens: ItemNavegacao[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html'
})
export class Sidebar {
  readonly layout = inject(LayoutService);
  readonly auth = inject(AuthService);

  readonly secoes: SecaoNavegacao[] = [
    {
      titulo: 'Principal',
      itens: [
        { rota: '/equipamentos', rotulo: 'Equipamentos', icone: 'equipamentos' },
        { rota: '/emprestimos', rotulo: 'Empréstimos', icone: 'emprestimos' }
      ]
    },
    {
      titulo: 'Cadastros',
      itens: [
        { rota: '/usuarios', rotulo: 'Usuários', icone: 'usuarios' },
        { rota: '/categorias', rotulo: 'Categorias', icone: 'categorias' }
      ]
    }
  ];

  @HostListener('document:keydown.escape')
  aoPressionarEsc(): void {
    if (this.layout.menuAberto()) {
      this.layout.fecharMenuMobile();
    }
  }
}