#!/bin/bash
# ============================================
# Script de Instalação - Dois Lados
# ============================================
# Executar: bash install.sh
# ============================================

set -e

echo "============================================"
echo "🏗️  DOIS LADOS - Instalação do Sistema"
echo "============================================"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para exibir mensagens
info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 1. Verificar Python
info "Verificando Python..."
if ! command -v python3 &> /dev/null; then
    error "Python3 não encontrado. Instale o Python 3.10+."
fi
python3 --version

# 2. Verificar MySQL
info "Verificando MySQL..."
if ! command -v mysql &> /dev/null; then
    warn "MySQL não encontrado. Instale o MySQL 8.0+."
fi

# 3. Criar ambiente virtual
info "Criando ambiente virtual..."
if [ -d "venv" ]; then
    warn "Ambiente virtual já existe."
else
    python3 -m venv venv
    info "Ambiente virtual criado."
fi

# 4. Ativar venv e instalar dependências
info "Instalando dependências..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
info "Dependências instaladas."

# 5. Criar ficheiro .env
info "Configurando variáveis de ambiente..."
if [ -f ".env" ]; then
    warn ".env já existe. A criar backup..."
    cp .env .env.backup
fi

cat > .env << 'EOF'
# Flask
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=change-this-to-a-secure-random-key-in-production

# Base de Dados - MySQL Aiven
DATABASE_URL=mysql+pymysql://avnadmin:AVNS_eQhiBribmrQySa_9shY@mysql-25d29d17-doislados.l.aivencloud.com:23198/defaultdb?charset=utf8mb4

# E-mail - Gmail App Password
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=doislados08@gmail.com
MAIL_PASSWORD=your-app-password-here
MAIL_DEFAULT_SENDER=doislados08@gmail.com
SUBMISSION_EMAIL=doislados08@gmail.com
ADMIN_EMAIL=doislados08@gmail.com
APPLICATION_EMAIL=doislados08@gmail.com
CONTACT_EMAIL=doislados08@gmail.com
EOF

info ".env criado."

# 6. Configurar MySQL
echo ""
echo "============================================"
echo "📊 CONFIGURAÇÃO DA BASE DE DADOS"
echo "============================================"
echo "Por favor, execute os seguintes comandos no MySQL:"
echo ""
echo "  mysql -u root -p"
echo "  CREATE DATABASE dois_lados CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "  EXIT;"
echo ""
echo "Depois execute:"
echo "  mysql -u root -p dois_lados < database/schema_dois_lados.sql"
echo ""
read -p "Pressione ENTER quando tiver criado a base de dados..."

# 7. Testar ligação
info "Testando configuração..."
python3 -c "
from app import create_app
app = create_app()
with app.app_context():
    from models import db, User
    admin = User.query.filter_by(email='admin@doislados.co.ao').first()
    if admin:
        print('✅ Base de dados OK - Admin encontrado')
    else:
        print('✅ Base de dados OK - Admin será criado')
"

# 8. Instruções finais
echo ""
echo "============================================"
echo "✅ INSTALAÇÃO CONCLUÍDA!"
echo "============================================"
echo ""
echo "Próximos passos:"
echo ""
echo "1. Configure o .env com as suas credenciais"
echo ""
echo "2. Para iniciar o servidor:"
echo "   source venv/bin/activate"
echo "   python app.py"
echo ""
echo "3. Aceda a http://localhost:5000"
echo ""
echo "4. Login Admin:"
echo "   Email: admin@doislados.co.ao"
echo "   Password: admin123"
echo ""
echo "============================================"
