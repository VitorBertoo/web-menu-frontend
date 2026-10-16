import { ApiError } from "@/lib/api";

const MESSAGES: Record<string, string> = {
  conflict: "Já existe um registro com esses dados.",
  not_found: "Registro não encontrado.",
  validation_error: "Dados inválidos. Revise os campos.",
  unauthorized: "Sessão expirada. Entre novamente.",
  invalid_credentials: "E-mail ou senha inválidos.",
  invalid_status_transition: "Transição de status inválida.",
  invalid_table_session: "Sessão da mesa inválida ou já fechada.",
};

export function messageForError(
  error: unknown,
  fallback = "Algo deu errado. Tente novamente.",
): string {
  if (error instanceof ApiError) {
    return MESSAGES[error.code] ?? error.message ?? fallback;
  }
  return fallback;
}
