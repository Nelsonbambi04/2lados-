# 🏗️ Dois Lados - Sistema de Gestão Corporativa

Sistema administrativo completo para o escritório de arquitetura e construção "Dois Lados" em Luanda, Angola.

## 📋 Índice

- [Características](#-características)
- [Stack Tecnológica](#-stack-tecnológica)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Modelos de Base de Dados](#-modelos-de-base-de-dados)
- [Frontend React](#-frontend-react)

---

## ✨ Características

- 🔐 **Autenticação Completa**: Registo, login, logout com Flask-Login
- 👨‍💼 **Gestão de Utilizadores**: Clientes e administradores
- 📁 **Gestão de Projetos**: CRUD completo com estados
- 📅 **Cronograma de Obras**: Fases e marcos
- 💰 **Sistema de Orçamentos**: Pedidos com notificação por e-mail
- 💬 **Mensagens de Contacto**: Formulário com gestão
- 🖼️ **Portfólio**: Galeria de projetos públicos
- 📧 **Notificações por E-mail**: SMTP Gmail configurado
- 📱 **API REST**: Pronto para integração com React

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Backend** | Flask 2.3+ (Python 3.10+) |
| **Base de Dados** | MySQL 8.0 + SQLAlchemy |
| **Autenticação** | Flask-Login + Werkzeug |
| **E-mail** | Flask-Mail + SMTP |
| **Frontend** | React + Vite + Tailwind CSS |
| **API** | Flask-CORS + JSON REST |

---

## 🚀 Instalação

### 1. Pré-requisitos

```bash
# Python 3.10+
python --version

# MySQL 8.0+
mysql --version

# Git
git --version
```

### 2. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/dois-lados.git
cd dois-lados
```

### 3. Criar Ambiente Virtual

```bash
# Linux/macOS
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 4. Instalar Dependências

```bash
pip install -r requirements.txt
```

### 5. Configurar Base de Dados MySQL

```sql
-- Aceder ao MySQL
mysql -u root -p

-- Criar base de dados
CREATE DATABASE dois_lados CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 6. Configurar Variáveis de Ambiente

```bash
# Copiar ficheiro de exemplo
cp .env.example .env

# Editar com as suas configurações
nano .env
```

**Conteúdo do `.env`:**

```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=sua-chave-secreta-min-32-caracteres

DATABASE_URL=mysql+pymysql://root:sua_password@localhost:3306/dois_lados?charset=utf8mb4

# Gmail App Password (ver secção Configuração de E-mail)
MAIL_USERNAME=nelsonbambi177@gmail.com
MAIL_PASSWORD=sua-app-password-do-gmail
ADMIN_EMAIL=nelsonbambi177@gmail.com
```

### 7. Executar Schema SQL

```bash
mysql -u root -p dois_lados < database/schema_dois_lados.sql
```

### 8. Iniciar o Servidor

```bash
python app.py
```

**Output esperado:**

```
=================================================
🏗️  DOIS LADOS - Sistema de Gestão
=================================================
🌐 URL: http://localhost:5000
👤 Admin: admin@doislados.co.ao / admin123
=================================================
```

---

## 📧 Configuração de E-mail (Gmail)

### Passo 1: Ativar Autenticação 2FA

1. Aceda a [Google Account Security](https://myaccount.google.com/security)
2. Ative "Autenticação em 2 fatores"

### Passo 2: Gerar App Password

1. Aceda a [App Passwords](https://myaccount.google.com/apppasswords)
2. Selecione "App" → "Other (Custom name)"
3. Digite "Dois Lados" e clique "Generate"
4. **Copie a password de 16 caracteres** (ex: `abcd efgh ijkl mnop`)

### Passo 3: Configurar no .env

```env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=seu-email@gmail.com
MAIL_PASSWORD=abcd efgh ijkl mnop  # <-- App Password, não a password normal
```

### Problemas Comuns

| Erro | Solução |
|------|---------|
| `SMTPAuthenticationError` | Verificar App Password está correta |
| `SMTPException: SSL required` | Alterar `MAIL_USE_SSL=True` |
| Email não chega | Verificar pasta de spam |

---

## 📁 Estrutura do Projeto

```
dois_lados/
├── app.py                     # Aplicação principal
├── config.py                  # Configurações Flask
├── models.py                  # Modelos SQLAlchemy
├── requirements.txt           # Dependências Python
├── .env.example               # Exemplo de variáveis ambiente
│
├── admin/
│   ├── __init__.py            # Blueprint admin
│   └── routes.py              # Todas as rotas da API
│
├── database/
│   └── schema_dois_lados.sql   # Schema MySQL completo
│
├── static/                    # Ficheiros estáticos
│   └── uploads/               # Uploads de utilizadores
│
└── templates/                # Templates Jinja2 (se necessário)
```

---

## 🌐 API Endpoints

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/register` | Registo de novo utilizador |
| POST | `/api/login` | Login |
| POST | `/api/logout` | Logout |
| GET | `/api/user` | Dados do utilizador atual |

### Públicos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/quotes` | Submeter orçamento |
| POST | `/api/contact` | Enviar mensagem |
| GET | `/api/portfolio` | Listar portfólio público |
| GET | `/api/projects/public` | Listar projetos públicos |

### Admin (Requer autenticação + is_admin=True)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/admin/dashboard` | Estatísticas |
| GET/POST | `/api/admin/projects` | Listar/Criar projetos |
| GET/PUT/DELETE | `/api/admin/projects/<id>` | Ver/Editar/Eliminar projeto |
| POST | `/api/admin/projects/<id>/phases` | Criar fase |
| PUT/DELETE | `/api/admin/phases/<id>` | Editar/Eliminar fase |
| GET | `/api/admin/quotes` | Listar orçamentos |
| PUT | `/api/admin/quotes/<id>` | Atualizar orçamento |
| GET | `/api/admin/messages` | Listar mensagens |
| GET/POST | `/api/admin/portfolio` | Listar/Criar itens |
| PUT/DELETE | `/api/admin/portfolio/<id>` | Editar/Eliminar item |
| GET | `/api/admin/users` | Listar utilizadores |
| PUT | `/api/admin/users/<id>` | Ativar/Desativar/Promover |

---

## 🗄️ Modelos de Base de Dados

### User
```python
id, username, email, password_hash, is_admin, is_active, created_at
```

### Project
```python
id, title, description, category, status, client_id, budget, 
location, area_sqm, start_date, end_date, created_at
```

### ProjectPhase
```python
id, project_id, phase_name, description, phase_order, 
start_date, end_date, status, created_at
```

### Quote
```python
id, client_name, client_email, client_phone, service_type, 
project_type, description, budget_range, location, 
status, admin_notes, created_at
```

### Message
```python
id, name, email, phone, subject, content, is_read, is_replied, created_at
```

### PortfolioItem
```python
id, title, description, category, image_url, thumbnail_url, 
location, area_sqm, year, is_featured, is_active, created_at
```

---

## 💻 Frontend React

O frontend React deve ser configurado no diretório `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

### Configuração da API no Frontend

```javascript
// src/services/api.js
const API_BASE = 'https://twolados.onrender.com/api';

export const api = {
  login: (data) => fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  
  register: (data) => fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  
  // ... outros métodos
};
```

---

## 🔒 Segurança

- ✅ Passwords encriptadas com PBKDF2-SHA256
- ✅ Proteção CSRF com Flask-WTF
- ✅ Variáveis de ambiente para segredos
- ✅ Validação de inputs server-side
- ✅ CORS configurado para origens permitidas
- ✅ Sessões seguras com cookies HttpOnly

---

## 📝 Logs de Alterações

### v1.0.0 (2024)
- Sistema inicial com autenticação
- CRUD completo de projetos
- Sistema de orçamentos com e-mail
- Cronograma de obras
- Gestão de portfólio
- Dashboard administrativo

---

## 📞 Suporte

**Dois Lados - Arquitetura e Construção**
- 📍 Luanda, Angola
- 📧 nelsonbambi177@gmail.com
- 📱 +244 XXX XXX XXX

---

**Desenvolvido com ❤️ para a Dois Lados**
