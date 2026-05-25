"""
=====================================================
DOIS LADOS - Queries para Backend Flask/Python
=====================================================
Arquivo com queries SQL e funções de acesso ao banco
Versão: 1.0
"""

# =====================================================
# CONEXÃO COM BANCO DE DADOS
# =====================================================

# config.py
"""
from flask import Flask
from flask_mysqldb import MySQL

app = Flask(__name__)
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'seu_usuario'
app.config['MYSQL_PASSWORD'] = 'sua_senha'
app.config['MYSQL_DB'] = 'dois_lados_db'

mysql = MySQL(app)
"""

# =====================================================
# AUTENTICAÇÃO E USUÁRIOS
# =====================================================

QUERY_LOGIN = """
SELECT u.id_usuario, u.nome, u.email, u.tipo_usuario, u.status_conta, 
       c.id_cliente, c.nif, c.morada
FROM usuarios u
LEFT JOIN clientes c ON u.id_usuario = c.id_usuario
WHERE u.email = %s AND u.password_hash = %s
"""

QUERY_CRIAR_USUARIO = """
INSERT INTO usuarios (nome, email, telefone, password_hash, tipo_usuario)
VALUES (%s, %s, %s, %s, 'cliente')
"""

QUERY_ATUALIZAR_ULTIMO_LOGIN = """
UPDATE usuarios SET ultimo_login = NOW() WHERE id_usuario = %s
"""

# =====================================================
# PROJETOS E PORTFÓLIO
# =====================================================

QUERY_LISTAR_PROJETOS = """
SELECT p.*, c.nome as categoria_nome, c.slug as categoria_slug
FROM projetos p
LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
WHERE p.status_projeto = 'concluido'
ORDER BY p.ano_conclusao DESC, p.data_criacao DESC
"""

QUERY_PROJETO_POR_SLUG = """
SELECT p.*, c.nome as categoria_nome, 
       (SELECT url_imagem FROM imagens_projetos WHERE id_projeto = p.id_projeto LIMIT 1) as imagem_principal
FROM projetos p
LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
WHERE p.slug = %s
"""

QUERY_PROJETOS_POR_CATEGORIA = """
SELECT p.*, c.nome as categoria_nome
FROM projetos p
LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
WHERE c.slug = %s AND p.status_projeto = 'concluido'
ORDER BY p.ano_conclusao DESC
"""

QUERY_PROJETOS_DESTAQUE = """
SELECT p.*, c.nome as categoria_nome
FROM projetos p
LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
WHERE p.destaque = TRUE
ORDER BY p.data_criacao DESC
LIMIT 6
"""

QUERY_IMAGENS_PROJETO = """
SELECT * FROM imagens_projetos WHERE id_projeto = %s ORDER BY ordem ASC
"""

# =====================================================
# SERVIÇOS
# =====================================================

QUERY_LISTAR_SERVICOS = """
SELECT * FROM servicos WHERE status = 'ativo' ORDER BY ordem ASC
"""

QUERY_SERVICO_POR_SLUG = """
SELECT s.*, 
       (SELECT JSON_ARRAYAGG(
           JSON_OBJECT('id', id_detalhe, 'titulo', titulo, 'descricao', descricao, 'icone', icone)
       ) FROM servicos_detalhes WHERE id_servico = s.id_servico) as detalhes
FROM servicos s
WHERE s.slug = %s AND s.status = 'ativo'
"""

# =====================================================
# CATEGORIAS
# =====================================================

QUERY_LISTAR_CATEGORIAS = """
SELECT c.*, COUNT(p.id_projeto) as total_projetos
FROM categorias c
LEFT JOIN projetos p ON c.id_categoria = p.id_categoria AND p.status_projeto = 'concluido'
WHERE c.status = 'ativa'
GROUP BY c.id_categoria
ORDER BY c.ordem ASC
"""

# =====================================================
# OBRAS DOS CLIENTES
# =====================================================

