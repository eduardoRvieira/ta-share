export interface UsuarioRequest {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  telefone?: string | null;
  perfil: string;
}

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  perfil: string;
  criadoEms: string;
}
