"""
Rotas do Painel Administrativo - Sistema Dois Lados
====================================================

Autor: Sistema Dois Lados
Descrição: Rotas protegidas para gestão de projetos, orçamentos e clientes
Versão: 1.0.0

ESTRUTURA DAS ROTAS:
====================

📝 AUTENTICAÇÃO (PÚBLICAS)
├── POST /api/register    - Registo de novo utilizador
├── POST /api/login       - Login
├── POST /api/logout      - Logout
└── GET  /api/user        - Dados do utilizador atual

📁 PROJETOS (ADMIN)
├── GET    /api/admin/projects      - Listar todos os projetos
├── POST   /api/admin/projects      - Criar novo projeto
├── GET    /api/admin/projects/<id> - Ver detalhes
├── PUT    /api/admin/projects/<id> - Atualizar projeto
└── DELETE /api/admin/projects/<id> - Eliminar projeto

📅 FASES/CRONOGRAMA (ADMIN)
├── GET    /api/admin/projects/<id>/phases     - Listar fases
├── POST   /api/admin/projects/<id>/phases      - Criar fase
├── PUT    /api/admin/phases/<id>               - Atualizar fase
└── DELETE /api/admin/phases/<id>               - Eliminar fase

💰 ORÇAMENTOS (ADMIN)
├── GET    /api/admin/quotes       - Listar orçamentos
├── POST   /api/admin/quotes/<id>  - Atualizar status
└── DELETE /api/admin/quotes/<id>  - Eliminar

🖼️ PORTFÓLIO (ADMIN)
├── GET    /api/admin/portfolio            - Listar itens
├── POST   /api/admin/portfolio            - Criar item
├── PUT    /api/admin/portfolio/<id>        - Atualizar
├── POST   /api/admin/portfolio/<id>/image  - Upload imagem
└── DELETE /api/admin/portfolio/<id>        - Eliminar

💬 MENSAGENS (ADMIN)
├── GET    /api/admin/messages        - Listar mensagens
├── PUT    /api/admin/messages/<id>   - Marcar como lida
└── DELETE /api/admin/messages/<id>  - Eliminar

📊 DASHBOARD (ADMIN)
├── GET /api/admin/dashboard - Estatísticas

👥 UTILIZADORES (ADMIN)
├── GET    /api/admin/users     - Listar utilizadores
├── PUT    /api/admin/users/<id> - Ativar/desativar
└── DELETE /api/admin/users/<id> - Eliminar
"""

from flask import Blueprint, request, jsonify, current_app
from flask_login import login_user, logout_user, login_required, current_user
from flask_mail import Message
from models import db, User, Project, ProjectPhase, Quote, Message as ContactMessage, PortfolioItem, Publication
from functools import wraps
from datetime import datetime
from werkzeug.utils import secure_filename
import os
import traceback
import uuid

# Criar blueprint
api = Blueprint('api', __name__, url_prefix='/api')

PUBLICATION_CATEGORIES = {'noticia', 'atividade', 'evento', 'publicidade', 'obra', 'recrutamento'}
MESSAGE_UPLOAD_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'dwg', 'txt'}
APPLICATION_UPLOAD_EXTENSIONS = {'pdf', 'doc', 'docx'}


def save_message_attachment(file_storage):
    if not file_storage or not file_storage.filename:
        return None, None, None

    filename = secure_filename(file_storage.filename)
    extension = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    if extension not in MESSAGE_UPLOAD_EXTENSIONS:
        raise ValueError('Tipo de ficheiro nao permitido')

    upload_dir = os.path.join(current_app.root_path, 'static', 'uploads', 'messages')
    os.makedirs(upload_dir, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}_{filename}"
    file_storage.save(os.path.join(upload_dir, stored_name))

    return f"/static/uploads/messages/{stored_name}", filename, file_storage.mimetype


def save_application_cv(file_storage):
    if not file_storage or not file_storage.filename:
        raise ValueError('O curriculo/CV e obrigatorio')

    filename = secure_filename(file_storage.filename)
    extension = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    if extension not in APPLICATION_UPLOAD_EXTENSIONS:
        raise ValueError('Envie o CV em PDF, DOC ou DOCX')

    upload_dir = os.path.join(current_app.root_path, 'static', 'uploads', 'applications')
    os.makedirs(upload_dir, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}_{filename}"
    path = os.path.join(upload_dir, stored_name)
    file_storage.save(path)

    return path, filename, file_storage.mimetype or 'application/octet-stream'


def serialize_message(item):
    return {
        'id': item.id,
        'user_id': item.user_id,
        'name': item.name,
        'email': item.email,
        'phone': item.phone,
        'subject': item.subject,
        'content': item.content,
        'sender_role': getattr(item, 'sender_role', 'client'),
        'attachment_url': getattr(item, 'attachment_url', None),
        'attachment_name': getattr(item, 'attachment_name', None),
        'attachment_type': getattr(item, 'attachment_type', None),
        'is_read': item.is_read,
        'is_replied': item.is_replied,
        'created_at': item.created_at.isoformat()
    }


def serialize_publication(item):
    return {
        'id': item.id,
        'title': item.title,
        'summary': item.summary,
        'content': item.content,
        'category': item.category,
        'image_url': item.image_url,
        'link_url': item.link_url,
        'event_date': item.event_date.isoformat() if item.event_date else None,
        'location': item.location,
        'is_featured': item.is_featured,
        'is_active': item.is_active,
        'created_at': item.created_at.isoformat() if item.created_at else None,
        'updated_at': item.updated_at.isoformat() if item.updated_at else None,
    }


