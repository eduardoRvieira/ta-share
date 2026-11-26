export function normalizarTexto(valor: string | null | undefined): string {
  if (!valor) return '';
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function correspondeBusca(termo: string, ...campos: Array<string | null | undefined>): boolean {
  const busca = normalizarTexto(termo);
  if (!busca) return true;
  return campos.some((campo) => normalizarTexto(campo).includes(busca));
}