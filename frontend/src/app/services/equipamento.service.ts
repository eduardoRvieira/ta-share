import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EquipamentoRequest, EquipamentoResponse } from '../models/equipamento.model';

@Injectable({ providedIn: 'root' })
export class EquipamentoService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/equipamentos';

  listar(): Observable<EquipamentoResponse[]> {
    return this.http.get<EquipamentoResponse[]>(this.url);
  }

  buscarPorId(id: number): Observable<EquipamentoResponse> {
    return this.http.get<EquipamentoResponse>(`${this.url}/${id}`);
  }

  criar(dto: EquipamentoRequest): Observable<EquipamentoResponse> {
    return this.http.post<EquipamentoResponse>(this.url, dto);
  }

  atualizar(id: number, dto: EquipamentoRequest): Observable<EquipamentoResponse> {
    return this.http.put<EquipamentoResponse>(`${this.url}/${id}`, dto);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