def parse_publication_payload(data, item=None):
    if not data:
        return None, ('Nenhum dado fornecido', 400)

    category = data.get('category', getattr(item, 'category', 'noticia'))
    if category not in PUBLICATION_CATEGORIES:
        return None, ('Categoria invalida', 400)

    event_date = data.get('event_date')
    parsed_event_date = getattr(item, 'event_date', None)
    if event_date:
        try:
            parsed_event_date = datetime.strptime(event_date, '%Y-%m-%d').date()
        except ValueError:
            return None, ('Data do evento invalida. Use YYYY-MM-DD', 400)
    elif event_date == '':
        parsed_event_date = None

    payload = {
        'title': data.get('title', getattr(item, 'title', '')).strip(),
        'summary': data.get('summary', getattr(item, 'summary', '') or '').strip(),
        'content': data.get('content', getattr(item, 'content', '')).strip(),
        'category': category,
        'image_url': data.get('image_url', getattr(item, 'image_url', '') or '').strip(),
        'link_url': data.get('link_url', getattr(item, 'link_url', '') or '').strip(),
        'event_date': parsed_event_date,
        'location': data.get('location', getattr(item, 'location', '') or '').strip(),
        'is_featured': data.get('is_featured', getattr(item, 'is_featured', False)),
        'is_active': data.get('is_active', getattr(item, 'is_active', True)),
    }

    if not payload['title'] or not payload['content']:
        return None, ('Titulo e conteudo sao obrigatorios', 400)

    return payload, None

# ============================================
# DECORADORES AUXILIARES
# ============================================

def admin_required(f):
    """
    Decorador que verifica se o utilizador é administrador
    Uso: @admin_required em rotas protegidas
    """
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.is_administrator():
            return jsonify({
                'success': False,
                'error': 'Acesso negado. Apenas administradores.'
            }), 403
        return f(*args, **kwargs)
    return decorated_function


def admin_or_client_required(f):
    """
    Decorador que permite acesso a admins ou ao próprio utilizador
    Uso: @admin_or_client_required para rotas de cliente
    """
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.is_active:
            return jsonify({
                'success': False,
                'error': 'Conta desativada.'
            }), 403
        return f(*args, **kwargs)
    return decorated_function


# ============================================
# 1. ROTAS DE AUTENTICAÇÃO (PÚBLICAS)
# ============================================

