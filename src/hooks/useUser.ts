import { useEffect, useState } from "react";

type User = {
  id: number;
  username: string;
  email: string;
  is_admin?: boolean;
};

/**
 * Hook simples que lê a sessão armazenada em localStorage (defina em login).
 * Ajuste conforme o fluxo real de autenticação.
 */
export default function useUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("dl_user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
  }, []);

  return { user };
}
