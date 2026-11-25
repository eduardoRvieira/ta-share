import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { UsuarioRequest, UsuarioResponse } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/usuarios';

  listar(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(this.url);
  }

  buscarPorId(id: number): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.url}/${id}`);
  }

  criar(dto: UsuarioRequest): Observable<UsuarioResponse> {
    return this.http
      .post<UsuarioResponse>(this.url, dto)
      .pipe(catchError((err) => this.formatarErro(err, 'Erro ao cadastrar usuário.')));
  }

  atualizar(id: number, dto: UsuarioRequest): Observable<UsuarioResponse> {
    return this.http
      .put<UsuarioResponse>(`${this.url}/${id}`, dto)
      .pipe(catchError((err) => this.formatarErro(err, 'Erro ao atualizar usuário.')));
  }

  deletar(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.url}/${id}`)
      .pipe(catchError((err) => this.formatarErro(err, 'Não foi possível excluir este usuário.')));
  }

  private formatarErro(err: HttpErrorResponse, fallback: string): Observable<never> {
    const msgBruta = String(err?.error?.message || err?.message || '').toLowerCase();
    let mensagem = err?.error?.message || fallback;

    if (msgBruta.includes('usuarios.cpf') || (msgBruta.includes('duplicate') && msgBruta.includes('cpf'))) {
      mensagem = 'Este CPF/CNPJ já está cadastrado no sistema.';
    } else if (msgBruta.includes('usuarios.email') || (msgBruta.includes('duplicate') && msgBruta.includes('email'))) {
      mensagem = 'Este e-mail já está cadastrado no sistema.';
    } else if (msgBruta.includes('duplicate')) {
      mensagem = 'Já existe um registro com esses dados no sistema.';
    } else if (msgBruta.includes('foreign key') || msgBruta.includes('constraint') || msgBruta.includes('emprestimos')) {
      mensagem = 'Não é possível excluir este usuário porque existem empréstimos vinculados a ele.';
    }

    return throwError(() => ({ ...err, error: { ...err?.error, message: mensagem } }));
  }
}