QUERY_LISTAR_OBRAS_CLIENTE = """
SELECT o.*, p.titulo as projeto_titulo, p.slug as projeto_slug,
       (SELECT COUNT(*) FROM etapas_obra WHERE id_obra = o.id_obra AND status = 'concluida') as etapas_concluidas,
       (SELECT COUNT(*) FROM etapas_obra WHERE id_obra = o.id_obra) as total_etapas
FROM obras o
JOIN projetos p ON o.id_projeto = p.id_projeto
WHERE o.id_cliente = %s
ORDER BY o.data_criacao DESC
"""

QUERY_OBRAS_EM_ANDAMENTO = """
SELECT o.*, p.titulo as projeto_titulo,
       e.nome as etapa_atual,
       e.progresso as etapa_progresso
FROM obras o
JOIN projetos p ON o.id_projeto = p.id_projeto
LEFT JOIN etapas_obra e ON o.id_obra = e.id_obra AND e.status = 'em_andamento'
WHERE o.id_cliente = %s AND o.status_obra IN ('em_execucao', 'em_preparacao')
ORDER BY o.data_criacao DESC
"""

QUERY_ETAPAS_OBRA = """
SELECT * FROM etapas_obra WHERE id_obra = %s ORDER BY ordem ASC
"""

QUERY_CRONOGRAMA_OBRA = """
SELECT * FROM cronograma_obra WHERE id_obra = %s ORDER BY data_prevista ASC
"""

# =====================================================
# CONTACTOS
# =====================================================

QUERY_CRIAR_CONTACTO = """
INSERT INTO contactos (nome, email, telefone, assunto, mensagem, ip_origem)
VALUES (%s, %s, %s, %s, %s, %s)
"""

QUERY_LISTAR_CONTACTOS = """
SELECT * FROM contactos ORDER BY lido ASC, data_criacao DESC
"""

QUERY_CONTACTOS_NAO_LIDOS = """
SELECT COUNT(*) as total FROM contactos WHERE lido = FALSE
"""

# =====================================================
# DOCUMENTOS
# =====================================================

QUERY_DOCUMENTOS_CLIENTE = """
SELECT d.*, o.nome_obra
FROM documentos d
LEFT JOIN obras o ON d.id_obra = o.id_obra
WHERE d.id_cliente = %s AND d.visivel_cliente = TRUE
ORDER BY d.data_criacao DESC
"""

QUERY_DOCUMENTOS_OBRA = """
SELECT * FROM documentos WHERE id_obra = %s ORDER BY data_criacao DESC
"""

# =====================================================
# DASHBOARD / ESTATÍSTICAS
# =====================================================

QUERY_ESTATISTICAS_DASHBOARD = """
SELECT 
    (SELECT COUNT(*) FROM projetos WHERE status_projeto = 'concluido') as projetos_concluidos,
    (SELECT COUNT(*) FROM projetos WHERE status_projeto = 'em_execucao') as projetos_em_curso,
    (SELECT COUNT(*) FROM obras WHERE status_obra = 'em_execucao') as obras_em_andamento,
    (SELECT COUNT(*) FROM contactos WHERE lido = FALSE) as contactos_pendentes,
    (SELECT COUNT(*) FROM clientes) as total_clientes
"""

QUERY_PROGRESSO_GERAL = """
SELECT 
    AVG(progresso) as progresso_medio
FROM obras
WHERE status_obra = 'em_execucao'
"""

# =====================================================
# EXEMPLOS DE FUNÇÕES FLASK
# =====================================================

