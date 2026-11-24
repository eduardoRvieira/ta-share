export interface CategoriaRequest {
  nome: string;
  descricao?: string | null;
}

export interface CategoriaResponse {
  id: number;
  nome: string;
  descricao: string | null;
}
