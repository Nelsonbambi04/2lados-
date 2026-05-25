"""
Utilitário para criar/forçar o utilizador admin@doislados.co.ao como administrador ativo.

Uso:
  # op1: passando a password por variável de ambiente (recomendado para CI/segredo)
  $ set ADMIN_PASSWORD=SUA_SENHA_AQUI   # Windows PowerShell: $env:ADMIN_PASSWORD="..."
  $ python create_admin.py

  # op2: sem variável, o script vai pedir a senha no terminal (input oculto).
"""

import os
import getpass
from werkzeug.security import generate_password_hash

from app import create_app
from models import db, User


def main():
    password = os.environ.get("ADMIN_PASSWORD")
    if not password:
        password = getpass.getpass("Digite a senha para admin@doislados.co.ao: ").strip()
        if not password:
            print("Senha vazia - operação cancelada.")
            return

    app = create_app()
    with app.app_context():
        user = User.query.filter_by(email="admin@doislados.co.ao").first()
        if not user:
            user = User(
                username="admin",
                email="admin@doislados.co.ao",
                is_admin=True,
                is_active=True,
            )
            user.password_hash = generate_password_hash(password)
            db.session.add(user)
            action = "criado"
        else:
            user.is_admin = True
            user.is_active = True
            user.password_hash = generate_password_hash(password)
            action = "atualizado"

        db.session.commit()
        print(f"Usuário admin@doislados.co.ao {action} com sucesso (is_admin=True, is_active=True).")


if __name__ == "__main__":
    main()
