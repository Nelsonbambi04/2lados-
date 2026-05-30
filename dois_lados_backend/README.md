# 🏗️ Dois Lados - Sistema Backend

Backend completo em Flask para o sistema de gestão do escritório de arquitetura e construção **Dois Lados**.

---

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Execução](#-execução)
- [API Endpoints](#-api-endpoints)
- [Base de Dados](#-base-de-dados)
- [Credenciais Demo](#-credenciais-demo)

---

## ✨ Funcionalidades

### 🔐 Autenticação
- ✅ Login para admins e utilizadores
- ✅ Registo público (utilizadores normais)
- ✅ Registo de admins (apenas admins podem criar)
- ✅ Recuperação de password
- ✅ Sessões persistentes
- ✅ Proteção de rotas

### 📊 Dashboard Admin
- ✅ Estatísticas em tempo real
- ✅ Projetos recentes
- ✅ Orçamentos pendentes
- ✅ Mensagens não lidas
- ✅ Ações rápidas

### 📁 Gestão de Projetos
- ✅ CRUD completo
- ✅ Estados: Planeamento, Em Progresso, Concluído
- ✅ Categorias: Residencial, Comercial, Urbanismo
- ✅ Associação a clientes
- ✅ Orçamentos e datas

### 📅 Cronograma/Fases
- ✅ Criação de fases
- ✅ Gestão de datas
- ✅ Percentagem de progresso
- ✅ Estados por fase

### 💰 Orçamentos
- ✅ Listagem de pedidos
- ✅ Atualização de status
- ✅ Notas do administrador
- ✅ Notificações por email

### 💬 Mensagens
- ✅ Formulário de contacto
- ✅ Marcar como lida
- ✅ Responder mensagens
- ✅ Lista filtrada

### 🖼️ Portfólio
- ✅ CRUD de items
- ✅ Upload de imagens
- ✅ Categorização
- ✅ Projeto em destaque

---

## 📁 Estrutura do Projeto

```
dois_lados_backend/
├── app.py                 # Aplicação principal
├── config.py              # Configurações
├── models.py              # Modelos SQLAlchemy
├── requirements.txt       # Dependências Python
├── .env.example           # Exemplo de variáveis ambiente
│
├── auth/                  # Blueprint de autenticação
│   └── routes.py          # Login, logout, registo
│
├── admin/                 # Blueprint administrativo
│   └── routes.py          # Dashboard, CRUD, gestão
│
├── user/                  # Blueprint de utilizador
│   └── routes.py          # Área do cliente
│
├── templates/             # Templates HTML
│   ├── base.html
│   ├── auth/              # Login, registo
│   ├── admin/             # Dashboard, gestão
│   └── user/              # Área do cliente
│
└── database/
    ├── schema.sql         # Schema MySQL
    └── install.sh         # Script instalação
```

---

## 🚀 Instalação

### 1. Clonar/Entrar no diretório

```bash
cd dois_lados_backend
```

### 2. Criar ambiente virtual

```bash
# Linux/Mac
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 3. Instalar dependências

```bash
pip install -r requirements.txt
```

### 4. Configurar base de dados MySQL

```bash
# Aceder ao MySQL
mysql -u root -p

# Criar base de dados
CREATE DATABASE dois_lados CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Sair
EXIT;

# Importar schema (opcional - o Flask cria automaticamente)
mysql -u root -p dois_lados < database/schema.sql
```

### 5. Configurar variáveis ambiente

```bash
# Copiar exemplo
cp .env.example .env

# Editar com as suas configurações
nano .env
```

**Exemplo .env:**
```env
# Base de dados
DATABASE_URL=mysql+pymysql://avnadmin:SUA_PASSWORD_AIVEN@mysql-25d29d17-doislados.l.aivencloud.com:23198/defaultdb?charset=utf8mb4

# Segurança (gere uma chave única)
SECRET_KEY=gere-uma-chave-secreta-aqui

# Email (SMTP Gmail)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=seu_email@gmail.com
MAIL_PASSWORD=sua_app_password
SUBMISSION_EMAIL=doislados08@gmail.com
ADMIN_EMAIL=doislados08@gmail.com
APPLICATION_EMAIL=doislados08@gmail.com
CONTACT_EMAIL=doislados08@gmail.com
```

---

## ⚙️ Configuração

### Gmail App Password

Para enviar emails, precisa de criar uma **App Password**:

1. Aceda a [Google Account](https://myaccount.google.com)
2. → **Security** → **2-Step Verification** → Ativar
3. → **App Passwords** → Criar novo
4. Copiar a password de 16 caracteres gerada
5. Colocar no `.env` como `MAIL_PASSWORD`

### Configurações de Produção

```python
# config.py
class ProductionConfig(Config):
    DEBUG = False
    SESSION_COOKIE_SECURE = True  # HTTPS only
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
```

---

## ▶️ Execução

### Desenvolvimento

```bash
# Ativar ambiente virtual (se não estiver)
source venv/bin/activate

# Executar
python app.py
```

O servidor estará disponível em: **http://localhost:5000**

### Produção (Gunicorn)

```bash
# Instalar gunicorn
pip install gunicorn

# Executar
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## 🌐 API Endpoints

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registo público |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Dados do utilizador |

### Admin (requer auth + admin)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/admin/dashboard` | Estatísticas |
| GET/POST | `/api/admin/projects` | Listar/Criar projetos |
| GET/PUT/DELETE | `/api/admin/projects/<id>` | Ver/Editar/Eliminar |
| GET/POST | `/api/admin/projects/<id>/phases` | Gerir fases |
| GET | `/api/admin/quotes` | Listar orçamentos |
| PUT | `/api/admin/quotes/<id>/status` | Atualizar status |
| GET | `/api/admin/messages` | Listar mensagens |
| GET/POST | `/api/admin/portfolio` | Gerir portfólio |
| GET/POST | `/api/admin/users` | Gerir utilizadores |

### Pública

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/quotes` | Submeter orçamento |
| GET | `/api/public/portfolio` | Portfólio público |
| GET | `/api/public/services` | Serviços públicos |

---

## 🗄️ Base de Dados

### Modelos Principais

| Modelo | Tabela | Descrição |
|--------|--------|-----------|
| User | `users` | Utilizadores (admin/user) |
| Client | `clients` | Dados fiscais clientes |
| Project | `projects` | Projetos de arquitetura |
| ProjectPhase | `project_phases` | Fases do cronograma |
| Quote | `quotes` | Pedidos de orçamento |
| Message | `messages` | Mensagens contacto |
| PortfolioItem | `portfolio_items` | Items do portfólio |
| Service | `services` | Serviços oferecidos |
| Document | `documents` | Ficheiros/contratos |

### Diagram ER

```
users (1) ─── (1) clients
   │              │
   │              └────── (N) projects ──── (N) project_phases
   │
   └────── (N) quotes

messages ──── newsletter
    │
documents
```

---

## 🔑 Credenciais Demo

Após executar o projeto, os seguintes dados estarão disponíveis:

### Administrador
```
Email:    admin@doislados.co.ao
Password: admin123
```

### Utilizador/Cliente
```
Email:    joao.silva@email.com
Password: cliente123
```

---

## 📧 Notificações por Email

O sistema envia emails automáticos para `ADMIN_EMAIL` quando:

- ✅ Novo pedido de orçamento submetido
- ✅ Nova mensagem de contacto
- ✅ (Futuro) Orçamento aprovado/rejeitado

### Template de Email

Os emails são enviados em HTML com formatação profissional, incluindo:
- Cabeçalho com logo
- Detalhes do pedido
- Data e hora
- Link para painel admin

---

## 🔒 Segurança

- ✅ Passwords encriptadas (PBKDF2-SHA256)
- ✅ Sessões seguras
- ✅ Proteção CSRF
- ✅ Validação de inputs
- ✅ Rate limiting (recomendado: adicionar Flask-Limiter)
- ✅ SQL Injection prevention (SQLAlchemy ORM)

---

## 📝 Comandos Úteis

```bash
# Criar tabelas
with app.app_context():
    from models import db
    db.create_all()

# Seed data
with app.app_context():
    from models import seed_data
    seed_data()

# Reset base de dados
mysql -u root -p -e "DROP DATABASE dois_lados; CREATE DATABASE dois_lados;"
python app.py
```

---

## 🐛 Resolução de Problemas

### Erro "Module not found"
```bash
pip install -r requirements.txt
```

### Erro de conexão MySQL
```bash
# Verificar se MySQL está a correr
sudo systemctl status mysql

# Testar conexão
mysql -u root -p -e "SELECT 1"
```

### Erro ao enviar email
```bash
# Verificar credenciais Gmail
# Ativar 2FA na conta Google
# Gerar App Password (16 caracteres)
```

---

## 📞 Suporte

Para dúvidas ou problemas:
- Email: doislados08@gmail.com
- Projeto: Dois Lados - Arquitetura & Construção

---

**© 2024 Dois Lados - Luanda, Angola**
