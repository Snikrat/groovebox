// Só aceita caminhos internos, para que ?next= não redirecione para outro site.
export function safeRedirectPath(next: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}