@api.route('/register', methods=['POST'])
def register():
    """
    Registo Público de Novo Utilizador
    ====================================
    
    Método: POST
    URL: /api/register
    Autenticação: Nenhuma (público)
    
    Body (JSON):
    {
        "username": "nome_utilizador",
        "email": "email@exemplo.com",
        "password": "senha_segura"
    }
    
    Respostas:
    - 201: Utilizador criado com sucesso
    - 400: Dados inválidos ou incompletos
    - 409: Utilizador/email já existe
    - 500: Erro interno do servidor
    """
    try:
        data = request.get_json()
        
        # Validação de campos obrigatórios
        if not data:
            return jsonify({
                'success': False,
                'error': 'Nenhum dado fornecido'
            }), 400
        
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório em falta: {field}'
                }), 400
        
        username = data['username'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        
        # Validação de email
        if '@' not in email or '.' not in email.split('@')[1]:
            return jsonify({
                'success': False,
                'error': 'Email inválido'
            }), 400
        
        # Validação de password (mínimo 6 caracteres)
        if len(password) < 6:
            return jsonify({
                'success': False,
                'error': 'Password deve ter pelo menos 6 caracteres'
            }), 400
        
        # Verificar se utilizador já existe
        if User.query.filter_by(username=username).first():
            return jsonify({
                'success': False,
                'error': 'Nome de utilizador já está em uso'
            }), 409
        
        # Verificar se email já existe
        if User.query.filter_by(email=email).first():
            return jsonify({
                'success': False,
                'error': 'Este email já está registado'
            }), 409
        
        # Criar novo utilizador (não é admin por padrão)
        new_user = User(
            username=username,
            email=email,
            is_admin=False,  # ← padrão: cliente comum
            is_active=True
        )
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user, remember=True)
        
        return jsonify({
            'success': True,
            'message': 'Conta criada com sucesso!',
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email,
                'is_admin': new_user.is_admin
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro no registo: {str(e)}\n{traceback.format_exc()}')
        return jsonify({
            'success': False,
            'error': 'Erro ao criar conta. Tente novamente.'
        }), 500


@api.route('/login', methods=['POST'])
def login():
    """
    Login de Utilizador
    ===================
    
    Método: POST
    URL: /api/login
    Autenticação: Nenhuma (público)
    
    Body (JSON):
    {
        "email": "email@exemplo.com",
        "password": "senha",
        "remember": true  // opcional
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({
                'success': False,
                'error': 'Email e password são obrigatórios'
            }), 400
        
        email = data['email'].strip().lower()
        password = data['password']
        remember = data.get('remember', False)
        
        # Buscar utilizador
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({
                'success': False,
                'error': 'Email ou password incorretos'
            }), 401
        
        if not user.is_active:
            return jsonify({
                'success': False,
                'error': 'Conta desativada. Contacte o administrador.'
            }), 403
        
        # Login bem sucedido
        login_user(user, remember=remember)
        
        return jsonify({
            'success': True,
            'message': 'Login efetuado com sucesso!',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': user.is_admin
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Erro no login: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao iniciar sessão'
        }), 500


@api.route('/logout', methods=['POST'])
@login_required
def logout():
    """
    Logout de Utilizador
    ====================
    
    Método: POST
    URL: /api/logout
    Autenticação: Requerida
    """
    logout_user()
    return jsonify({
        'success': True,
        'message': 'Sessão encerrada'
    }), 200


@api.route('/client/messages', methods=['POST'])
@login_required
def create_client_message():
    """Cliente envia mensagem para o administrador"""
    try:
        if current_user.is_admin:
            return jsonify({'success': False, 'error': 'Apenas clientes podem enviar mensagens por aqui'}), 403

        data = request.form if request.form else (request.get_json() or {})
        content = data.get('content', '').strip()
        subject = data.get('subject', 'Mensagem do cliente').strip() or 'Mensagem do cliente'
        attachment_url, attachment_name, attachment_type = save_message_attachment(request.files.get('attachment'))

        if not content:
            return jsonify({'success': False, 'error': 'Mensagem e obrigatoria'}), 400

        message = ContactMessage(
            user_id=current_user.id,
            name=current_user.username,
            email=current_user.email,
            subject=subject,
            content=content,
            sender_role='client',
            attachment_url=attachment_url,
            attachment_name=attachment_name,
            attachment_type=attachment_type,
            is_read=False,
            is_replied=False
        )
        db.session.add(message)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Mensagem enviada com sucesso!',
            'item': serialize_message(message)
        }), 201

    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao criar mensagem do cliente: {str(e)}')
        return jsonify({'success': False, 'error': 'Erro ao enviar mensagem'}), 500


@api.route('/user', methods=['GET'])
@login_required
def get_current_user():
    """
    Obter Dados do Utilizador Atual
    =================================
    
    Método: GET
    URL: /api/user
    Autenticação: Requerida
    """
    return jsonify({
        'success': True,
        'user': {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'is_admin': current_user.is_admin,
            'created_at': current_user.created_at.isoformat()
        }
    }), 200


@api.route('/client/profile', methods=['GET'])
@login_required
def client_profile():
    """
    Perfil do Cliente
    Retorna dados do utilizador + projetos e mensagens associados.
    """
    if current_user.is_admin:
        return jsonify({'success': False, 'error': 'Apenas clientes'}), 403

    projects = Project.query.filter_by(client_id=current_user.id).order_by(Project.created_at.desc()).all()
    messages = ContactMessage.query.filter(
        (ContactMessage.user_id == current_user.id) | (ContactMessage.email == current_user.email)
    ).order_by(ContactMessage.created_at.desc()).all()

    return jsonify({
        'success': True,
        'user': {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'created_at': current_user.created_at.isoformat()
        },
        'projects': [{
            'id': p.id,
            'title': p.title,
            'description': p.description,
            'category': p.category,
            'status': p.status,
            'location': p.location,
            'area_sqm': float(p.area_sqm) if p.area_sqm else None,
            'created_at': p.created_at.isoformat()
        } for p in projects],
        'messages': [{
            'id': m.id,
            'subject': m.subject,
            'content': m.content,
            'sender_role': getattr(m, 'sender_role', 'client'),
            'attachment_url': getattr(m, 'attachment_url', None),
            'attachment_name': getattr(m, 'attachment_name', None),
            'attachment_type': getattr(m, 'attachment_type', None),
            'created_at': m.created_at.isoformat(),
            'is_read': m.is_read,
            'is_replied': m.is_replied
        } for m in messages]
    }), 200


# ============================================
# 2. ROTAS DE ORÇAMENTO (PÚBLICO)
# ============================================

@api.route('/quotes', methods=['POST'])
def submit_quote():
    """
    Submeter Pedido de Orçamento (PÚBLICO)
    =======================================
    
    Método: POST
    URL: /api/quotes
    Autenticação: Nenhuma (público)
    
    Body (JSON):
    {
        "client_name": "Nome Cliente",
        "client_email": "email@exemplo.com",
        "client_phone": "+244 XXX XXX XXX",
        "service_type": "Projeto Arquitetônico",
        "project_type": "Residencial",
        "description": "Descrição do projeto...",
        "budget_range": "50.000 - 100.000",
        "location": "Talatona, Luanda"
    }
    
    AÇÃO: Envia e-mail para o administrador
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Nenhum dado fornecido'
            }), 400
        
        # Validação de campos obrigatórios
        required = ['client_name', 'client_email', 'service_type', 'description']
        for field in required:
            if field not in data or not data[field].strip():
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório: {field}'
                }), 400
        
        # Criar registo do orçamento
        quote = Quote(
            client_name=data['client_name'].strip(),
            client_email=data['client_email'].strip().lower(),
            client_phone=data.get('client_phone', '').strip(),
            service_type=data['service_type'].strip(),
            project_type=data.get('project_type', '').strip(),
            description=data['description'].strip(),
            budget_range=data.get('budget_range', '').strip(),
            location=data.get('location', '').strip(),
            status='pendente',
            user_id=current_user.id if current_user.is_authenticated else None
        )
        
        db.session.add(quote)
        db.session.commit()
        
        # ========================================
        # ENVIO DE E-MAIL PARA O ADMINISTRADOR
        # ========================================
        try:
            mail = current_app.extensions.get('mail')
            if mail:
                msg = Message(
                    subject=f'📩 Novo Orçamento: {quote.service_type} - {quote.client_name}',
                    recipients=[current_app.config.get('ADMIN_EMAIL', 'nelsonbambi177@gmail.com')],
                    html=f"""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #FACC15; padding: 20px; text-align: center;">
                            <h1 style="color: #1F2937; margin: 0;">DOIS LADOS</h1>
                            <p style="color: #374151; margin: 5px 0;">Novo Pedido de Orçamento</p>
                        </div>
                        
                        <div style="padding: 30px; background: #F9FAFB;">
                            <h2 style="color: #111827; border-bottom: 2px solid #FACC15; padding-bottom: 10px;">
                                Detalhes do Pedido
                            </h2>
                            
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; color: #6B7280;">Nome:</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; font-weight: bold;">{quote.client_name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; color: #6B7280;">Email:</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #E5E7EB;">
                                        <a href="mailto:{quote.client_email}">{quote.client_email}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; color: #6B7280;">Telefone:</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #E5E7EB;">{quote.client_phone or 'Não fornecido'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; color: #6B7280;">Serviço:</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; color: #FACC15; font-weight: bold;">
                                        {quote.service_type}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; color: #6B7280;">Tipo Projeto:</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #E5E7EB;">{quote.project_type or 'Não especificado'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; color: #6B7280;">Orçamento:</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #E5E7EB;">{quote.budget_range or 'Não especificado'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; color: #6B7280;">Localização:</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #E5E7EB;">{quote.location or 'Não especificada'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; color: #6B7280;">Data:</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #E5E7EB;">{quote.created_at.strftime('%d/%m/%Y %H:%M')}</td>
                                </tr>
                            </table>
                            
                            <div style="margin-top: 20px;">
                                <h3 style="color: #111827;">Descrição do Projeto:</h3>
                                <p style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #FACC15;">
                                    {quote.description}
                                </p>
                            </div>
                            
                            <div style="margin-top: 30px; text-align: center;">
                                <a href="{request.host_url}admin/quotes/{quote.id}" 
                                   style="background: #FACC15; color: #1F2937; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                    Ver no Painel Admin →
                                </a>
                            </div>
                        </div>
                        
                        <div style="background: #1F2937; color: #9CA3AF; padding: 20px; text-align: center; font-size: 12px;">
                            <p>Dois Lados - Arquitetura e Construção<br>
                            Luanda, Angola | Este é um email automático do sistema</p>
                        </div>
                    </div>
                    """
                )
                mail.send(msg)
                current_app.logger.info(f'Email de orçamento enviado para admin: {quote.id}')
        except Exception as mail_error:
            # Não falhar se o email falhar - registar o orçamento é mais importante
            current_app.logger.error(f'Erro ao enviar email: {str(mail_error)}')
        
        return jsonify({
            'success': True,
            'message': 'Orçamento submetido com sucesso! Entraremos em contacto em breve.',
            'quote_id': quote.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao submeter orçamento: {str(e)}\n{traceback.format_exc()}')
        return jsonify({
            'success': False,
            'error': 'Erro ao processar orçamento. Tente novamente.'
        }), 500


# ============================================
# 3. DASHBOARD ADMINISTRATIVO
# ============================================

@api.route('/admin/dashboard', methods=['GET'])
@admin_required
def get_dashboard_stats():
    """
    Estatísticas do Dashboard
    ==========================
    
    Método: GET
    URL: /api/admin/dashboard
    Autenticação: Admin
    """
    try:
        total_users = User.query.count()
        total_projects = Project.query.count()
        total_quotes = Quote.query.count()
        pending_quotes = Quote.query.filter_by(status='pendente').count()
        total_messages = ContactMessage.query.count()
        unread_messages = ContactMessage.query.filter_by(is_read=False).count()
        
        # Projetos por status
        projects_by_status = db.session.query(
            Project.status, db.func.count(Project.id)
        ).group_by(Project.status).all()
        
        projects_status_dict = {status: count for status, count in projects_by_status}
        
        # Orçamentos recentes (últimos 7 dias)
        recent_quotes = Quote.query.filter(
            Quote.created_at >= datetime.utcnow().replace(day=1)
        ).count()
        
        return jsonify({
            'success': True,
            'stats': {
                'users': total_users,
                'projects': total_projects,
                'quotes': total_quotes,
                'pending_quotes': pending_quotes,
                'messages': total_messages,
                'unread_messages': unread_messages,
                'recent_quotes': recent_quotes,
                'projects_by_status': projects_status_dict
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Erro ao buscar stats: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao carregar estatísticas'
        }), 500


# ============================================
# 4. GESTÃO DE PROJETOS (CRUD COMPLETO)
# ============================================

@api.route('/admin/projects', methods=['GET'])
@admin_required
def get_projects():
    """
    Listar Todos os Projetos
    ==========================
    
    Método: GET
    URL: /api/admin/projects
    Query Params: ?status=em_progresso&category=residencial
    
    Autenticação: Admin
    """
    try:
        # Filtros
        status = request.args.get('status')
        category = request.args.get('category')
        
        query = Project.query
        
        if status:
            query = query.filter_by(status=status)
        if category:
            query = query.filter_by(category=category)
        
        projects = query.order_by(Project.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'projects': [{
                'id': p.id,
                'title': p.title,
                'description': p.description,
                'category': p.category,
                'status': p.status,
                'client_id': p.client_id,
                'client_name': p.client.username if p.client else None,
                'budget': float(p.budget) if p.budget else None,
                'location': p.location,
                'area_sqm': float(p.area_sqm) if p.area_sqm else None,
                'start_date': p.start_date.isoformat() if p.start_date else None,
                'end_date': p.end_date.isoformat() if p.end_date else None,
                'created_at': p.created_at.isoformat(),
                'phases_count': p.phases.count()
            } for p in projects]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Erro ao listar projetos: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao carregar projetos'
        }), 500


@api.route('/admin/projects', methods=['POST'])
@admin_required
def create_project():
    """
    Criar Novo Projeto
    ==================
    
    Método: POST
    URL: /api/admin/projects
    Autenticação: Admin
    """
    try:
        data = request.get_json()
        
        if not data or 'title' not in data:
            return jsonify({
                'success': False,
                'error': 'Título é obrigatório'
            }), 400
        
        project = Project(
            title=data['title'].strip(),
            description=data.get('description', '').strip(),
            category=data.get('category', 'residencial'),
            status=data.get('status', 'orcamento'),
            client_id=data.get('client_id'),
            budget=data.get('budget'),
            location=data.get('location', '').strip(),
            area_sqm=data.get('area_sqm'),
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date() if data.get('start_date') else None,
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date() if data.get('end_date') else None
        )
        
        db.session.add(project)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Projeto criado com sucesso!',
            'project': {
                'id': project.id,
                'title': project.title
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao criar projeto: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao criar projeto'
        }), 500


@api.route('/admin/projects/<int:project_id>', methods=['GET'])
@admin_required
def get_project(project_id):
    """
    Ver Detalhes de um Projeto
    ===========================
    """
    try:
        project = Project.query.get_or_404(project_id)
        phases = project.phases.order_by(ProjectPhase.phase_order).all()
        
        return jsonify({
            'success': True,
            'project': {
                'id': project.id,
                'title': project.title,
                'description': project.description,
                'category': project.category,
                'status': project.status,
                'client_id': project.client_id,
                'client_name': project.client.username if project.client else None,
                'budget': float(project.budget) if project.budget else None,
                'location': project.location,
                'area_sqm': float(project.area_sqm) if project.area_sqm else None,
                'start_date': project.start_date.isoformat() if project.start_date else None,
                'end_date': project.end_date.isoformat() if project.end_date else None,
                'created_at': project.created_at.isoformat(),
                'phases': [{
                    'id': ph.id,
                    'phase_name': ph.phase_name,
                    'description': ph.description,
                    'phase_order': ph.phase_order,
                    'start_date': ph.start_date.isoformat() if ph.start_date else None,
                    'end_date': ph.end_date.isoformat() if ph.end_date else None,
                    'status': ph.status
                } for ph in phases]
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Erro ao ver projeto: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao carregar projeto'
        }), 500


@api.route('/admin/projects/<int:project_id>', methods=['PUT'])
@admin_required
def update_project(project_id):
    """
    Atualizar Projeto
    =================
    
    Método: PUT
    URL: /api/admin/projects/<id>
    Autenticação: Admin
    
    Permite atualizar:
    - Status (orcamento → em_progresso → concluido)
    - Associar a cliente (client_id)
    - Todas as outras informações
    """
    try:
        project = Project.query.get_or_404(project_id)
        data = request.get_json()
        
        # Atualizar campos fornecidos
        if 'title' in data:
            project.title = data['title'].strip()
        if 'description' in data:
            project.description = data['description'].strip()
        if 'category' in data:
            project.category = data['category']
        if 'status' in data:
            project.status = data['status']
        if 'client_id' in data:
            project.client_id = data['client_id']
        if 'budget' in data:
            project.budget = data['budget']
        if 'location' in data:
            project.location = data['location'].strip()
        if 'area_sqm' in data:
            project.area_sqm = data['area_sqm']
        if 'start_date' in data:
            project.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date() if data['start_date'] else None
        if 'end_date' in data:
            project.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date() if data['end_date'] else None
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Projeto atualizado com sucesso!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao atualizar projeto: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao atualizar projeto'
        }), 500