"""
# app.py - Flask completo

from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS
from functools import wraps
import MySQL.cursors
import hashlib
import re

app = Flask(__name__)
app.secret_key = 'sua_chave_secreta_aqui'
CORS(app)

# Configuração MySQL
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'dois_lados_db'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

mysql = MySQL(app)


# =====================================================
# DECORATORS DE AUTENTICAÇÃO
# =====================================================

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'usuario_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'usuario_id' not in session:
            return redirect(url_for('login'))
        if session.get('tipo_usuario') != 'admin':
            return jsonify({'erro': 'Acesso não autorizado'}), 403
        return f(*args, **kwargs)
    return decorated_function


# =====================================================
# ROTAS DE AUTENTICAÇÃO
# =====================================================

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'erro': 'Email e senha são obrigatórios'}), 400
    
    # Hash da senha (substituir por bcrypt em produção)
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    cursor = mysql.connection.cursor()
    cursor.execute(QUERY_LOGIN, (email, password_hash))
    usuario = cursor.fetchone()
    cursor.close()
    
    if usuario:
        if usuario['status_conta'] != 'ativa':
            return jsonify({'erro': 'Conta inativa ou bloqueada'}), 401
        
        session['usuario_id'] = usuario['id_usuario']
        session['nome'] = usuario['nome']
        session['email'] = usuario['email']
        session['tipo_usuario'] = usuario['tipo_usuario']
        session['cliente_id'] = usuario.get('id_cliente')
        
        # Atualizar último login
        cursor = mysql.connection.cursor()
        cursor.execute(QUERY_ATUALIZAR_ULTIMO_LOGIN, (usuario['id_usuario'],))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({
            'mensagem': 'Login realizado com sucesso',
            'usuario': {
                'id': usuario['id_usuario'],
                'nome': usuario['nome'],
                'email': usuario['email'],
                'tipo': usuario['tipo_usuario']
            }
        })
    
    return jsonify({'erro': 'Credenciais inválidas'}), 401


@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'mensagem': 'Logout realizado'})


@app.route('/api/registar', methods=['POST'])
def api_registar():
    data = request.get_json()
    
    # Validações
    if not all(k in data for k in ['nome', 'email', 'password']):
        return jsonify({'erro': 'Dados incompletos'}), 400
    
    if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', data['email']):
        return jsonify({'erro': 'Email inválido'}), 400
    
    if len(data['password']) < 6:
        return jsonify({'erro': 'Senha deve ter pelo menos 6 caracteres'}), 400
    
    password_hash = hashlib.sha256(data['password'].encode()).hexdigest()
    
    cursor = mysql.connection.cursor()
    
    # Verificar se email já existe
    cursor.execute("SELECT id_usuario FROM usuarios WHERE email = %s", (data['email'],))
    if cursor.fetchone():
        cursor.close()
        return jsonify({'erro': 'Email já registrado'}), 409
    
    # Criar usuário
    try:
        cursor.execute(QUERY_CRIAR_USUARIO, (
            data['nome'],
            data['email'],
            data.get('telefone', ''),
            password_hash
        ))
        mysql.connection.commit()
        user_id = cursor.lastrowid
        
        # Criar perfil de cliente
        cursor.execute("""
            INSERT INTO clientes (id_usuario, tipo_pessoa) 
            VALUES (%s, 'individual')
        """, (user_id,))
        mysql.connection.commit()
        
        cursor.close()
        
        return jsonify({
            'mensagem': 'Conta criada com sucesso',
            'usuario_id': user_id
        }), 201
        
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({'erro': str(e)}), 500


# =====================================================
# ROTAS DE PROJETOS
# =====================================================

@app.route('/api/projetos', methods=['GET'])
@app.route('/api/projetos/<categoria>', methods=['GET'])
def api_listar_projetos(categoria=None):
    cursor = mysql.connection.cursor()
    
    if categoria:
        cursor.execute(QUERY_PROJETOS_POR_CATEGORIA, (categoria,))
    else:
        cursor.execute(QUERY_LISTAR_PROJETOS)
    
    projetos = cursor.fetchall()
    cursor.close()
    
    # Converter Decimal para float
    for p in projetos:
        if p.get('area_m2'):
            p['area_m2'] = float(p['area_m2'])
        if p.get('orcamento'):
            p['orcamento'] = float(p['orcamento'])
    
    return jsonify(projetos)


@app.route('/api/projetos/destaque', methods=['GET'])
def api_projetos_destaque():
    cursor = mysql.connection.cursor()
    cursor.execute(QUERY_PROJETOS_DESTAQUE)
    projetos = cursor.fetchall()
    cursor.close()
    return jsonify(projetos)


@app.route('/api/projetos/<slug>', methods=['GET'])
def api_projeto_detalhe(slug):
    cursor = mysql.connection.cursor()
    cursor.execute(QUERY_PROJETO_POR_SLUG, (slug,))
    projeto = cursor.fetchone()
    
    if projeto:
        # Buscar imagens
        cursor.execute(QUERY_IMAGENS_PROJETO, (projeto['id_projeto'],))
        imagens = cursor.fetchall()
        projeto['imagens'] = imagens
        
        # Converter Decimal
        if projeto.get('area_m2'):
            projeto['area_m2'] = float(projeto['area_m2'])
    
    cursor.close()
    
    if not projeto:
        return jsonify({'erro': 'Projeto não encontrado'}), 404
    
    return jsonify(projeto)


# =====================================================
# ROTAS DE SERVIÇOS
# =====================================================

@app.route('/api/servicos', methods=['GET'])
def api_servicos():
    cursor = mysql.connection.cursor()
    cursor.execute(QUERY_LISTAR_SERVICOS)
    servicos = cursor.fetchall()
    cursor.close()
    return jsonify(servicos)


@app.route('/api/servicos/<slug>', methods=['GET'])
def api_servico_detalhe(slug):
    cursor = mysql.connection.cursor()
    cursor.execute(QUERY_SERVICO_POR_SLUG, (slug,))
    servico = cursor.fetchone()
    cursor.close()
    
    if not servico:
        return jsonify({'erro': 'Serviço não encontrado'}), 404
    
    return jsonify(servico)


# =====================================================
# ROTAS DE CATEGORIAS
# =====================================================

@app.route('/api/categorias', methods=['GET'])
def api_categorias():
    cursor = mysql.connection.cursor()
    cursor.execute(QUERY_LISTAR_CATEGORIAS)
    categorias = cursor.fetchall()
    cursor.close()
    return jsonify(categorias)


# =====================================================
# ROTAS DE CONTACTOS
# =====================================================

@app.route('/api/contactos', methods=['POST'])
def api_criar_contacto():
    data = request.get_json()
    
    # Validações
    if not all(k in data for k in ['nome', 'email', 'mensagem']):
        return jsonify({'erro': 'Dados incompletos'}), 400
    
    if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', data['email']):
        return jsonify({'erro': 'Email inválido'}), 400
    
    cursor = mysql.connection.cursor()
    
    try:
        cursor.execute(QUERY_CRIAR_CONTACTO, (
            data['nome'],
            data['email'],
            data.get('telefone', ''),
            data.get('assunto', ''),
            data['mensagem'],
            request.remote_addr
        ))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({'mensagem': 'Mensagem enviada com sucesso'}), 201
        
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({'erro': str(e)}), 500


# =====================================================
# ROTAS DE ÁREA DO CLIENTE (PROTEGIDAS)
# =====================================================

@app.route('/api/cliente/obras', methods=['GET'])
@login_required
def api_cliente_obras():
    if 'cliente_id' not in session:
        return jsonify({'erro': 'Perfil de cliente não encontrado'}), 404
    
    cursor = mysql.connection.cursor()
    cursor.execute(QUERY_LISTAR_OBRAS_CLIENTE, (session['cliente_id'],))
    obras = cursor.fetchall()
    cursor.close()
    
    # Converter Decimals
    for o in obras:
        if o.get('valor_contrato'):
            o['valor_contrato'] = float(o['valor_contrato'])
    
    return jsonify(obras)


@app.route('/api/cliente/obras/<int:obra_id>/detalhe', methods=['GET'])
@login_required
def api_cliente_obra_detalhe(obra_id):
    cursor = mysql.connection.cursor()
    
    # Verificar se a obra pertence ao cliente
    cursor.execute("""
        SELECT * FROM obras 
        WHERE id_obra = %s AND id_cliente = %s
    """, (obra_id, session['cliente_id']))
    
    obra = cursor.fetchone()
    
    if not obra:
        cursor.close()
        return jsonify({'erro': 'Obra não encontrada'}), 404
    
    # Buscar etapas
    cursor.execute(QUERY_ETAPAS_OBRA, (obra_id,))
    etapas = cursor.fetchall()
    
    # Buscar cronograma
    cursor.execute(QUERY_CRONOGRAMA_OBRA, (obra_id,))
    cronograma = cursor.fetchall()
    
    # Buscar documentos
    cursor.execute(QUERY_DOCUMENTOS_OBRA, (obra_id,))
    documentos = cursor.fetchall()
    
    cursor.close()
    
    obra['etapas'] = etapas
    obra['cronograma'] = cronograma
    obra['documentos'] = documentos
    
    # Converter Decimals
    if obra.get('valor_contrato'):
        obra['valor_contrato'] = float(obra['valor_contrato'])
    
    return jsonify(obra)


@app.route('/api/cliente/documentos', methods=['GET'])
@login_required
def api_cliente_documentos():
    cursor = mysql.connection.cursor()
    cursor.execute(QUERY_DOCUMENTOS_CLIENTE, (session['cliente_id'],))
    documentos = cursor.fetchall()
    cursor.close()
    return jsonify(documentos)


# =====================================================
# ROTAS DE DASHBOARD (ADMIN)
# =====================================================

@app.route('/api/admin/dashboard', methods=['GET'])
@admin_required
def api_admin_dashboard():
    cursor = mysql.connection.cursor()
    cursor.execute(QUERY_ESTATISTICAS_DASHBOARD)
    stats = cursor.fetchone()
    cursor.close()
    return jsonify(stats)


@app.route('/api/admin/contactos', methods=['GET'])
@admin_required
def api_admin_contactos():
    cursor = mysql.connection.cursor()
    cursor.execute(QUERY_LISTAR_CONTACTOS)
    contactos = cursor.fetchall()
    cursor.close()
    return jsonify(contactos)


@app.route('/api/admin/contactos/<int:id>/lido', methods=['PUT'])
@admin_required
def api_admin_marcar_lido(id):
    cursor = mysql.connection.cursor()
    cursor.execute("UPDATE contactos SET lido = TRUE WHERE id_contacto = %s", (id,))
    mysql.connection.commit()
    cursor.close()
    return jsonify({'mensagem': 'Marcado como lido'})


# =====================================================
# ROTAS DE NEWSLETTER
# =====================================================

@app.route('/api/newsletter', methods=['POST'])
def api_newsletter():
    data = request.get_json()
    email = data.get('email')
    
    if not email or not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
        return jsonify({'erro': 'Email inválido'}), 400
    
    cursor = mysql.connection.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO newsletter (email, nome) 
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE ativo = TRUE, data_unsubscribe = NULL
        """, (email, data.get('nome', '')))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({'mensagem': 'Inscrição realizada com sucesso'}), 201
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500


