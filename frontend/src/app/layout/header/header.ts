import { Component, computed, inject } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { TemaService } from '../../services/tema.service';
import { AuthService } from '../../services/auth.service';
import { obterIniciais } from '../../shared/utils/formatadores';

const ROTULOS_PERFIL: Record<string, string> = {
  ADMIN: 'Administrador',
  PROFISSIONAL: 'Profissional',
  BENEFICIARIO: 'Beneficiário'
};

@Component({
  selector: 'app-header',
  templateUrl: './header.html'
})
export class Header {
  readonly layout = inject(LayoutService);
  readonly tema = inject(TemaService);
  readonly auth = inject(AuthService);

  readonly iniciaisUsuario = computed(() => obterIniciais(this.auth.usuario()?.nome ?? ''));
  readonly perfilFormatado = computed(() => {
    const perfil = this.auth.usuario()?.perfil ?? '';
    return ROTULOS_PERFIL[perfil] ?? perfil;
  });
}