@api.route('/admin/projects/<int:project_id>', methods=['DELETE'])
@admin_required
def delete_project(project_id):
    """
    Eliminar Projeto
    =================
    """
    try:
        project = Project.query.get_or_404(project_id)
        db.session.delete(project)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Projeto eliminado com sucesso!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao eliminar projeto: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao eliminar projeto'
        }), 500


# ============================================
# 5. GESTÃO DE FASES / CRONOGRAMA
# ============================================

@api.route('/admin/projects/<int:project_id>/phases', methods=['GET'])
@admin_required
def get_phases(project_id):
    """Listar fases de um projeto"""
    try:
        project = Project.query.get_or_404(project_id)
        phases = project.phases.order_by(ProjectPhase.phase_order).all()
        
        return jsonify({
            'success': True,
            'phases': [{
                'id': ph.id,
                'phase_name': ph.phase_name,
                'description': ph.description,
                'phase_order': ph.phase_order,
                'start_date': ph.start_date.isoformat() if ph.start_date else None,
                'end_date': ph.end_date.isoformat() if ph.end_date else None,
                'status': ph.status
            } for ph in phases]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Erro ao listar fases: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao carregar fases'
        }), 500


@api.route('/admin/projects/<int:project_id>/phases', methods=['POST'])
@admin_required
def create_phase(project_id):
    """
    Criar Nova Fase no Cronograma
    ==============================
    
    Método: POST
    URL: /api/admin/projects/<id>/phases
    
    Body (JSON):
    {
        "phase_name": "Planeamento",
        "description": "...",
        "phase_order": 1,
        "start_date": "2024-01-15",
        "end_date": "2024-02-15",
        "status": "pendente"
    }
    """
    try:
        project = Project.query.get_or_404(project_id)
        data = request.get_json()
        
        if not data or 'phase_name' not in data:
            return jsonify({
                'success': False,
                'error': 'Nome da fase é obrigatório'
            }), 400
        
        phase = ProjectPhase(
            project_id=project_id,
            phase_name=data['phase_name'].strip(),
            description=data.get('description', '').strip(),
            phase_order=data.get('phase_order', 1),
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date() if data.get('start_date') else None,
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date() if data.get('end_date') else None,
            status=data.get('status', 'pendente')
        )
        
        db.session.add(phase)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Fase adicionada com sucesso!',
            'phase': {
                'id': phase.id,
                'phase_name': phase.phase_name
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao criar fase: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao criar fase'
        }), 500


