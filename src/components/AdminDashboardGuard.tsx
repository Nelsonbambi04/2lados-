import { PropsWithChildren } from "react";

type AdminDashboardGuardProps = PropsWithChildren<{
  user?: { is_admin?: boolean };
}>;

/**
 * Exibe o conteúdo apenas se user.is_admin === true.
 * Caso contrário, mostra uma mensagem simples.
 */
export function AdminDashboardGuard({ user, children }: AdminDashboardGuardProps) {
  if (!user?.is_admin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="rounded border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Acesso restrito a administradores.
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
