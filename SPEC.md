# Dois Lados - Sistema de Gestão Corporativa

## 1. Concept & Vision

Sistema administrativo completo para o escritório de arquitetura e construção "Dois Lados" em Luanda. A aplicação permite gestão de clientes, projetos, orçamentos e comunicação eficiente com clientes. Interface profissional que transmite confiança e organização técnica.

---

## 2. Architecture

### Stack Tecnológica
- **Backend**: Flask 2.3+ (Python 3.10+)
- **Base de Dados**: MySQL 8.0 + SQLAlchemy
- **Frontend**: React + Vite + Tailwind CSS
- **Autenticação**: Flask-Login + Werkzeug
- **E-mail**: Flask-Mail + SMTP Gmail

### Estrutura de Ficheiros
```
dois_lados/
├── app.py                    # Aplicação principal
├── config.py                 # Configurações
├── models.py                 # Modelos SQLAlchemy
├── requirements.txt          # Dependências Python
├── .env.example              # Variáveis de ambiente
├── admin/
│   ├── __init__.py           # Blueprint admin
│   └── routes.py             # Todas as rotas
├── database/
│   ├── schema_dois_lados.sql # Schema MySQL
│   └── seed_data.sql         # Dados iniciais
└── templates/                # Templates Jinja2 (opcional)
```

---

## 3. Database Schema

### Tabela: users
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT PK AUTO_INCREMENT | ID único |
| username | VARCHAR(80) UNIQUE | Nome de utilizador |
| email | VARCHAR(120) UNIQUE | Email (login) |
| password_hash | VARCHAR(256) | Password encriptada |
| is_admin | BOOLEAN | Permissão admin |
| is_active | BOOLEAN | Conta ativa |
| created_at | DATETIME | Data de registo |

### Tabela: projects
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT PK AUTO_INCREMENT | ID único |
| title | VARCHAR(200) | Título do projeto |
| description | TEXT | Descrição |
| category | ENUM | residencial/comercial/urbanismo |
| status | ENUM | orcamento/em_progresso/concluido |
| client_id | INT FK | Cliente associado |
| budget | DECIMAL | Orçamento |
| start_date | DATE | Data início |
| end_date | DATE | Data fim |
| created_at | DATETIME | Data criação |

### Tabela: quotes (Orçamentos)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT PK AUTO_INCREMENT | ID único |
| client_name | VARCHAR(100) | Nome do cliente |
| client_email | VARCHAR(120) | Email |
| client_phone | VARCHAR(20) | Telefone |
| service_type | VARCHAR(50) | Tipo de serviço |
| project_type | VARCHAR(50) | Tipologia projeto |
| description | TEXT | Descrição do pedido |
| budget_range | VARCHAR(50) | Intervalo orçamental |
| status | ENUM | pendente/analise/aprovado/rejeitado |
| created_at | DATETIME | Data pedido |

### Tabela: project_phases
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT PK AUTO_INCREMENT | ID único |
| project_id | INT FK | Projeto pai |
| phase_name | VARCHAR(100) | Nome da fase |
| description | TEXT | Descrição |
| start_date | DATE | Data início |
| end_date | DATE | Data fim |
| status | ENUM | pendente/em_progresso/concluido |

### Tabela: messages
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT PK AUTO_INCREMENT | ID único |
| name | VARCHAR(100) | Nome remetente |
| email | VARCHAR(120) | Email remetente |
| subject | VARCHAR(200) | Assunto |
| content | TEXT | Mensagem |
| is_read | BOOLEAN | Lida |
| created_at | DATETIME | Data envio |

### Tabela: portfolio_items
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT PK AUTO_INCREMENT | ID único |
| title | VARCHAR(200) | Título |
| description | TEXT | Descrição |
| category | VARCHAR(50) | Categoria |
| image_url | VARCHAR(500) | URL imagem |
| location | VARCHAR(100) | Localização |
| area_sqm | DECIMAL | Área m² |
| created_at | DATETIME | Data criação |

---

## 4. API Routes

### Autenticação (Público)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/register | Registo de novo utilizador |
| POST | /api/login | Login |
| POST | /api/logout | Logout |
| GET | /api/user | Dados utilizador atual |

### Públicos
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/quotes | Submeter orçamento |
| GET | /api/projects | Listar projetos públicos |
| GET | /api/portfolio | Listar portfólio |

### Admin (Protegido)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/admin/dashboard | Stats dashboard |
| CRUD | /api/admin/projects | Gerir projetos |
| CRUD | /api/admin/quotes | Gerir orçamentos |
| CRUD | /api/admin/phases | Gerir fases |
| CRUD | /api/admin/portfolio | Gerir portfólio |
| CRUD | /api/admin/messages | Ver mensagens |
| CRUD | /api/admin/users | Gerir utilizadores |

---

## 5. E-mail Configuration

### SMTP Gmail
```
MAIL_SERVER = smtp.gmail.com
MAIL_PORT = 587
MAIL_USE_TLS = True
MAIL_USERNAME = nelsonbambi177@gmail.com
MAIL_PASSWORD = <app_password>
ADMIN_EMAIL = nelsonbambi177@gmail.com
```

### Templates de E-mail
1. **Novo Orçamento**: Notifica admin com detalhes
2. **Nova Mensagem**: Notifica admin
3. **Status Projeto**: Notifica cliente

---

## 6. Security

- Passwords encriptadas com Werkzeug (pbkdf2:sha256)
- CSRF Protection via Flask-WTF
- Rate limiting em rotas de autenticação
- Sessões seguras com Flask-Session
- Variáveis de ambiente para segredos
