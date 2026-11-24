import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriaRequest, CategoriaResponse } from '../models/categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/categorias';

  listar(): Observable<CategoriaResponse[]> {
    return this.http.get<CategoriaResponse[]>(this.url);
  }

  buscarPorId(id: number): Observable<CategoriaResponse> {
    return this.http.get<CategoriaResponse>(`${this.url}/${id}`);
  }

  criar(dto: CategoriaRequest): Observable<CategoriaResponse> {
    return this.http.post<CategoriaResponse>(this.url, dto);
  }

  atualizar(id: number, dto: CategoriaRequest): Observable<CategoriaResponse> {
    return this.http.put<CategoriaResponse>(`${this.url}/${id}`, dto);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
