import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Equipamentos } from './pages/equipamentos/equipamentos';
import { Categorias } from './pages/categorias/categorias';
import { Emprestimos } from './pages/emprestimos/emprestimos';
import { Usuarios } from './pages/usuarios/usuarios';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'equipamentos', component: Equipamentos, canActivate: [authGuard] },
  { path: 'categorias', component: Categorias, canActivate: [authGuard] },
  { path: 'emprestimos', component: Emprestimos, canActivate: [authGuard] },
  { path: 'usuarios', component: Usuarios, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