# =====================================================
# INICIALIZAÇÃO
# =====================================================

if __name__ == '__main__':
    app.run(debug=True, port=5000)
"""


# =====================================================
# MODELOS SQLALCHEMY (Alternativa)
# =====================================================

"""
# models.py - Usando SQLAlchemy

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id_usuario = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    telefone = db.Column(db.String(20))
    password_hash = db.Column(db.String(255), nullable=False)
    tipo_usuario = db.Column(db.Enum('cliente', 'admin', 'funcionario'), default='cliente')
    status_conta = db.Column(db.Enum('ativa', 'inativa', 'pendente', 'bloqueada'), default='ativa')
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    ultimo_login = db.Column(db.DateTime)
    
    cliente = db.relationship('Cliente', backref='usuario', uselist=False)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Cliente(db.Model):
    __tablename__ = 'clientes'
    
    id_cliente = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey('usuarios.id_usuario'), nullable=False)
    nif = db.Column(db.String(20))
    morada = db.Column(db.String(255))
    cidade = db.Column(db.String(100), default='Luanda')
    
    obras = db.relationship('Obra', backref='cliente')


class Categoria(db.Model):
    __tablename__ = 'categorias'
    
    id_categoria = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    descricao = db.Column(db.Text)
    
    projetos = db.relationship('Projeto', backref='categoria')