@api.route('/admin/phases/<int:phase_id>', methods=['PUT'])
@admin_required
def update_phase(phase_id):
    """
    Atualizar Fase do Cronograma
    =============================
    
    Método: PUT
    URL: /api/admin/phases/<id>
    
    Permite atualizar datas, status, ordem, etc.
    """
    try:
        phase = ProjectPhase.query.get_or_404(phase_id)
        data = request.get_json()
        
        if 'phase_name' in data:
            phase.phase_name = data['phase_name'].strip()
        if 'description' in data:
            phase.description = data['description'].strip()
        if 'phase_order' in data:
            phase.phase_order = data['phase_order']
        if 'start_date' in data:
            phase.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date() if data['start_date'] else None
        if 'end_date' in data:
            phase.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date() if data['end_date'] else None
        if 'status' in data:
            phase.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Fase atualizada com sucesso!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao atualizar fase: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao atualizar fase'
        }), 500


@api.route('/admin/phases/<int:phase_id>', methods=['DELETE'])
@admin_required
def delete_phase(phase_id):
    """Eliminar fase do cronograma"""
    try:
        phase = ProjectPhase.query.get_or_404(phase_id)
        db.session.delete(phase)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Fase eliminada com sucesso!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao eliminar fase: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao eliminar fase'
        }), 500


# ============================================
# 6. GESTÃO DE ORÇAMENTOS
# ============================================

@api.route('/admin/quotes', methods=['GET'])
@admin_required
def get_quotes():
    """
    Listar Todos os Orçamentos
    ===========================
    
    Método: GET
    URL: /api/admin/quotes
    Query Params: ?status=pendente
    
    Autenticação: Admin
    """
    try:
        status = request.args.get('status')
        query = Quote.query
        
        if status:
            query = query.filter_by(status=status)
        
        quotes = query.order_by(Quote.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'quotes': [{
                'id': q.id,
                'client_name': q.client_name,
                'client_email': q.client_email,
                'client_phone': q.client_phone,
                'service_type': q.service_type,
                'project_type': q.project_type,
                'description': q.description,
                'budget_range': q.budget_range,
                'location': q.location,
                'status': q.status,
                'admin_notes': q.admin_notes,
                'created_at': q.created_at.isoformat()
            } for q in quotes]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Erro ao listar orçamentos: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao carregar orçamentos'
        }), 500


