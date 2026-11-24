import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmprestimoRequest, EmprestimoResponse } from '../models/emprestimo.model';

@Injectable({ providedIn: 'root' })
export class EmprestimoService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/emprestimos';

  listar(): Observable<EmprestimoResponse[]> {
    return this.http.get<EmprestimoResponse[]>(this.url);
  }

  buscarPorId(id: number): Observable<EmprestimoResponse> {
    return this.http.get<EmprestimoResponse>(`${this.url}/${id}`);
  }

  criar(dto: EmprestimoRequest): Observable<EmprestimoResponse> {
    return this.http.post<EmprestimoResponse>(this.url, dto);
  }

  atualizar(id: number, dto: EmprestimoRequest): Observable<EmprestimoResponse> {
    return this.http.put<EmprestimoResponse>(`${this.url}/${id}`, dto);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}s
