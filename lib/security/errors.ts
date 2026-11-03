// Converte erros do PostgREST/Postgres em mensagens seguras (sem detalhes internos).
type DbError = { code?: string; message?: string } | null | undefined;

const BY_MESSAGE: Array<[RegExp, string]> = [
  [/email not verified|verified session required/i, "Confirme seu e-mail antes de continuar."],
  [/rate limit/i, "Limite de criação atingido. Tente novamente mais tarde."],
  [/already a member/i, "Este e-mail já pertence a um membro da organização."],
  [/at least one owner/i, "A organização precisa manter ao menos um proprietário."],
  [/cannot change own role/i, "Você não pode alterar o próprio papel."],
  [/cannot grant|cannot manage/i, "Seu papel não permite esta alteração."],
  [/invitation not available|not pending/i, "Convite indisponível, expirado ou já utilizado."],
  [/owner must be a member/i, "O responsável precisa ser membro desta organização."],
];

export function safeDbMessage(error: DbError, fallback = "Não foi possível concluir a operação."): string {
  if (!error) return fallback;
  for (const [re, msg] of BY_MESSAGE) if (error.message && re.test(error.message)) return msg;
  switch (error.code) {
    case "42501":
      return "Você não tem permissão para esta ação.";
    case "23505":
      return "Já existe um registro com estes dados.";
    case "23514":
    case "22P02":
      return "Dados inválidos.";
    case "23503":
      return "Registro relacionado inválido.";
    default:
      return fallback;
  }
}
