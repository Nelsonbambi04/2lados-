# 📁 Estrutura do Banco de Dados - Dois Lados

## Arquivos Incluídos

| Arquivo | Descrição |
|---------|-----------|
| `schema_dois_lados.sql` | Schema completo com todas as tabelas |
| `queries_flask.py` | Queries SQL e exemplos de código Flask |

---

## 🚀 Instalação Rápida

### 1. Criar o Banco de Dados

```bash
# Acessar MySQL
mysql -u root -p

# Executar o schema
source schema_dois_lados.sql;
```

### 2. Verificar tabelas criadas

```sql
SHOW TABLES;
```

**Resultado esperado:**
```
+------------------------+
| Tables_in_dois_lados_db|
+------------------------+
| categorias             |
| clientes               |
| contactos              |
| documentos             |
| etapas_obra            |
| galeria_publica        |
| imagens_projetos       |
| logs_sistema           |
| newsletter             |
| projetos               |
| sessoes                |
| servicos               |
| servicos_detalhes      |
| config_sistema         |
| obras                  |
| cronograma_obra        |
| usuarios               |
+------------------------+
```

---

## 📊 Diagrama de Relacionamentos

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  USUARIOS   │────<│  CLIENTES   │────<│    OBRAS    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       │                                       │
       v                                       v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  SESSOES    │     │ PROJETOS    │────<│ ETAPAS_OBRA │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           │
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ CATEGORIAS  │────<│IMAGENS_PROJ │     │CRONOGRAMA   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           v
                    ┌─────────────┐
                    │  DOCUMENTOS │
                    └─────────────┘

┌─────────────┐     ┌─────────────┐
│  SERVICOS   │────<│SERV_Detalhes│
└─────────────┘     └─────────────┘

┌─────────────┐
│  CONTACTOS  │
└─────────────┘

┌─────────────┐
│ NEWSLETTER  │
└─────────────┘
```

---

## 🔐 Utilizadores Padrão

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@doislados.co.ao | admin123 |
| Cliente | joao.silva@email.com | cliente123 |

> ⚠️ **Importante:** As senhas estão hashed com bcrypt. Em produção, altere-as imediatamente!

---

## 📱 API Endpoints

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/login` | Login de utilizador |
| POST | `/api/logout` | Logout |
| POST | `/api/registar` | Registo de novo cliente |

### Projetos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/projetos` | Listar todos os projetos |
| GET | `/api/projetos/<slug>` | Detalhe de projeto |
| GET | `/api/projetos/destaque` | Projetos em destaque |
| GET | `/api/projetos/<categoria>` | Filtrar por categoria |

### Serviços
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/servicos` | Listar serviços |
| GET | `/api/servicos/<slug>` | Detalhe de serviço |

### Categorias
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/categorias` | Listar categorias |

### Contactos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/contactos` | Enviar mensagem |
| GET | `/api/admin/contactos` | Listar contactos (admin) |
| PUT | `/api/admin/contactos/<id>/lido` | Marcar como lido |

### Área do Cliente (Protegida)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/cliente/obras` | Listar obras do cliente |
| GET | `/api/cliente/obras/<id>/detalhe` | Detalhe de obra |
| GET | `/api/cliente/documentos` | Documentos do cliente |

### Admin Dashboard
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/admin/dashboard` | Estatísticas |

---

## 🔧 Configuração Flask

### Dependências

```bash
pip install flask flask-cors flask-mysql bcrypt
# ou com SQLAlchemy:
pip install flask flask-sqlalchemy flask-cors
```

### Configuração Mínima

```python
# config.py
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-change-in-prod'
    MYSQL_HOST = os.environ.get('MYSQL_HOST') or 'localhost'
    MYSQL_USER = os.environ.get('MYSQL_USER') or 'root'
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD') or ''
    MYSQL_DB = os.environ.get('MYSQL_DB') or 'dois_lados_db'
```

### Execução

```bash
cd database
python queries_flask.py
# ou integrar no seu app Flask principal
```

---

## 📝 Queries Úteis

### Ver todas as obras em andamento
```sql
SELECT o.nome_obra, o.progresso, o.status_obra, c.nome as cliente
FROM obras o
JOIN clientes c ON o.id_cliente = c.id_cliente
WHERE o.status_obra IN ('em_execucao', 'em_preparacao');
```

### Projetos por categoria com imagens
```sql
SELECT p.titulo, p.localizacao, c.nome as categoria,
       (SELECT url_imagem FROM imagens_projetos WHERE id_projeto = p.id_projeto LIMIT 1) as imagem
FROM projetos p
JOIN categorias c ON p.id_categoria = c.id_categoria
WHERE p.status_projeto = 'concluido'
ORDER BY c.ordem, p.ano_conclusao DESC;
```

### Estatísticas gerais
```sql
SELECT 
    (SELECT COUNT(*) FROM projetos) as total_projetos,
    (SELECT COUNT(*) FROM usuarios WHERE tipo_usuario = 'cliente') as total_clientes,
    (SELECT COUNT(*) FROM obras WHERE status_obra = 'em_execucao') as obras_em_curso,
    (SELECT COUNT(*) FROM contactos WHERE lido = FALSE) as mensagens_pendentes;
```

### Consultar obras de um cliente
```sql
SELECT * FROM obras WHERE id_cliente = ? ORDER BY data_criacao DESC;
```

---

## 🔒 Segurança

###Boas Práticas Implementadas:

1. **Senhas** - Hash com bcrypt (nunca guardar em texto plano)
2. **SQL Injection** - Queries parametrizadas
3. **Sessions** - Tokens com expiração
4. **CORS** - Configuração para origens permitidas
5. **Validação** - Verificação de inputs em todas as rotas

### Recomendado para Produção:

```python
# Usar variáveis de ambiente
import os

app.config['MYSQL_PASSWORD'] = os.environ['DB_PASSWORD']
app.config['SECRET_KEY'] = os.environ['SECRET_KEY']

# HTTPS forçado
@app.before_request
def https_redirect():
    if os.environ.get('FLASK_ENV') == 'production':
        if request.is_secure:
            return
        return redirect(request.url.replace('http://', 'https://'))
```

---

## 📞 Suporte

Para dúvidas sobre a estrutura do banco:
- Email: info@doislados.co.ao
- Tel: +244 928 035 347

---

**Versão:** 1.0  
**Última Atualização:** 2026
