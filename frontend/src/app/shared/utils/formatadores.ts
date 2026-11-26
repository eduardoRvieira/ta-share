export function formatarDocumentoPorTipo(valor: string, tipo: 'PF' | 'PJ'): string {
  const digitos = valor.replace(/\D/g, '');

  if (tipo === 'PF') {
    const d = digitos.slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }

  const d = digitos.slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function formatarTelefoneBr(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function obterIniciais(nome: string): string {
  const limpo = nome?.trim();
  if (!limpo) return 'US';
  const partes = limpo.split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export function ehCnpj(documento: unknown): boolean {
  const digitos = documento ? String(documento).replace(/\D/g, '') : '';
  return digitos.length > 11;
}

export function formatarDocumentoComRotulo(documento: unknown): string {
  const doc = documento ? String(documento).trim() : '';
  if (!doc) return 'Não informado';
  const digitos = doc.replace(/\D/g, '');
  if (digitos.length === 14) {
    const cnpj = doc.includes('/')
      ? doc
      : `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12)}`;
    return `CNPJ ${cnpj}`;
  }
  const cpf = doc.includes('-')
    ? doc
    : digitos.length === 11
      ? `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`
      : doc;
  return `CPF ${cpf}`;
}

export function formatarDataIso(dataIso: string | null | undefined): string {
  if (!dataIso) return '—';
  const partes = dataIso.split('T')[0].split('-');
  if (partes.length !== 3) return dataIso;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export function isEmprestimoConcluido(status: string): boolean {
  return status === 'DEVOLVIDO' || status === 'CONCLUIDO';
}