export interface SupabaseErrorLike {
  message: string;
  code: string;
  details: string;
  hint: string;
}

/** Log padrão para erros do Supabase nos serviços do Playbook. */
export function logPlaybookError(label: string, error: SupabaseErrorLike) {
  console.error(label, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}
