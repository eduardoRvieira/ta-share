export function extrairMensagemErro(
  err: any,
  fallback: string,
  tipoPessoa: 'PF' | 'PJ' = 'PF'
): string {
  const msgBruta = String(err?.error?.message || err?.message || '').toLowerCase();

  if (msgBruta.includes('usuarios.cpf') || (msgBruta.includes('duplicate') && msgBruta.includes('cpf'))) {
    return `Este ${tipoPessoa === 'PF' ? 'CPF' : 'CNPJ'} já está cadastrado no sistema.`;
  }

  if (msgBruta.includes('usuarios.email') || (msgBruta.includes('duplicate') && msgBruta.includes('email'))) {
    return 'Este e-mail já está cadastrado no sistema.';
  }

  if (msgBruta.includes('duplicate')) {
    return 'Já existe um registro com esses dados no sistema.';
  }

  return err?.error?.message || fallback;
}