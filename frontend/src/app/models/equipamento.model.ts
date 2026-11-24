export interface EquipamentoRequest {
  nome: string;
  patrimonio: string;
  categoriaId: number;
  estadoConservacao: string;
  statusItem: string;
  descricao?: string | null;
}

export interface EquipamentoResponse {
  id: number;
  nome: string;
  patrimonio: string;
  categoriaId: number;
  categoriaNome: string;
  estadoConservacao: string;
  statusItem: string;
  descricao: string | null;
  criadoEm: string;
}