class Projeto(db.Model):
    __tablename__ = 'projetos'
    
    id_projeto = db.Column(db.Integer, primary_key=True)
    id_categoria = db.Column(db.Integer, db.ForeignKey('categorias.id_categoria'))
    titulo = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    descricao = db.Column(db.Text)
    localizacao = db.Column(db.String(200))
    area_m2 = db.Column(db.Numeric(10,2))
    ano_conclusao = db.Column(db.Integer)
    status_projeto = db.Column(db.Enum('em_planeamento', 'em_execucao', 'concluido', 'entregue'))
    destaque = db.Column(db.Boolean, default=False)
    
    imagens = db.relationship('ImagemProjeto', backref='projeto', cascade='all, delete-orphan')
    obras = db.relationship('Obra', backref='projeto')


class ImagemProjeto(db.Model):
    __tablename__ = 'imagens_projetos'
    
    id_imagem = db.Column(db.Integer, primary_key=True)
    id_projeto = db.Column(db.Integer, db.ForeignKey('projetos.id_projeto'), nullable=False)
    url_imagem = db.Column(db.String(255), nullable=False)
    tipo = db.Column(db.Enum('principal', 'galeria', 'antes', 'depois'), default='galeria')
    ordem = db.Column(db.Integer, default=0)


class Servico(db.Model):
    __tablename__ = 'servicos'
    
    id_servico = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(150), nullable=False)
    slug = db.Column(db.String(150), unique=True, nullable=False)
    descricao_resumida = db.Column(db.String(255))
    icone = db.Column(db.String(50))
    destaque = db.Column(db.Boolean, default=False)
    
    detalhes = db.relationship('ServicoDetalhe', backref='servico', cascade='all, delete-orphan')