@api.route('/admin/quotes/<int:quote_id>', methods=['PUT'])
@admin_required
def update_quote(quote_id):
    """
    Atualizar Status do Orçamento
    =============================
    
    Método: PUT
    URL: /api/admin/quotes/<id>
    Autenticação: Admin
    
    Body (JSON):
    {
        "status": "aprovado",
        "admin_notes": "Notas sobre o orçamento..."
    }
    
    Status possíveis:
    - pendente (azul)
    - analise (amarelo)
    - aprovado (verde)
    - rejeitado (vermelho)
    """
    try:
        quote = Quote.query.get_or_404(quote_id)
        data = request.get_json()
        
        if 'status' in data:
            quote.status = data['status']
        if 'admin_notes' in data:
            quote.admin_notes = data['admin_notes'].strip()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Orçamento atualizado!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao atualizar orçamento: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao atualizar orçamento'
        }), 500


@api.route('/admin/quotes/<int:quote_id>', methods=['DELETE'])
@admin_required
def delete_quote(quote_id):
    """Eliminar orçamento"""
    try:
        quote = Quote.query.get_or_404(quote_id)
        db.session.delete(quote)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Orçamento eliminado!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao eliminar orçamento: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao eliminar orçamento'
        }), 500


# ============================================
# 7. GESTÃO DE MENSAGENS DE CONTACTO
# ============================================

@api.route('/admin/messages', methods=['GET'])
@admin_required
def get_messages():
    """Listar mensagens de contacto"""
    try:
        messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'messages': [serialize_message(m) for m in messages]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Erro ao listar mensagens: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao carregar mensagens'
        }), 500


@api.route('/admin/messages', methods=['POST'])
@admin_required
def create_admin_message():
    """Admin envia mensagem interna a um cliente"""
    try:
        data = request.form if request.form else (request.get_json() or {})
        user_id = data.get('user_id')
        content = data.get('content', '').strip()
        subject = data.get('subject', 'Mensagem da administracao').strip() or 'Mensagem da administracao'

        if not user_id:
            return jsonify({'success': False, 'error': 'Cliente e obrigatorio'}), 400
        if not content:
            return jsonify({'success': False, 'error': 'Mensagem e obrigatoria'}), 400

        client = User.query.get_or_404(int(user_id))
        attachment_url, attachment_name, attachment_type = save_message_attachment(request.files.get('attachment'))

        message = ContactMessage(
            user_id=client.id,
            name=current_user.username,
            email=client.email,
            subject=subject,
            content=content,
            sender_role='admin',
            attachment_url=attachment_url,
            attachment_name=attachment_name,
            attachment_type=attachment_type,
            is_read=False,
            is_replied=True
        )
        db.session.add(message)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Mensagem enviada!',
            'item': serialize_message(message)
        }), 201

    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao enviar mensagem admin: {str(e)}')
        return jsonify({'success': False, 'error': 'Erro ao enviar mensagem'}), 500


@api.route('/admin/messages/<int:message_id>', methods=['PUT'])
@admin_required
def update_message(message_id):
    """Marcar mensagem como lida"""
    try:
        message = ContactMessage.query.get_or_404(message_id)
        data = request.get_json()
        
        if 'is_read' in data:
            message.is_read = data['is_read']
        if 'is_replied' in data:
            message.is_replied = data['is_replied']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Mensagem atualizada!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao atualizar mensagem: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao atualizar mensagem'
        }), 500


@api.route('/admin/messages/<int:message_id>', methods=['DELETE'])
@admin_required
def delete_message(message_id):
    """Eliminar mensagem"""
    try:
        message = ContactMessage.query.get_or_404(message_id)
        db.session.delete(message)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Mensagem eliminada!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao eliminar mensagem: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao eliminar mensagem'
        }), 500


# ============================================
# 8. GESTÃO DE PORTFÓLIO
# ============================================

@api.route('/admin/portfolio', methods=['GET'])
@admin_required
def get_portfolio_admin():
    """Listar todos os itens do portfólio (admin)"""
    try:
        items = PortfolioItem.query.order_by(PortfolioItem.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'portfolio': [{
                'id': p.id,
                'title': p.title,
                'description': p.description,
                'category': p.category,
                'image_url': p.image_url,
                'thumbnail_url': p.thumbnail_url,
                'location': p.location,
                'area_sqm': float(p.area_sqm) if p.area_sqm else None,
                'year': p.year,
                'is_featured': p.is_featured,
                'is_active': p.is_active,
                'created_at': p.created_at.isoformat()
            } for p in items]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Erro ao listar portfólio: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao carregar portfólio'
        }), 500


