import { Routes } from '@angular/router';
import { Equipamentos } from './pages/equipamentos/equipamentos';
import { Categorias } from './pages/categorias/categorias';
import { Emprestimos } from './pages/emprestimos/emprestimos';
import { Usuarios } from './pages/usuarios/usuarios';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: '', redirectTo: 'equipamentos', pathMatch: 'full' },
  { path: 'equipamentos', component: Equipamentos },
  { path: 'categorias', component: Categorias },
  { path: 'emprestimos', component: Emprestimos },
  { path: 'usuarios', component: Usuarios },
  { path: 'login', component: Login },
  { path: '**', redirectTo: 'equipamentos' }
];