class ServicoDetalhe(db.Model):
    __tablename__ = 'servicos_detalhes'
    
    id_detalhe = db.Column(db.Integer, primary_key=True)
    id_servico = db.Column(db.Integer, db.ForeignKey('servicos.id_servico'), nullable=False)
    titulo = db.Column(db.String(150), nullable=False)
    descricao = db.Column(db.Text)
    icone = db.Column(db.String(50))
    ordem = db.Column(db.Integer, default=0)


class Obra(db.Model):
    __tablename__ = 'obras'
    
    id_obra = db.Column(db.Integer, primary_key=True)
    id_projeto = db.Column(db.Integer, db.ForeignKey('projetos.id_projeto'), nullable=False)
    id_cliente = db.Column(db.Integer, db.ForeignKey('clientes.id_cliente'), nullable=False)
    nome_obra = db.Column(db.String(200), nullable=False)
    localizacao = db.Column(db.String(255))
    valor_contrato = db.Column(db.Numeric(12,2))
    data_inicio = db.Column(db.Date)
    data_prevista_fim = db.Column(db.Date)
    status_obra = db.Column(db.Enum('nao_iniciada', 'em_preparacao', 'em_execucao', 'parada', 'concluida', 'entregue'))
    progresso = db.Column(db.Integer, default=0)
    
    etapas = db.relationship('EtapaObra', backref='obra', cascade='all, delete-orphan')
    cronograma = db.relationship('CronogramaObra', backref='obra', cascade='all, delete-orphan')


class EtapaObra(db.Model):
    __tablename__ = 'etapas_obra'
    
    id_etapa = db.Column(db.Integer, primary_key=True)
    id_obra = db.Column(db.Integer, db.ForeignKey('obras.id_obra'), nullable=False)
    nome = db.Column(db.String(150), nullable=False)
    descricao = db.Column(db.Text)
    progresso = db.Column(db.Integer, default=0)
    status = db.Column(db.Enum('pendente', 'em_andamento', 'concluida', 'atrasada'), default='pendente')


class Contacto(db.Model):
    __tablename__ = 'contactos'
    
    id_contacto = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    telefone = db.Column(db.String(20))
    assunto = db.Column(db.String(200))
    mensagem = db.Column(db.Text, nullable=False)
    lido = db.Column(db.Boolean, default=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
"""

print("Queries e modelos Flask criados com sucesso!")
