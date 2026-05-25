# ============================================================
# DOIS LADOS - APLICAÇÃO FLASK PRINCIPAL
# ============================================================
# Backend completo para sistema de arquitetura
# ============================================================

from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, current_user
from flask_mail import Mail
from flask_migrate import Migrate
from flask_cors import CORS
from flask_session import Session
from datetime import datetime
import os

# ============================================================
# CONFIGURAÇÕES DA APLICAÇÃO
# ============================================================

class Config:
    """Configurações base da aplicação"""
    
    # Segurança
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Base de dados
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'mysql+pymysql://root:Palavrasonnel04%23@localhost/dois_lados?charset=utf8mb4'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 280,
        'pool_pre_ping': True
    }
    
    # Sessões (server-side para maior segurança)
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    
    # Flask-Mail
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER') or 'noreply@doislados.co.ao'
    
    # Email do administrador
    ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL') or 'nelsonbambi177@gmail.com'
    
    # Upload
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf'}
    UPLOAD_FOLDER = os.path.join('static', 'uploads')
    
    # CORS (para React)
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')


class DevelopmentConfig(Config):
    """Configurações de desenvolvimento"""
    DEBUG = True
    SQLALCHEMY_ECHO = False


class ProductionConfig(Config):
    """Configurações de produção"""
    DEBUG = False
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'


# ============================================================
# INSTÂNCIA DA APLICAÇÃO
# ============================================================

