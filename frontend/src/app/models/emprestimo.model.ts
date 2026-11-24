export interface EmprestimoRequest {
  usuarioId: number;
  equipamentoId: number;
  dataEmprestimo?: string | null;
  dataDevolucaoPrevista: string;
  dataDevolucaoReal?: string | null;
  status: string;
  observacoes?: string | null;
}

export interface EmprestimoResponse {
  id: number;
  usuarioId: number;
  usuarioNome: string;
  equipamentoId: number;
  equipamentoNome: string;
  dataEmprestimo: string | null;
  dataDevolucaoPrevista: string;
  dataDevolucaoReal: string | null;
  status: string;
  observacoes: string | null;
}