@api.route('/admin/portfolio', methods=['POST'])
@admin_required
def create_portfolio_item():
    """
    Criar Item no Portfólio
    =======================
    
    Método: POST
    URL: /api/admin/portfolio
    Autenticação: Admin
    
    Body (JSON):
    {
        "title": "Villa Talatona",
        "description": "Moradia de luxo...",
        "category": "residencial",
        "image_url": "/static/uploads/villa.jpg",
        "location": "Talatona, Luanda",
        "area_sqm": 350,
        "year": 2024,
        "is_featured": true
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'title' not in data or 'image_url' not in data:
            return jsonify({
                'success': False,
                'error': 'Título e imagem são obrigatórios'
            }), 400
        
        item = PortfolioItem(
            title=data['title'].strip(),
            description=data.get('description', '').strip(),
            category=data.get('category', 'residencial'),
            image_url=data['image_url'].strip(),
            thumbnail_url=data.get('thumbnail_url', '').strip(),
            location=data.get('location', '').strip(),
            area_sqm=data.get('area_sqm'),
            year=data.get('year'),
            is_featured=data.get('is_featured', False)
        )
        
        db.session.add(item)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Item adicionado ao portfólio!',
            'item': {
                'id': item.id,
                'title': item.title
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao criar item: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao criar item'
        }), 500


@api.route('/admin/portfolio/<int:item_id>', methods=['PUT'])
@admin_required
def update_portfolio_item(item_id):
    """Atualizar item do portfólio"""
    try:
        item = PortfolioItem.query.get_or_404(item_id)
        data = request.get_json()
        
        if 'title' in data:
            item.title = data['title'].strip()
        if 'description' in data:
            item.description = data['description'].strip()
        if 'category' in data:
            item.category = data['category']
        if 'image_url' in data:
            item.image_url = data['image_url'].strip()
        if 'thumbnail_url' in data:
            item.thumbnail_url = data['thumbnail_url'].strip()
        if 'location' in data:
            item.location = data['location'].strip()
        if 'area_sqm' in data:
            item.area_sqm = data['area_sqm']
        if 'year' in data:
            item.year = data['year']
        if 'is_featured' in data:
            item.is_featured = data['is_featured']
        if 'is_active' in data:
            item.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Item atualizado!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao atualizar item: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao atualizar item'
        }), 500


@api.route('/admin/portfolio/<int:item_id>', methods=['DELETE'])
@admin_required
def delete_portfolio_item(item_id):
    """Eliminar item do portfólio"""
    try:
        item = PortfolioItem.query.get_or_404(item_id)
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Item eliminado!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao eliminar item: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao eliminar item'
        }), 500


# ============================================
# 9. GESTÃO DE UTILIZADORES (ADMIN)
# ============================================

# ============================================
# 9. GESTAO DE PUBLICACOES (ADMIN)
# ============================================

@api.route('/admin/publications', methods=['GET'])
@admin_required
def get_publications_admin():
    """Listar publicacoes para o painel admin"""
    try:
        items = Publication.query.order_by(Publication.created_at.desc()).all()
        return jsonify({
            'success': True,
            'publications': [serialize_publication(item) for item in items]
        }), 200
    except Exception as e:
        current_app.logger.error(f'Erro ao listar publicacoes: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao carregar publicacoes'
        }), 500


@api.route('/admin/publications', methods=['POST'])
@admin_required
def create_publication():
    """Criar noticia, atividade, evento, publicidade ou obra"""
    try:
        payload, error = parse_publication_payload(request.get_json())
        if error:
            message, status = error
            return jsonify({'success': False, 'error': message}), status

        item = Publication(**payload)
        db.session.add(item)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Publicacao criada com sucesso!',
            'publication': serialize_publication(item)
        }), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao criar publicacao: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao criar publicacao'
        }), 500


@api.route('/admin/publications/<int:publication_id>', methods=['PUT'])
@admin_required
def update_publication(publication_id):
    """Atualizar publicacao"""
    try:
        item = Publication.query.get_or_404(publication_id)
        payload, error = parse_publication_payload(request.get_json(), item)
        if error:
            message, status = error
            return jsonify({'success': False, 'error': message}), status

        for field, value in payload.items():
            setattr(item, field, value)

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Publicacao atualizada!',
            'publication': serialize_publication(item)
        }), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao atualizar publicacao: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao atualizar publicacao'
        }), 500


@api.route('/admin/publications/<int:publication_id>', methods=['DELETE'])
@admin_required
def delete_publication(publication_id):
    """Eliminar publicacao"""
    try:
        item = Publication.query.get_or_404(publication_id)
        db.session.delete(item)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Publicacao eliminada!'
        }), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao eliminar publicacao: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao eliminar publicacao'
        }), 500


@api.route('/admin/users', methods=['GET'])
@admin_required
def get_users():
    """Listar todos os utilizadores"""
    try:
        users = User.query.order_by(User.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'users': [{
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'is_admin': u.is_admin,
                'is_active': u.is_active,
                'created_at': u.created_at.isoformat(),
                'projects_count': u.projects.count()
            } for u in users]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Erro ao listar utilizadores: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao carregar utilizadores'
        }), 500


@api.route('/admin/users', methods=['POST'])
@admin_required
def create_user_admin():
    """Criar cliente ou administrador pelo painel admin"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'error': 'Nenhum dado fornecido'
            }), 400

        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        is_admin = bool(data.get('is_admin', False))

        if not username or not email or not password:
            return jsonify({
                'success': False,
                'error': 'Nome, email e password sao obrigatorios'
            }), 400

        if len(password) < 6:
            return jsonify({
                'success': False,
                'error': 'Password deve ter pelo menos 6 caracteres'
            }), 400

        if User.query.filter_by(username=username).first():
            return jsonify({
                'success': False,
                'error': 'Nome de utilizador ja existe'
            }), 409

        if User.query.filter_by(email=email).first():
            return jsonify({
                'success': False,
                'error': 'Email ja existe'
            }), 409

        user = User(
            username=username,
            email=email,
            is_admin=is_admin,
            is_active=True
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Utilizador criado com sucesso!',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': user.is_admin,
                'is_active': user.is_active,
                'created_at': user.created_at.isoformat(),
                'projects_count': 0
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao criar utilizador: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao criar utilizador'
        }), 500


@api.route('/admin/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """
    Ativar/Desativar utilizador ou promover a admin
    ===============================================
    """
    try:
        # Impedir que um admin se desative a si mesmo
        if user_id == current_user.id:
            return jsonify({
                'success': False,
                'error': 'Não pode alterar a sua própria conta!'
            }), 400
        
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        if 'is_admin' in data:
            user.is_admin = data['is_admin']
        if 'is_active' in data:
            user.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Utilizador atualizado!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao atualizar utilizador: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao atualizar utilizador'
        }), 500


@api.route('/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Eliminar utilizador"""
    try:
        if user_id == current_user.id:
            return jsonify({
                'success': False,
                'error': 'Não pode eliminar a sua própria conta!'
            }), 400
        
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Utilizador eliminado!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao eliminar utilizador: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao eliminar utilizador'
        }), 500


# ============================================
# 10. ROTAS PÚBLICAS (SEM AUTENTICAÇÃO)
# ============================================

@api.route('/portfolio', methods=['GET'])
def get_portfolio_public():
    """
    Listar Portfólio Público
    ========================
    
    Método: GET
    URL: /api/portfolio
    Autenticação: Nenhuma
    
    Query Params: ?category=residencial
    """
    try:
        category = request.args.get('category')
        
        query = PortfolioItem.query.filter_by(is_active=True)
        
        if category:
            query = query.filter_by(category=category)
        
        items = query.order_by(PortfolioItem.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'portfolio': [{
                'id': p.id,
                'title': p.title,
                'description': p.description,
                'category': p.category,
                'image_url': p.image_url,
                'location': p.location,
                'area_sqm': float(p.area_sqm) if p.area_sqm else None,
                'year': p.year
            } for p in items]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Erro ao listar portfólio: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao carregar portfólio'
        }), 500


