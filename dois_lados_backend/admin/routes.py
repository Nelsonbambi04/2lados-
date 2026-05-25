# ============================================================
# DOIS LADOS - ROTAS ADMINISTRATIVAS (ADMIN BLUEPRINT)
# ============================================================
# Dashboard e gestão CRUD protegida por autenticação
# ============================================================

from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash
from flask_login import login_required, current_user
from functools import wraps
from werkzeug.utils import secure_filename
from datetime import datetime
import os

# ============================================================
# INSTÂNCIA DO BLUEPRINT
# ============================================================
admin_bp = Blueprint('admin', __name__, 
                     url_prefix='/admin',
                     template_folder='../templates/admin')

# ============================================================
# DECORADOR: VERIFICAR ADMIN
# ============================================================

def admin_required(f):
    """Decorator que verifica se o utilizador é administrador"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return redirect(url_for('auth.login', next=request.url))
        if not current_user.is_admin:
            flash('Acesso restrito a administradores', 'error')
            return redirect(url_for('user.dashboard'))
        return f(*args, **kwargs)
    return decorated_function


def get_models():
    """Obtém os modelos para evitar importações circulares"""
    from models import User, Project, Quote, Message, PortfolioItem, Client, ProjectPhase
    return User, Project, Quote, Message, PortfolioItem, Client, ProjectPhase

# ============================================================
# ════════════════════════════════════════════════════════════
# 📊 DASHBOARD
# ════════════════════════════════════════════════════════════

@admin_bp.route('/dashboard')
@login_required
@admin_required
def dashboard():
    """Dashboard principal com estatísticas"""
    from models import User, Project, Quote, Message, Client
    from sqlalchemy import func
    
    # Estatísticas gerais
    total_users = User.query.count()
    total_projects = Project.query.count()
    total_quotes = Quote.query.count()
    total_messages = Message.query.filter_by(is_read=False).count()
    total_clients = Client.query.count()
    
    # Projetos por status
    projects_planning = Project.query.filter_by(status='planning').count()
    projects_in_progress = Project.query.filter_by(status='in_progress').count()
    projects_completed = Project.query.filter_by(status='completed').count()
    
    # Orçamentos recentes (últimos 7 dias)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_quotes = Quote.query.filter(Quote.created_at >= week_ago).count()
    
    # Mensagens não lidas
    unread_messages = Message.query.filter_by(is_read=False).order_by(Message.created_at.desc()).limit(5).all()
    
    # Projetos recentes
    recent_projects = Project.query.order_by(Project.created_at.desc()).limit(5).all()
    
    # Orçamentos pendentes
    pending_quotes = Quote.query.filter_by(status='pending').order_by(Quote.created_at.desc()).limit(5).all()
    
    stats = {
        'total_users': total_users,
        'total_projects': total_projects,
        'total_quotes': total_quotes,
        'total_messages': unread_messages,
        'total_clients': total_clients,
        'projects_planning': projects_planning,
        'projects_in_progress': projects_in_progress,
        'projects_completed': projects_completed,
        'recent_quotes': recent_quotes
    }
    
    if request.is_json:
        return jsonify({
            'success': True,
            'stats': stats,
            'recent_projects': [p.to_dict() for p in recent_projects],
            'pending_quotes': [q.to_dict() for q in pending_quotes]
        })
    
    return render_template('admin/dashboard.html', 
                           stats=stats,
                           recent_projects=recent_projects,
                           pending_quotes=pending_quotes,
                           unread_messages=unread_messages)


@admin_bp.route('/api/dashboard')
@login_required
@admin_required
def api_dashboard():
    """API: Dados do dashboard"""
    return dashboard()

# ============================================================
# ════════════════════════════════════════════════════════════
# 📁 GESTÃO DE PROJETOS (CRUD COMPLETO)
# ════════════════════════════════════════════════════════════

@admin_bp.route('/projects', methods=['GET'])
@login_required
@admin_required
def list_projects():
    """Lista todos os projetos"""
    from models import Project
    
    # Filtros
    status = request.args.get('status', 'all')
    search = request.args.get('search', '')
    category = request.args.get('category', 'all')
    
    query = Project.query
    
    if status != 'all':
        query = query.filter_by(status=status)
    if category != 'all':
        query = query.filter_by(category=category)
    if search:
        query = query.filter(Project.title.ilike(f'%{search}%'))
    
    projects = query.order_by(Project.created_at.desc()).all()
    
    if request.is_json:
        return jsonify({
            'success': True,
            'projects': [p.to_dict() for p in projects],
            'total': len(projects)
        })
    
    return render_template('admin/projects/list.html', projects=projects)


@admin_bp.route('/projects/new', methods=['GET', 'POST'])
@login_required
@admin_required
def create_project():
    """Cria um novo projeto"""
    from models import Project, Client
    
    clients = Client.query.filter_by(is_active=True).all()
    
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form.to_dict()
        
        title = data.get('title', '').strip()
        description = data.get('description', '')
        category = data.get('category', 'residential')
        client_id = data.get('client_id')
        status = data.get('status', 'planning')
        budget = data.get('budget', 0)
        location = data.get('location', '')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if not title:
            if request.is_json:
                return jsonify({'success': False, 'error': 'Título é obrigatório'}), 400
            flash('Título é obrigatório', 'error')
            return render_template('admin/projects/create.html', clients=clients)
        
        try:
            project = Project(
                title=title,
                description=description,
                category=category,
                client_id=client_id if client_id else None,
                status=status,
                budget=float(budget) if budget else 0,
                location=location,
                start_date=datetime.strptime(start_date, '%Y-%m-%d') if start_date else None,
                end_date=datetime.strptime(end_date, '%Y-%m-%d') if end_date else None,
                created_by=current_user.id
            )
            
            db.session.add(project)
            db.session.commit()
            
            print(f"✅ PROJETO CRIADO: {title} por {current_user.username}")
            
            if request.is_json:
                return jsonify({
                    'success': True,
                    'message': 'Projeto criado com sucesso',
                    'project': project.to_dict()
                }), 201
            
            flash('Projeto criado com sucesso', 'success')
            return redirect(url_for('admin.list_projects'))
            
        except Exception as e:
            db.session.rollback()
            if request.is_json:
                return jsonify({'success': False, 'error': str(e)}), 500
            flash(f'Erro ao criar projeto: {str(e)}', 'error')
    
    return render_template('admin/projects/create.html', clients=clients)


@admin_bp.route('/projects/<int:project_id>', methods=['GET'])
@login_required
@admin_required
def view_project(project_id):
    """Visualiza detalhes de um projeto"""
    from models import Project, ProjectPhase
    
    project = Project.query.get_or_404(project_id)
    phases = ProjectPhase.query.filter_by(project_id=project_id).order_by(ProjectPhase.order_index).all()
    
    if request.is_json:
        return jsonify({
            'success': True,
            'project': project.to_dict(),
            'phases': [p.to_dict() for p in phases]
        })
    
    return render_template('admin/projects/view.html', project=project, phases=phases)


@admin_bp.route('/projects/<int:project_id>/edit', methods=['GET', 'POST', 'PUT'])
@login_required
@admin_required
def edit_project(project_id):
    """Edita um projeto"""
    from models import Project, Client
    
    project = Project.query.get_or_404(project_id)
    clients = Client.query.filter_by(is_active=True).all()
    
    if request.method == 'POST' or request.method == 'PUT':
        data = request.get_json() if request.is_json else request.form.to_dict()
        
        project.title = data.get('title', project.title)
        project.description = data.get('description', project.description)
        project.category = data.get('category', project.category)
        project.client_id = data.get('client_id') or None
        project.status = data.get('status', project.status)
        project.budget = float(data['budget']) if data.get('budget') else project.budget
        project.location = data.get('location', project.location)
        
        if data.get('start_date'):
            project.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
        if data.get('end_date'):
            project.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d')
        
        try:
            db.session.commit()
            print(f"✏️ PROJETO ATUALIZADO: {project.title}")
            
            if request.is_json:
                return jsonify({'success': True, 'project': project.to_dict()})
            
            flash('Projeto atualizado', 'success')
            return redirect(url_for('admin.view_project', project_id=project_id))
            
        except Exception as e:
            db.session.rollback()
            if request.is_json:
                return jsonify({'success': False, 'error': str(e)}), 500
            flash('Erro ao atualizar', 'error')
    
    if request.is_json:
        return jsonify({'success': True, 'project': project.to_dict()})
    
    return render_template('admin/projects/edit.html', project=project, clients=clients)


@admin_bp.route('/projects/<int:project_id>/delete', methods=['POST', 'DELETE'])
@login_required
@admin_required
def delete_project(project_id):
    """Elimina um projeto"""
    from models import Project
    
    project = Project.query.get_or_404(project_id)
    
    try:
        db.session.delete(project)
        db.session.commit()
        print(f"🗑️ PROJETO ELIMINADO: {project.title}")
        
        if request.is_json:
            return jsonify({'success': True, 'message': 'Projeto eliminado'})
        
        flash('Projeto eliminado', 'success')
        return redirect(url_for('admin.list_projects'))
        
    except Exception as e:
        db.session.rollback()
        if request.is_json:
            return jsonify({'success': False, 'error': str(e)}), 500
        flash('Erro ao eliminar', 'error')
        return redirect(url_for('admin.list_projects'))


# API routes para projetos
@admin_bp.route('/api/projects', methods=['GET', 'POST'])
@login_required
@admin_required
def api_projects():
    """API: Listar/Criar projetos"""
    if request.method == 'GET':
        return list_projects()
    return create_project()


@admin_bp.route('/api/projects/<int:project_id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
@admin_required
def api_project(project_id):
    """API: Ver/Editar/Eliminar projeto"""
    if request.method == 'GET':
        return view_project(project_id)
    if request.method == 'PUT':
        return edit_project(project_id)
    return delete_project(project_id)

# ============================================================
# ════════════════════════════════════════════════════════════
# 📅 GESTÃO DE FASES / CRONOGRAMA
# ════════════════════════════════════════════════════════════

@admin_bp.route('/projects/<int:project_id>/phases', methods=['GET', 'POST'])
@login_required
@admin_required
def manage_phases(project_id):
    """Gestão de fases/cronograma de um projeto"""
    from models import Project, ProjectPhase
    
    project = Project.query.get_or_404(project_id)
    
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form.to_dict()
        
        phase_name = data.get('phase_name', '').strip()
        description = data.get('description', '')
        order_index = data.get('order_index', 0)
        status = data.get('status', 'pending')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if not phase_name:
            if request.is_json:
                return jsonify({'success': False, 'error': 'Nome da fase é obrigatório'}), 400
            flash('Nome da fase é obrigatório', 'error')
            return redirect(url_for('admin.manage_phases', project_id=project_id))
        
        try:
            phase = ProjectPhase(
                project_id=project_id,
                phase_name=phase_name,
                description=description,
                order_index=int(order_index),
                status=status,
                start_date=datetime.strptime(start_date, '%Y-%m-%d') if start_date else None,
                end_date=datetime.strptime(end_date, '%Y-%m-%d') if end_date else None
            )
            
            db.session.add(phase)
            db.session.commit()
            
            print(f"✅ FASE CRIADA: {phase_name} no projeto {project.title}")
            
            if request.is_json:
                return jsonify({'success': True, 'phase': phase.to_dict()}), 201
            
            flash('Fase adicionada', 'success')
            
        except Exception as e:
            db.session.rollback()
            if request.is_json:
                return jsonify({'success': False, 'error': str(e)}), 500
            flash(f'Erro: {str(e)}', 'error')
    
    phases = ProjectPhase.query.filter_by(project_id=project_id).order_by(ProjectPhase.order_index).all()
    
    if request.is_json:
        return jsonify({
            'success': True,
            'phases': [p.to_dict() for p in phases]
        })
    
    return render_template('admin/projects/phases.html', project=project, phases=phases)


@admin_bp.route('/projects/<int:project_id>/phases/<int:phase_id>', methods=['PUT', 'DELETE'])
@login_required
@admin_required
def api_phase(project_id, phase_id):
    """API: Editar/Eliminar fase"""
    from models import ProjectPhase
    
    phase = ProjectPhase.query.filter_by(id=phase_id, project_id=project_id).first_or_404()
    
    if request.method == 'PUT':
        data = request.get_json()
        
        phase.phase_name = data.get('phase_name', phase.phase_name)
        phase.description = data.get('description', phase.description)
        phase.status = data.get('status', phase.status)
        phase.order_index = data.get('order_index', phase.order_index)
        
        if data.get('start_date'):
            phase.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
        if data.get('end_date'):
            phase.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d')
        
        try:
            db.session.commit()
            return jsonify({'success': True, 'phase': phase.to_dict()})
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'error': str(e)}), 500
    
    if request.method == 'DELETE':
        try:
            db.session.delete(phase)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Fase eliminada'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'error': str(e)}), 500

# ============================================================
# ════════════════════════════════════════════════════════════
# 💰 GESTÃO DE ORÇAMENTOS
# ════════════════════════════════════════════════════════════

@admin_bp.route('/quotes', methods=['GET'])
@login_required
@admin_required
def list_quotes():
    """Lista todos os orçamentos"""
    from models import Quote
    
    status = request.args.get('status', 'all')
    search = request.args.get('search', '')
    
    query = Quote.query
    
    if status != 'all':
        query = query.filter_by(status=status)
    if search:
        query = query.filter(
            (Quote.client_name.ilike(f'%{search}%')) |
            (Quote.email.ilike(f'%{search}%'))
        )
    
    quotes = query.order_by(Quote.created_at.desc()).all()
    
    if request.is_json:
        return jsonify({
            'success': True,
            'quotes': [q.to_dict() for q in quotes],
            'total': len(quotes)
        })
    
    return render_template('admin/quotes/list.html', quotes=quotes)


@admin_bp.route('/quotes/<int:quote_id>', methods=['GET'])
@login_required
@admin_required
def view_quote(quote_id):
    """Visualiza detalhes de um orçamento"""
    from models import Quote
    
    quote = Quote.query.get_or_404(quote_id)
    
    if request.is_json:
        return jsonify({'success': True, 'quote': quote.to_dict()})
    
    return render_template('admin/quotes/view.html', quote=quote)


@admin_bp.route('/quotes/<int:quote_id>/status', methods=['POST', 'PUT'])
@login_required
@admin_required
def update_quote_status(quote_id):
    """Atualiza o status de um orçamento"""
    from models import Quote
    
    quote = Quote.query.get_or_404(quote_id)
    data = request.get_json() if request.is_json else request.form.to_dict()
    
    new_status = data.get('status')
    admin_notes = data.get('admin_notes', quote.admin_notes)
    
    if new_status:
        old_status = quote.status
        quote.status = new_status
        quote.admin_notes = admin_notes
        quote.processed_by = current_user.id
        quote.processed_at = datetime.utcnow()
        
        try:
            db.session.commit()
            print(f"📝 ORÇAMENTO {quote_id}: {old_status} → {new_status}")
            
            if request.is_json:
                return jsonify({'success': True, 'quote': quote.to_dict()})
            
            flash(f'Status atualizado para: {new_status}', 'success')
            return redirect(url_for('admin.list_quotes'))
            
        except Exception as e:
            db.session.rollback()
            if request.is_json:
                return jsonify({'success': False, 'error': str(e)}), 500
            flash('Erro ao atualizar', 'error')
    
    if request.is_json:
        return jsonify({'success': False, 'error': 'Status não fornecido'}), 400
    return redirect(url_for('admin.view_quote', quote_id=quote_id))


# API routes para orçamentos
@admin_bp.route('/api/quotes', methods=['GET'])
@login_required
@admin_required
def api_quotes():
    """API: Listar orçamentos"""
    return list_quotes()


@admin_bp.route('/api/quotes/<int:quote_id>', methods=['GET', 'PUT'])
@login_required
@admin_required
def api_quote(quote_id):
    """API: Ver/Atualizar orçamento"""
    if request.method == 'GET':
        return view_quote(quote_id)
    return update_quote_status(quote_id)

# ============================================================
# ════════════════════════════════════════════════════════════
# 💬 GESTÃO DE MENSAGENS
# ════════════════════════════════════════════════════════════

@admin_bp.route('/messages', methods=['GET'])
@login_required
@admin_required
def list_messages():
    """Lista todas as mensagens"""
    from models import Message
    
    is_read = request.args.get('is_read', 'all')
    search = request.args.get('search', '')
    
    query = Message.query
    
    if is_read == 'unread':
        query = query.filter_by(is_read=False)
    elif is_read == 'read':
        query = query.filter_by(is_read=True)
    
    if search:
        query = query.filter(
            (Message.name.ilike(f'%{search}%')) |
            (Message.email.ilike(f'%{search}%')) |
            (Message.content.ilike(f'%{search}%'))
        )
    
    messages = query.order_by(Message.created_at.desc()).all()
    unread_count = Message.query.filter_by(is_read=False).count()
    
    if request.is_json:
        return jsonify({
            'success': True,
            'messages': [m.to_dict() for m in messages],
            'unread_count': unread_count
        })
    
    return render_template('admin/messages/list.html', messages=messages, unread_count=unread_count)


@admin_bp.route('/messages/<int:message_id>', methods=['GET'])
@login_required
@admin_required
def view_message(message_id):
    """Visualiza e marca como lida uma mensagem"""
    from models import Message
    
    message = Message.query.get_or_404(message_id)
    
    if not message.is_read:
        message.is_read = True
        message.read_at = datetime.utcnow()
        message.read_by = current_user.id
        db.session.commit()
    
    if request.is_json:
        return jsonify({'success': True, 'message': message.to_dict()})
    
    return render_template('admin/messages/view.html', message=message)


@admin_bp.route('/messages/<int:message_id>/reply', methods=['POST'])
@login_required
@admin_required
def reply_message(message_id):
    """Responde a uma mensagem (envia email)"""
    from models import Message
    from app import mail
    from flask_mail import Message as MailMessage
    
    message = Message.query.get_or_404(message_id)
    data = request.get_json() if request.is_json else request.form.to_dict()
    
    reply_content = data.get('content', '').strip()
    
    if not reply_content:
        if request.is_json:
            return jsonify({'success': False, 'error': 'Conteúdo é obrigatório'}), 400
        flash('Conteúdo é obrigatório', 'error')
        return redirect(url_for('admin.view_message', message_id=message_id))
    
    try:
        # Marcar mensagem como respondida
        message.is_replied = True
        message.replied_at = datetime.utcnow()
        message.replied_by = current_user.id
        db.session.commit()
        
        # TODO: Enviar email real com Flask-Mail
        # mail.send(MailMessage(
        #     subject=f'Re: Sua mensagem - Dois Lados',
        #     recipients=[message.email],
        #     body=reply_content
        # ))
        
        print(f"📧 RESPOSTA ENVIADA para {message.email}")
        
        if request.is_json:
            return jsonify({'success': True, 'message': 'Resposta enviada'})
        
        flash('Resposta enviada com sucesso', 'success')
        return redirect(url_for('admin.list_messages'))
        
    except Exception as e:
        db.session.rollback()
        if request.is_json:
            return jsonify({'success': False, 'error': str(e)}), 500
        flash('Erro ao enviar resposta', 'error')
        return redirect(url_for('admin.view_message', message_id=message_id))


@admin_bp.route('/messages/mark-all-read', methods=['POST'])
@login_required
@admin_required
def mark_all_read():
    """Marca todas as mensagens como lidas"""
    from models import Message
    
    try:
        Message.query.filter_by(is_read=False).update({
            'is_read': True,
            'read_at': datetime.utcnow(),
            'read_by': current_user.id
        })
        db.session.commit()
        
        if request.is_json:
            return jsonify({'success': True, 'message': 'Todas as mensagens marcadas como lidas'})
        
        flash('Todas as mensagens marcadas como lidas', 'success')
        return redirect(url_for('admin.list_messages'))
        
    except Exception as e:
        db.session.rollback()
        if request.is_json:
            return jsonify({'success': False, 'error': str(e)}), 500
        flash('Erro ao atualizar', 'error')
        return redirect(url_for('admin.list_messages'))


# API routes para mensagens
@admin_bp.route('/api/messages', methods=['GET'])
@login_required
@admin_required
def api_messages():
    """API: Listar mensagens"""
    return list_messages()

# ============================================================
# ════════════════════════════════════════════════════════════
# 🖼️ GESTÃO DO PORTFÓLIO
# ════════════════════════════════════════════════════════════

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@admin_bp.route('/portfolio', methods=['GET'])
@login_required
@admin_required
def list_portfolio():
    """Lista todos os itens do portfólio"""
    from models import PortfolioItem
    
    category = request.args.get('category', 'all')
    search = request.args.get('search', '')
    
    query = PortfolioItem.query
    
    if category != 'all':
        query = query.filter_by(category=category)
    if search:
        query = query.filter(PortfolioItem.title.ilike(f'%{search}%'))
    
    items = query.order_by(PortfolioItem.created_at.desc()).all()
    
    if request.is_json:
        return jsonify({
            'success': True,
            'items': [i.to_dict() for i in items],
            'total': len(items)
        })
    
    return render_template('admin/portfolio/list.html', items=items)


@admin_bp.route('/portfolio/new', methods=['GET', 'POST'])
@login_required
@admin_required
def create_portfolio_item():
    """Cria um novo item no portfólio"""
    from models import PortfolioItem
    
    if request.method == 'POST':
        # Tratar dados JSON ou FormData
        if request.is_json:
            data = request.get_json()
            image_url = data.get('image_url', '')
        else:
            data = request.form.to_dict()
            image_file = request.files.get('image')
            image_url = ''
            
            if image_file and allowed_file(image_file.filename):
                filename = secure_filename(f"{datetime.now().timestamp()}_{image_file.filename}")
                upload_folder = os.path.join('static', 'uploads', 'portfolio')
                os.makedirs(upload_folder, exist_ok=True)
                filepath = os.path.join(upload_folder, filename)
                image_file.save(filepath)
                image_url = f'/static/uploads/portfolio/{filename}'
        
        title = data.get('title', '').strip()
        description = data.get('description', '')
        category = data.get('category', 'residential')
        location = data.get('location', '')
        year = data.get('year', datetime.now().year)
        area = data.get('area', 0)
        is_featured = data.get('is_featured', False)
        
        if not title:
            if request.is_json:
                return jsonify({'success': False, 'error': 'Título é obrigatório'}), 400
            flash('Título é obrigatório', 'error')
            return render_template('admin/portfolio/create.html')
        
        try:
            item = PortfolioItem(
                title=title,
                description=description,
                category=category,
                location=location,
                year=int(year),
                area=float(area) if area else 0,
                is_featured=is_featured in [True, 'true', '1', 'on'],
                created_by=current_user.id
            )
            
            if image_url:
                item.image_url = image_url
            
            db.session.add(item)
            db.session.commit()
            
            print(f"✅ PORTFÓLIO CRIADO: {title}")
            
            if request.is_json:
                return jsonify({'success': True, 'item': item.to_dict()}), 201
            
            flash('Item adicionado ao portfólio', 'success')
            return redirect(url_for('admin.list_portfolio'))
            
        except Exception as e:
            db.session.rollback()
            if request.is_json:
                return jsonify({'success': False, 'error': str(e)}), 500
            flash(f'Erro: {str(e)}', 'error')
    
    return render_template('admin/portfolio/create.html')


@admin_bp.route('/portfolio/<int:item_id>/edit', methods=['GET', 'POST', 'PUT'])
@login_required
@admin_required
def edit_portfolio_item(item_id):
    """Edita um item do portfólio"""
    from models import PortfolioItem
    
    item = PortfolioItem.query.get_or_404(item_id)
    
    if request.method == 'POST' or request.method == 'PUT':
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
            image_file = request.files.get('image')
            
            if image_file and allowed_file(image_file.filename):
                filename = secure_filename(f"{datetime.now().timestamp()}_{image_file.filename}")
                upload_folder = os.path.join('static', 'uploads', 'portfolio')
                os.makedirs(upload_folder, exist_ok=True)
                filepath = os.path.join(upload_folder, filename)
                image_file.save(filepath)
                item.image_url = f'/static/uploads/portfolio/{filename}'
        
        item.title = data.get('title', item.title)
        item.description = data.get('description', item.description)
        item.category = data.get('category', item.category)
        item.location = data.get('location', item.location)
        item.year = int(data['year']) if data.get('year') else item.year
        item.area = float(data['area']) if data.get('area') else item.area
        item.is_featured = data.get('is_featured', item.is_featured) in [True, 'true', '1', 'on']
        
        if data.get('image_url'):
            item.image_url = data['image_url']
        
        try:
            db.session.commit()
            
            if request.is_json:
                return jsonify({'success': True, 'item': item.to_dict()})
            
            flash('Item atualizado', 'success')
            return redirect(url_for('admin.list_portfolio'))
            
        except Exception as e:
            db.session.rollback()
            if request.is_json:
                return jsonify({'success': False, 'error': str(e)}), 500
            flash('Erro ao atualizar', 'error')
    
    if request.is_json:
        return jsonify({'success': True, 'item': item.to_dict()})
    
    return render_template('admin/portfolio/edit.html', item=item)


@admin_bp.route('/portfolio/<int:item_id>/delete', methods=['POST', 'DELETE'])
@login_required
@admin_required
def delete_portfolio_item(item_id):
    """Elimina um item do portfólio"""
    from models import PortfolioItem
    
    item = PortfolioItem.query.get_or_404(item_id)
    
    try:
        db.session.delete(item)
        db.session.commit()
        
        if request.is_json:
            return jsonify({'success': True, 'message': 'Item eliminado'})
        
        flash('Item eliminado', 'success')
        return redirect(url_for('admin.list_portfolio'))
        
    except Exception as e:
        db.session.rollback()
        if request.is_json:
            return jsonify({'success': False, 'error': str(e)}), 500
        flash('Erro ao eliminar', 'error')
        return redirect(url_for('admin.list_portfolio'))


# API routes para portfólio
@admin_bp.route('/api/portfolio', methods=['GET', 'POST'])
@login_required
@admin_required
def api_portfolio():
    """API: Listar/Criar itens do portfólio"""
    if request.method == 'GET':
        return list_portfolio()
    return create_portfolio_item()


@admin_bp.route('/api/portfolio/<int:item_id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
@admin_required
def api_portfolio_item(item_id):
    """API: Ver/Editar/Eliminar item"""
    if request.method == 'GET':
        return jsonify({'success': True, 'item': PortfolioItem.query.get_or_404(item_id).to_dict()})
    if request.method == 'PUT':
        return edit_portfolio_item(item_id)
    return delete_portfolio_item(item_id)

# ============================================================
# ════════════════════════════════════════════════════════════
# 📈 RELATÓRIOS E ESTATÍSTICAS
# ════════════════════════════════════════════════════════════

@admin_bp.route('/reports', methods=['GET'])
@login_required
@admin_required
def reports():
    """Página de relatórios e estatísticas"""
    from models import Project, Quote, User, Client
    from sqlalchemy import func
    
    # Projetos por mês (últimos 12 meses)
    twelve_months_ago = datetime.utcnow() - timedelta(days=365)
    
    # Contagens por categoria
    projects_by_category = db.session.query(
        Project.category, func.count(Project.id)
    ).group_by(Project.category).all()
    
    # Orçamentos por status
    quotes_by_status = db.session.query(
        Quote.status, func.count(Quote.id)
    ).group_by(Quote.status).all()
    
    # Receitas estimadas
    total_budget = db.session.query(func.sum(Project.budget)).scalar() or 0
    
    # Novos clientes por mês
    new_clients = Client.query.filter(
        Client.created_at >= twelve_months_ago
    ).count()
    
    reports_data = {
        'projects_by_category': dict(projects_by_category),
        'quotes_by_status': dict(quotes_by_status),
        'total_budget': float(total_budget),
        'new_clients': new_clients
    }
    
    if request.is_json:
        return jsonify({'success': True, 'reports': reports_data})
    
    return render_template('admin/reports.html', reports=reports_data)

# Importar timedelta para as rotas
from datetime import timedelta
