export interface AnexoPdfSimulado {
  nome: string;
  tamanhoFormatado: string;
  simulado: boolean;
}

const LIMITE_10_MB = 10 * 1024 * 1024;

export function validarArquivoPdf(file: File): { anexo?: AnexoPdfSimulado; erro?: string } {
  const ehPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!ehPdf) {
    return { erro: 'Selecione apenas arquivos no formato .pdf.' };
  }

  if (file.size > LIMITE_10_MB) {
    return { erro: 'O arquivo ultrapassa o limite máximo de 10 MB.' };
  }

  const mb = (file.size / (1024 * 1024)).toFixed(1).replace('.', ',');
  return {
    anexo: {
      nome: file.name,
      tamanhoFormatado: `${mb} MB`,
      simulado: false
    }
  };
}

export const ANEXO_CFM_PADRAO: AnexoPdfSimulado = {
  nome: 'certidao_regularidade_cfm.pdf',
  tamanhoFormatado: '1,4 MB',
  simulado: true
};

export const ANEXO_CADUNICO_PADRAO: AnexoPdfSimulado = {
  nome: 'comprovante_cadunico_renda.pdf',
  tamanhoFormatado: '2,1 MB',
  simulado: true
};