def create_app(config_name='default'):
    """Fábrica de aplicação Flask"""
    
    app = Flask(__name__)
    
    # Carregar configuração
    if config_name == 'production':
        app.config.from_object(ProductionConfig)
    else:
        app.config.from_object(DevelopmentConfig)
    
    # Garantir pasta de uploads
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # ============================================================
    # EXTENSÕES FLASK
    # ============================================================
    
    # Base de dados
    db.init_app(app)
    
    # Migrações
    migrate = Migrate(app, db)
    
    # Login Manager
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Por favor, faça login para acessar esta página.'
    login_manager.login_message_category = 'info'
    
    @login_manager.user_loader
    def load_user(user_id):
        from models import User
        return User.query.get(int(user_id))
    
    # Mail
    mail = Mail(app)
    app.mail = mail
    
    # CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Session
    Session(app)
    
    # ============================================================
    # HELPERS GLOBAIS (disponíveis nos templates)
    # ============================================================
    
    @app.context_processor
    def inject_user():
        """Injeta o utilizador atual em todos os templates"""
        return dict(current_user=current_user)
    
    @app.template_filter('datetime')
    def format_datetime(value, format='%d/%m/%Y %H:%M'):
        """Formata datas nos templates"""
        if value is None:
            return ''
        if isinstance(value, str):
            try:
                value = datetime.fromisoformat(value.replace('Z', '+00:00'))
            except:
                return value
        return value.strftime(format)
    
    @app.template_filter('date')
    def format_date(value, format='%d/%m/%Y'):
        """Formata datas nos templates"""
        if value is None:
            return ''
        if isinstance(value, str):
            try:
                value = datetime.fromisoformat(value.replace('Z', '+00:00'))
            except:
                return value
        return value.strftime(format)
    
    # ============================================================
    # BLUEPRINTS
    # ============================================================
    
    # Auth (login, logout, register)
    from auth.routes import auth_bp
    app.register_blueprint(auth_bp)
    
    # Admin (dashboard, CRUD)
    from admin.routes import admin_bp
    app.register_blueprint(admin_bp)
    
    # User (área do cliente)
    from user.routes import user_bp
    app.register_blueprint(user_bp)
    
    # ============================================================
    # ROTAS PÚBLICAS (PÁGINA PRINCIPAL)
    # ============================================================
    
    @app.route('/')
    def index():
        """Página principal (landing page)"""
        return render_template('public/index.html')
    
    @app.route('/sobre')
    def about():
        """Página sobre nós"""
        return render_template('public/about.html')
    
    @app.route('/servicos')
    def services():
        """Página de serviços"""
        from models import Service
        services = Service.query.filter_by(is_active=True).order_by(Service.order_index).all()
        return render_template('public/services.html', services=services)
    
    @app.route('/portfolio')
    def portfolio():
        """Página de portfólio"""
        from models import PortfolioItem
        category = request.args.get('category', 'all')
        
        query = PortfolioItem.query.filter_by(is_active=True)
        if category != 'all':
            query = query.filter_by(category=category)
        
        items = query.order_by(PortfolioItem.created_at.desc()).all()
        return render_template('public/portfolio.html', items=items, selected_category=category)
    
    @app.route('/contacto', methods=['GET', 'POST'])
    def contact():
        """Página de contactos"""
        from models import Message
        
        if request.method == 'POST':
            name = request.form.get('name', '').strip()
            email = request.form.get('email', '').strip()
            phone = request.form.get('phone', '').strip()
            subject = request.form.get('subject', '').strip()
            content = request.form.get('content', '').strip()
            
            errors = []
            if not name:
                errors.append('Nome é obrigatório')
            if not email or '@' not in email:
                errors.append('Email inválido')
            if not content:
                errors.append('Mensagem é obrigatória')
            
            if errors:
                for error in errors:
                    flash(error, 'error')
                return render_template('public/contact.html', 
                                       data=request.form.to_dict(),
                                       errors=errors)
            
            try:
                message = Message(
                    name=name,
                    email=email,
                    phone=phone,
                    subject=subject,
                    content=content,
                    ip_address=request.remote_addr,
                    user_agent=request.user_agent.string[:500]
                )
                db.session.add(message)
                db.session.commit()
                
                flash('Mensagem enviada com sucesso! Entraremos em contacto em breve.', 'success')
                return redirect(url_for('contact'))
                
            except Exception as e:
                db.session.rollback()
                flash('Erro ao enviar mensagem. Tente novamente.', 'error')
        
        return render_template('public/contact.html')
    
    @app.route('/api/public/portfolio', methods=['GET'])
    def api_public_portfolio():
        """API: Lista pública do portfólio"""
        from models import PortfolioItem
        
        category = request.args.get('category', 'all')
        featured = request.args.get('featured', 'false') == 'true'
        
        query = PortfolioItem.query.filter_by(is_active=True)
        
        if category != 'all':
            query = query.filter_by(category=category)
        if featured:
            query = query.filter_by(is_featured=True)
        
        items = query.order_by(PortfolioItem.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'items': [i.to_dict() for i in items],
            'total': len(items)
        })
    
    @app.route('/api/public/services', methods=['GET'])
    def api_public_services():
        """API: Lista pública de serviços"""
        from models import Service
        
        services = Service.query.filter_by(is_active=True).order_by(Service.order_index).all()
        
        return jsonify({
            'success': True,
            'services': [s.to_dict() for s in services]
        })
    
    # ============================================================
    # ROTAS DE ORÇAMENTO (PÚBLICAS)
    # ============================================================
    
    @app.route('/api/quotes', methods=['POST'])
    def submit_quote():
        """
        API: Submeter pedido de orçamento
        
        Envia notificação por email para o administrador
        """
        from models import Quote
        from flask_mail import Message as MailMessage
        
        data = request.get_json() if request.is_json else request.form.to_dict()
        
        # Validações
        required = ['client_name', 'email', 'service_type', 'description']
        errors = []
        
        for field in required:
            if not data.get(field, '').strip():
                errors.append(f'{field} é obrigatório')
        
        if errors:
            return jsonify({'success': False, 'errors': errors}), 400
        
        try:
            quote = Quote(
                client_name=data['client_name'].strip(),
                email=data['email'].strip().lower(),
                phone=data.get('phone', '').strip(),
                service_type=data['service_type'],
                project_type=data.get('project_type', ''),
                description=data['description'].strip(),
                budget_range=data.get('budget_range', ''),
                location=data.get('location', '').strip(),
                preferred_date=datetime.strptime(data['preferred_date'], '%Y-%m-%d') 
                    if data.get('preferred_date') else None
            )
            
            db.session.add(quote)
            db.session.commit()
            
            # Enviar email de notificação
            try:
                msg = MailMessage(
                    subject=f'📩 Novo Orçamento: {quote.client_name} - {quote.service_type}',
                    recipients=[app.config['ADMIN_EMAIL']],
                    html=f'''
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #FACC15;">Novo Pedido de Orçamento</h2>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Cliente:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">{quote.client_name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:{quote.email}">{quote.email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Telefone:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">{quote.phone or '-'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Serviço:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">{quote.service_type}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Tipo Projeto:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">{quote.project_type or '-'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Orçamento:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">{quote.budget_range or '-'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Localização:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">{quote.location or '-'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Data:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">{quote.created_at.strftime("%d/%m/%Y %H:%M")}</td>
                            </tr>
                        </table>
                        
                        <h3 style="margin-top: 20px; color: #333;">Descrição:</h3>
                        <p style="background: #f9f9f9; padding: 15px; border-radius: 8px;">{quote.description}</p>
                        
                        <p style="margin-top: 30px; color: #666; font-size: 12px;">
                            Aceda ao painel admin para processar este pedido.
                        </p>
                    </div>
                    '''
                )
                mail.send(msg)
                print(f"📧 EMAIL ENVIADO para {app.config['ADMIN_EMAIL']}")
            except Exception as email_error:
                print(f"⚠️ ERRO AO ENVIAR EMAIL: {str(email_error)}")
            
            return jsonify({
                'success': True,
                'message': 'Orçamento submetido com sucesso! Entraremos em contacto brevemente.',
                'quote': quote.to_dict()
            }), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'error': str(e)}), 500
    
    # ============================================================
    # ROTAS DE AUTENTICAÇÃO API (alternativas)
    # ============================================================
    
    @app.route('/api/auth/register', methods=['POST'])
    def api_register():
        """API: Registo público"""
        from auth.routes import api_register
        return api_register()
    
    @app.route('/api/auth/login', methods=['POST'])
    def api_login():
        """API: Login"""
        from auth.routes import api_login
        return api_login()
    
    @app.route('/api/auth/logout', methods=['POST'])
    def api_logout():
        """API: Logout"""
        from auth.routes import api_logout
        return api_logout()
    
    @app.route('/api/auth/me', methods=['GET'])
    def api_me():
        """API: Dados do utilizador atual"""
        if not current_user.is_authenticated:
            return jsonify({'success': False, 'error': 'Não autenticado'}), 401
        
        return jsonify({
            'success': True,
            'user': current_user.to_dict()
        })
    
    # ============================================================
    # ERROS HTTP
    # ============================================================
    
    @app.errorhandler(404)
    def not_found(e):
        if request.is_json or request.path.startswith('/api/'):
            return jsonify({'success': False, 'error': 'Página não encontrada'}), 404
        return render_template('errors/404.html'), 404
    
    @app.errorhandler(500)
    def server_error(e):
        if request.is_json or request.path.startswith('/api/'):
            return jsonify({'success': False, 'error': 'Erro interno do servidor'}), 500
        return render_template('errors/500.html'), 500
    
    @app.errorhandler(403)
    def forbidden(e):
        if request.is_json or request.path.startswith('/api/'):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403
        return render_template('errors/403.html'), 403
    
    # ============================================================
    # INICIALIZAÇÃO DA BASE DE DADOS
    # ============================================================
    
    with app.app_context():
        # Importar modelos
        from models import db, seed_data
        
        # Criar tabelas
        db.create_all()
        
        # Inserir dados de demonstração
        seed_data()
    
    return app


# ============================================================
# EXECUÇÃO
# ============================================================

if __name__ == '__main__':
    app = create_app(os.environ.get('FLASK_ENV', 'development'))
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=True
    )
