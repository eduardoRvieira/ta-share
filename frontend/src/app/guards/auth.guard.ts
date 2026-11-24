import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const sessao = localStorage.getItem('ta_share_usuario');

  if (sessao) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
