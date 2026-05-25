"""
Sistema Dois Lados - Aplicação Flask Principal
================================================

Escritório de Arquitetura e Construção
Luanda, Angola

Autor: Sistema Dois Lados
Versão: 1.0.0
"""

import os
import sys
from flask import Flask, jsonify, render_template, send_from_directory, request, abort
from flask_login import LoginManager, login_required, current_user, login_user
from flask_mail import Mail
from flask_cors import CORS
from flask_migrate import Migrate
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from config import config
from models import db, User, PortfolioItem, Project, ProjectPhase, Message as ContactMessage, create_admin_user, init_sample_data
from sqlalchemy import text

# ============================================
# INSTANCIAÇÃO DE EXTENSIONS
# ============================================

login_manager = LoginManager()
mail = Mail()
migrate = Migrate()


# ============================================
# FACTORY FUNCTION
# ============================================

def create_app(config_name=None):
    """
    Factory function para criar a aplicação Flask
    
    Args:
        config_name: Nome da configuração (development, production, testing)
    
    Returns:
        app: Instância da aplicação Flask configurada
    """
    
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(
        __name__,
        static_folder='dist',
        static_url_path='/',
        template_folder='dist'
    )

    # Garantir pasta de uploads
    uploads_dir = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    
    # Carregar configuração
    app.config.from_object(config.get(config_name, config['default']))
    
    # ============================================
    # INICIALIZAÇÃO DE EXTENSIONS
    # ============================================
    
    # Base de dados
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Login manager
    login_manager.init_app(app)
    login_manager.login_view = 'api.login'
    login_manager.login_message = 'Por favor, inicie sessão para aceder.'
    login_manager.login_message_category = 'info'
    
    # Mail
    mail.init_app(app)
    
    # CORS (permite requests do frontend e mantém cookies de sessão)
    cors_origins = [
        origin.strip()
        for origin in os.environ.get('CORS_ORIGINS', '').split(',')
        if origin.strip()
    ] + [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        r"https://.*\.vercel\.app",
    ]

    CORS(app, resources={
        r"/api/*": {
            "origins": cors_origins,
            "supports_credentials": True
        }
    })
    
    # ============================================
    # USER LOADER PARA FLASK-LOGIN
    # ============================================
    
    @login_manager.user_loader
    def load_user(user_id):
        """Carrega utilizador pela ID da sessão"""
        return User.query.get(int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        if request.path.startswith('/api/'):
            return jsonify({'success': False, 'error': 'Sessao expirada. Faca login novamente.'}), 401
        abort(401)
    
    # ============================================
    # REGISTAR BLUEPRINTS
    # ============================================
    
    from admin.routes import api
    app.register_blueprint(api)
    
    # ============================================
    # ROTAS PRINCIPAIS
    # ============================================
    
    # Catch‑all para SPA React (exceto /api)
    @app.route('/static/uploads/<path:filename>')
    def uploaded_file(filename):
        uploads_root = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
        return send_from_directory(uploads_root, filename)

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path.startswith('api'):
            abort(404)
        full_path = os.path.join(app.static_folder, path)
        if path != "" and os.path.exists(full_path):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')

    # Rota opcional para expor o índice da API em JSON
    @app.route('/api')
    def api_index():
        return jsonify({
            'name': 'Dois Lados API',
            'version': '1.0.0',
            'description': 'Sistema de Gestão - Arquitetura e Construção',
            'endpoints': {
                'auth': {
                    'register': 'POST /api/register',
                    'register_v2': 'POST /api/auth/register',
                    'login': 'POST /api/login',
                    'logout': 'POST /api/logout',
                    'user': 'GET /api/user'
                },
                'public': {
                    'portfolio': 'GET /api/portfolio',
                    'projects': 'GET /api/projects/public',
                    'quote': 'POST /api/quotes',
                    'contact': 'POST /api/contact'
                },
                'admin': {
                    'dashboard': 'GET /api/admin/dashboard',
                    'projects': 'GET/POST /api/admin/projects',
                    'quotes': 'GET /api/admin/quotes',
                    'messages': 'GET /api/admin/messages',
                    'portfolio': 'GET/POST /api/admin/portfolio',
                    'users': 'GET /api/admin/users'
                }
            }
        })

    @app.route('/health')
    def health_check():
        db_status = str(db.session.is_active).strip().replace('\n', '')
        resp = jsonify({
            'status': 'healthy',
            'database': db_status
        })
        resp.headers['X-DB-Status'] = db_status
        return resp

    # ============================================
    # AUTENTICAÇÃO BÁSICA (Cadastro/Login) - rotas locais
    # Evita duplicação: se usar o blueprint com as mesmas rotas, comente estas.
    # ============================================

    @app.route('/api/register', methods=['POST'])
    def register_local():
        data = request.get_json() or {}
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        if not all([username, email, password]):
            return jsonify({'success': False, 'error': 'username, email e password são obrigatórios'}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'error': 'Email já existe'}), 409
        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password),
            is_admin=False,
            is_active=True
        )
        db.session.add(user)
        db.session.commit()
        login_user(user, remember=True)
        return jsonify({'success': True, 'user': {'id': user.id, 'username': user.username, 'email': user.email, 'is_admin': user.is_admin}}), 201

    @app.route('/api/login', methods=['POST'])
    def login_local():
        data = request.get_json() or {}
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        if not all([email, password]):
            return jsonify({'success': False, 'error': 'Email e password são obrigatórios'}), 400
        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({'success': False, 'error': 'Credenciais inválidas'}), 401
        login_user(user, remember=data.get('remember', False))
        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': user.is_admin
            }
        }), 200

    # ============================================
    # ROTAS ADICIONAIS (Auth alias)
    # ============================================

    @app.route('/api/auth/register', methods=['POST'])
    def register_v2():
        """
        Alias para registo público garantindo is_admin=False.
        """
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'Nenhum dado enviado'}), 400
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        if not all([name, email, password]):
            return jsonify({'success': False, 'error': 'Nome, email e password são obrigatórios'}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'error': 'Email já registrado'}), 409
        user = User(
            username=name,
            email=email,
            password_hash=generate_password_hash(password),
            is_admin=False,
            is_active=True,
        )
        db.session.add(user)
        db.session.commit()
        login_user(user, remember=True)
        return jsonify({'success': True, 'user': {'id': user.id, 'email': user.email}}), 201

    # ============================================
    # ÁREA DO CLIENTE
    # ============================================
    @app.route('/api/client/me', methods=['GET'])
    @login_required
    def client_me():
        return jsonify({
            'success': True,
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email,
                'is_admin': current_user.is_admin
            }
        })

    @app.route('/api/client/projects', methods=['GET'])
    @login_required
    def client_projects():
        # clientes só veem os seus projetos
        if current_user.is_admin:
            projects = Project.query.order_by(Project.created_at.desc()).all()
        else:
            projects = Project.query.filter_by(client_id=current_user.id).order_by(Project.created_at.desc()).all()

        def serialize_project(p: Project):
            phases = ProjectPhase.query.filter_by(project_id=p.id).order_by(ProjectPhase.phase_order).all()
            return {
                'id': p.id,
                'title': p.title,
                'description': p.description,
                'category': p.category,
                'status': p.status,
                'location': p.location,
                'area_sqm': float(p.area_sqm) if p.area_sqm else None,
                'created_at': p.created_at.isoformat() if p.created_at else None,
                'phases': [{
                    'id': ph.id,
                    'phase_name': ph.phase_name,
                    'description': ph.description,
                    'phase_order': ph.phase_order,
                    'status': ph.status,
                    'start_date': ph.start_date.isoformat() if ph.start_date else None,
                    'end_date': ph.end_date.isoformat() if ph.end_date else None,
                } for ph in phases]
            }

        return jsonify({
            'success': True,
            'projects': [serialize_project(p) for p in projects]
        })
    
    # ============================================
    # ERRO HANDLERS
    # ============================================
    
    @app.errorhandler(404)
    def not_found(error):
        if request.path.startswith('/api/'):
            return jsonify({'success': False, 'error': 'Recurso não encontrado'}), 404
        # para rotas de front, devolve index
        return send_from_directory(app.static_folder, 'index.html')
    
    @app.errorhandler(500)
    def server_error(error):
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Erro interno do servidor'
        }), 500
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'success': False,
            'error': 'Acesso proibido'
        }), 403
    
    # ============================================
    # INICIALIZAÇÃO DA BASE DE DADOS
    # ============================================
    
    with app.app_context():
        # Criar tabelas
        db.create_all()
        ensure_message_columns()
        
        # Criar admin padrão
        create_admin_user()
        
        # Inicializar dados de exemplo (descomentar para produção)
        # init_sample_data()
    
    return app


def ensure_message_columns():
    """Adiciona colunas novas em SQLite sem recriar a base local."""
    if db.engine.dialect.name != 'sqlite':
        return

    columns = {
        row[1]
        for row in db.session.execute(text("PRAGMA table_info(messages)")).fetchall()
    }
    migrations = {
        'sender_role': "ALTER TABLE messages ADD COLUMN sender_role VARCHAR(20) NOT NULL DEFAULT 'client'",
        'attachment_url': "ALTER TABLE messages ADD COLUMN attachment_url VARCHAR(500)",
        'attachment_name': "ALTER TABLE messages ADD COLUMN attachment_name VARCHAR(255)",
        'attachment_type': "ALTER TABLE messages ADD COLUMN attachment_type VARCHAR(80)",
    }
    for column, ddl in migrations.items():
        if column not in columns:
            db.session.execute(text(ddl))
    db.session.commit()


# ============================================
# RUN APPLICATION
# ============================================

if __name__ == '__main__':
    # Criar app
    app = create_app()
    
    # Criar pasta de uploads se não existir
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    app.run(host='127.0.0.1', port=5000, debug=True)