@api.route('/publications', methods=['GET'])
def get_publications_public():
    """Listar publicacoes publicas"""
    try:
        category = request.args.get('category')
        query = Publication.query.filter_by(is_active=True)

        if category:
            if category not in PUBLICATION_CATEGORIES:
                return jsonify({'success': False, 'error': 'Categoria invalida'}), 400
            query = query.filter_by(category=category)

        items = query.order_by(Publication.is_featured.desc(), Publication.created_at.desc()).all()

        return jsonify({
            'success': True,
            'publications': [serialize_publication(item) for item in items]
        }), 200
    except Exception as e:
        current_app.logger.error(f'Erro ao listar publicacoes publicas: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao carregar publicacoes'
        }), 500


@api.route('/projects/public', methods=['GET'])
def get_projects_public():
    """Listar projetos públicos (apenas concluídos ou em destaque)"""
    try:
        projects = Project.query.filter(
            Project.status.in_(['concluido', 'em_progresso'])
        ).order_by(Project.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'projects': [{
                'id': p.id,
                'title': p.title,
                'description': p.description,
                'category': p.category,
                'status': p.status,
                'location': p.location,
                'area_sqm': float(p.area_sqm) if p.area_sqm else None
            } for p in projects]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f'Erro ao listar projetos: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao carregar projetos'
        }), 500


@api.route('/applications', methods=['POST'])
def submit_job_application():
    """Receber candidatura de recrutamento e enviar email com CV anexado."""
    try:
        name = (request.form.get('name') or '').strip()
        email = (request.form.get('email') or '').strip().lower()
        phone = (request.form.get('phone') or '').strip()
        message_text = (request.form.get('message') or '').strip()
        publication_title = (request.form.get('publication_title') or 'Vaga de Recrutamento').strip()
        publication_id = request.form.get('publication_id')

        required_fields = {
            'Nome Completo': name,
            'E-mail de Contacto': email,
            'Telefone': phone,
            'Mensagem': message_text,
        }
        missing = [label for label, value in required_fields.items() if not value]
        if missing:
            return jsonify({
                'success': False,
                'error': f"Campos obrigatorios em falta: {', '.join(missing)}"
            }), 400

        cv_path, cv_name, cv_mimetype = save_application_cv(request.files.get('cv'))

        mail = current_app.extensions.get('mail')
        if not mail:
            return jsonify({
                'success': False,
                'error': 'Servico de email indisponivel'
            }), 503

        subject = f'[Nova Candidatura] - {publication_title} - {name}'
        recipient = current_app.config.get('APPLICATION_EMAIL', 'doislados08@gmail.com')
        msg = Message(subject=subject, recipients=[recipient])
        msg.body = f"""
Nova candidatura recebida pelo site Dois Lados.

Vaga: {publication_title}
ID da publicacao: {publication_id or 'N/A'}

Nome: {name}
Email: {email}
Telefone: {phone}

Mensagem:
{message_text}
        """.strip()
        msg.html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
          <div style="background: #FACC15; padding: 18px 22px;">
            <h1 style="margin: 0; color: #111827;">Nova candidatura</h1>
            <p style="margin: 6px 0 0; color: #374151;">Dois Lados - Recrutamento</p>
          </div>
          <div style="background: #F9FAFB; padding: 24px;">
            <h2 style="margin-top: 0; color: #111827;">{publication_title}</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 9px; color: #6B7280;">Nome</td><td style="padding: 9px; font-weight: bold;">{name}</td></tr>
              <tr><td style="padding: 9px; color: #6B7280;">Email</td><td style="padding: 9px;"><a href="mailto:{email}">{email}</a></td></tr>
              <tr><td style="padding: 9px; color: #6B7280;">Telefone</td><td style="padding: 9px;">{phone}</td></tr>
              <tr><td style="padding: 9px; color: #6B7280;">Publicacao</td><td style="padding: 9px;">{publication_id or 'N/A'}</td></tr>
            </table>
            <h3 style="color: #111827;">Mensagem / Apresentacao</h3>
            <p style="white-space: pre-wrap; background: white; border-left: 4px solid #FACC15; padding: 14px;">{message_text}</p>
            <p style="color: #6B7280;">CV anexado: {cv_name}</p>
          </div>
        </div>
        """

        with open(cv_path, 'rb') as cv_file:
            msg.attach(cv_name, cv_mimetype, cv_file.read())
        mail.send(msg)

        return jsonify({
            'success': True,
            'message': 'Candidatura enviada com sucesso. Obrigado pelo seu interesse!'
        }), 201
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        current_app.logger.error(f'Erro ao enviar candidatura: {str(e)}')
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': 'Nao foi possivel enviar a candidatura. Tente novamente mais tarde.'
        }), 500


@api.route('/contact', methods=['POST'])
def submit_contact():
    """
    Submeter Mensagem de Contacto
    =============================
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Nenhum dado fornecido'
            }), 400
        
        required = ['name', 'email', 'content']
        for field in required:
            if field not in data or not data[field].strip():
                return jsonify({
                    'success': False,
                    'error': f'Campo obrigatório: {field}'
                }), 400
        
        message = ContactMessage(
            user_id=current_user.id if current_user.is_authenticated else None,
            name=data['name'].strip(),
            email=data['email'].strip().lower(),
            phone=data.get('phone', '').strip(),
            subject=data.get('subject', '').strip(),
            content=data['content'].strip()
        )
        
        db.session.add(message)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Mensagem enviada com sucesso!'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao enviar mensagem: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Erro ao enviar mensagem'
        }), 500


# ============================================
# ERRO 404 HANDLER
# ============================================

@api.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint não encontrado'
    }), 404


@api.errorhandler(500)
def server_error(error):
    db.session.rollback()
    return jsonify({
        'success': False,
        'error': 'Erro interno do servidor'
    }), 500
