# ============================================================
# DOIS LADOS - ROTAS DE UTILIZADOR (USER BLUEPRINT)
# ============================================================
# Área reservada para clientes/utilizadores normais
# ============================================================

from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash
from flask_login import login_required, current_user
from datetime import datetime

# ============================================================
# INSTÂNCIA DO BLUEPRINT
# ============================================================
user_bp = Blueprint('user', __name__, 
                    url_prefix='/user',
                    template_folder='../templates/user')

# ============================================================
# DECORADOR: VERIFICAR UTILIZADOR NORMAL
# ============================================================

def user_required(f):
    """Decorator que verifica se o utilizador está autenticado (não admin)"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return redirect(url_for('auth.login', next=request.url))
        # Se for admin, também pode aceder (opcional: remover esta linha para impedir)
        return f(*args, **kwargs)
    return decorated_function


# ============================================================
# ════════════════════════════════════════════════════════════
# 📊 DASHBOARD DO UTILIZADOR
# ════════════════════════════════════════════════════════════

@user_bp.route('/dashboard')
@login_required
def dashboard():
    """Dashboard pessoal do utilizador/cliente"""
    from models import Project, Quote, Client, ProjectPhase
    from sqlalchemy import func
    
    # Obter cliente associado
    client = None
    if hasattr(current_user, 'client'):
        client = current_user.client
    
    # Projetos do cliente
    if client:
        projects = Project.query.filter_by(client_id=client.id).order_by(Project.created_at.desc()).all()
    else:
        projects = []
    
    # Orçamentos submetidos
    quotes = Quote.query.filter_by(email=current_user.email).order_by(Quote.created_at.desc()).limit(5).all()
    
    # Estatísticas
    stats = {
        'total_projects': len(projects),
        'projects_in_progress': sum(1 for p in projects if p.status == 'in_progress'),
        'projects_completed': sum(1 for p in projects if p.status == 'completed'),
        'pending_quotes': sum(1 for q in quotes if q.status == 'pending')
    }
    
    if request.is_json:
        return jsonify({
            'success': True,
            'user': current_user.to_dict(),
            'client': client.to_dict() if client else None,
            'projects': [p.to_dict() for p in projects],
            'stats': stats
        })
    
    return render_template('user/dashboard.html', 
                           client=client,
                           projects=projects,
                           quotes=quotes,
                           stats=stats)


@user_bp.route('/api/dashboard')
@login_required
def api_dashboard():
    """API: Dados do dashboard do utilizador"""
    return dashboard()


# ============================================================
# ════════════════════════════════════════════════════════════
# 📁 OS MEUS PROJETOS
# ════════════════════════════════════════════════════════════

@user_bp.route('/projects', methods=['GET'])
@login_required
def my_projects():
    """Lista os projetos do utilizador"""
    from models import Project, Client
    
    client = getattr(current_user, 'client', None)
    
    if not client:
        if request.is_json:
            return jsonify({'success': True, 'projects': [], 'message': 'Sem cliente associado'})
        return render_template('user/projects.html', projects=[], client=None)
    
    projects = Project.query.filter_by(client_id=client.id).order_by(Project.created_at.desc()).all()
    
    if request.is_json:
        return jsonify({
            'success': True,
            'projects': [p.to_dict() for p in projects]
        })
    
    return render_template('user/projects.html', projects=projects, client=client)


@user_bp.route('/projects/<int:project_id>', methods=['GET'])
@login_required
def my_project_detail(project_id):
    """Detalhes de um projeto do utilizador"""
    from models import Project, ProjectPhase, Client
    
    client = getattr(current_user, 'client', None)
    project = Project.query.get_or_404(project_id)
    
    # Verificar se o projeto pertence ao cliente
    if client and project.client_id != client.id:
        if request.is_json:
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403
        flash('Acesso negado a este projeto', 'error')
        return redirect(url_for('user.my_projects'))
    
    phases = ProjectPhase.query.filter_by(project_id=project_id).order_by(ProjectPhase.order_index).all()
    
    if request.is_json:
        return jsonify({
            'success': True,
            'project': project.to_dict(),
            'phases': [p.to_dict() for p in phases]
        })
    
    return render_template('user/project_detail.html', project=project, phases=phases)


@user_bp.route('/projects/<int:project_id>/phases', methods=['GET'])
@login_required
def my_project_phases(project_id):
    """Fases/cronograma de um projeto"""
    from models import Project, ProjectPhase, Client
    
    client = getattr(current_user, 'client', None)
    project = Project.query.get_or_404(project_id)
    
    if client and project.client_id != client.id:
        if request.is_json:
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403
        return redirect(url_for('user.my_projects'))
    
    phases = ProjectPhase.query.filter_by(project_id=project_id).order_by(ProjectPhase.order_index).all()
    
    if request.is_json:
        return jsonify({
            'success': True,
            'project': project.to_dict(),
            'phases': [p.to_dict() for p in phases]
        })
    
    return render_template('user/project_phases.html', project=project, phases=phases)


# ============================================================
# ════════════════════════════════════════════════════════════
# 💰 OS MEUS ORÇAMENTOS
# ════════════════════════════════════════════════════════════

@user_bp.route('/quotes', methods=['GET'])
@login_required
def my_quotes():
    """Lista os orçamentos do utilizador"""
    from models import Quote
    
    quotes = Quote.query.filter_by(email=current_user.email).order_by(Quote.created_at.desc()).all()
    
    if request.is_json:
        return jsonify({
            'success': True,
            'quotes': [q.to_dict() for q in quotes]
        })
    
    return render_template('user/quotes.html', quotes=quotes)


@user_bp.route('/quotes/<int:quote_id>', methods=['GET'])
@login_required
def my_quote_detail(quote_id):
    """Detalhes de um orçamento"""
    from models import Quote
    
    quote = Quote.query.get_or_404(quote_id)
    
    # Verificar se pertence ao utilizador
    if quote.email != current_user.email:
        if request.is_json:
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403
        flash('Acesso negado a este orçamento', 'error')
        return redirect(url_for('user.my_quotes'))
    
    if request.is_json:
        return jsonify({'success': True, 'quote': quote.to_dict()})
    
    return render_template('user/quote_detail.html', quote=quote)


# ============================================================
# ════════════════════════════════════════════════════════════
# 📝 SOLICITAR NOVO ORÇAMENTO
# ════════════════════════════════════════════════════════════

@user_bp.route('/quotes/new', methods=['GET', 'POST'])
@login_required
def request_quote():
    """Formulário para solicitar novo orçamento"""
    from models import Quote, Service
    
    services = Service.query.filter_by(is_active=True).all()
    
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form.to_dict()
        
        service_type = data.get('service_type', '').strip()
        project_type = data.get('project_type', '')
        description = data.get('description', '').strip()
        budget_range = data.get('budget_range', '')
        location = data.get('location', '').strip()
        preferred_date = data.get('preferred_date', '')
        
        # Validações
        errors = []
        
        if not service_type:
            errors.append('Tipo de serviço é obrigatório')
        if not description:
            errors.append('Descrição é obrigatória')
        if len(description) < 20:
            errors.append('Descrição deve ter pelo menos 20 caracteres')
        
        if errors:
            if request.is_json:
                return jsonify({'success': False, 'errors': errors}), 400
            for error in errors:
                flash(error, 'error')
            return render_template('user/request_quote.html', services=services, data=data)
        
        try:
            quote = Quote(
                client_name=current_user.full_name or current_user.username,
                email=current_user.email,
                phone=getattr(current_user, 'phone', '') or data.get('phone', ''),
                service_type=service_type,
                project_type=project_type,
                description=description,
                budget_range=budget_range,
                location=location,
                preferred_date=datetime.strptime(preferred_date, '%Y-%m-%d') if preferred_date else None,
                status='pending'
            )
            
            db.session.add(quote)
            db.session.commit()
            
            print(f"✅ ORÇAMENTO SOLICITADO: {current_user.email} - {service_type}")
            
            if request.is_json:
                return jsonify({
                    'success': True,
                    'message': 'Orçamento solicitado com sucesso! Entraremos em contacto brevemente.',
                    'quote': quote.to_dict()
                }), 201
            
            flash('Orçamento solicitado com sucesso! Entraremos em contacto brevemente.', 'success')
            return redirect(url_for('user.my_quotes'))
            
        except Exception as e:
            db.session.rollback()
            if request.is_json:
                return jsonify({'success': False, 'error': str(e)}), 500
            flash('Erro ao submeter orçamento', 'error')
    
    return render_template('user/request_quote.html', services=services)


# ============================================================
# ════════════════════════════════════════════════════════════
# 👤 O MEU PERFIL
# ════════════════════════════════════════════════════════════

@user_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def my_profile():
    """Perfil do utilizador"""
    from models import Client
    
    client = getattr(current_user, 'client', None)
    
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form.to_dict()
        
        # Atualizar dados do utilizador
        if 'full_name' in data:
            current_user.full_name = data['full_name']
        if 'phone' in data:
            current_user.phone = data['phone']
        
        # Atualizar dados do cliente
        if client:
            if 'company_name' in data:
                client.company_name = data['company_name']
            if 'nif' in data:
                client.nif = data['nif']
            if 'address' in data:
                client.address = data['address']
            if 'city' in data:
                client.city = data['city']
        
        # Alterar password
        if data.get('new_password'):
            if not current_user.check_password(data.get('current_password', '')):
                if request.is_json:
                    return jsonify({'success': False, 'error': 'Palavra-passe atual incorreta'}), 400
                flash('Palavra-passe atual incorreta', 'error')
                return render_template('user/profile.html', client=client)
            
            if len(data['new_password']) < 8:
                if request.is_json:
                    return jsonify({'success': False, 'error': 'Nova password deve ter pelo menos 8 caracteres'}), 400
                flash('Nova password deve ter pelo menos 8 caracteres', 'error')
                return render_template('user/profile.html', client=client)
            
            current_user.set_password(data['new_password'])
            print(f"🔑 PASSWORD ALTERADA: {current_user.email}")
        
        try:
            db.session.commit()
            
            if request.is_json:
                return jsonify({
                    'success': True,
                    'message': 'Perfil atualizado',
                    'user': current_user.to_dict()
                })
            
            flash('Perfil atualizado com sucesso', 'success')
            return redirect(url_for('user.my_profile'))
            
        except Exception as e:
            db.session.rollback()
            if request.is_json:
                return jsonify({'success': False, 'error': str(e)}), 500
            flash('Erro ao atualizar perfil', 'error')
    
    if request.is_json:
        return jsonify({
            'success': True,
            'user': current_user.to_dict(),
            'client': client.to_dict() if client else None
        })
    
    return render_template('user/profile.html', client=client)


# ============================================================
# ════════════════════════════════════════════════════════════
# 💬 MENSAGENS / SUPORTE
# ════════════════════════════════════════════════════════════

@user_bp.route('/messages', methods=['GET'])
@login_required
def my_messages():
    """Mensagens do utilizador"""
    from models import Message
    
    messages = Message.query.filter_by(email=current_user.email).order_by(Message.created_at.desc()).all()
    
    if request.is_json:
        return jsonify({
            'success': True,
            'messages': [m.to_dict() for m in messages]
        })
    
    return render_template('user/messages.html', messages=messages)


@user_bp.route('/messages/new', methods=['GET', 'POST'])
@login_required
def new_message():
    """Enviar nova mensagem/suporte"""
    from models import Message
    
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form.to_dict()
        
        subject = data.get('subject', '').strip()
        content = data.get('content', '').strip()
        
        errors = []
        if not subject:
            errors.append('Assunto é obrigatório')
        if not content:
            errors.append('Mensagem é obrigatória')
        
        if errors:
            if request.is_json:
                return jsonify({'success': False, 'errors': errors}), 400
            for error in errors:
                flash(error, 'error')
            return render_template('user/new_message.html')
        
        try:
            message = Message(
                name=current_user.full_name or current_user.username,
                email=current_user.email,
                subject=subject,
                content=content,
                is_read=False
            )
            
            db.session.add(message)
            db.session.commit()
            
            print(f"💬 MENSAGEM ENVIADA: {current_user.email} - {subject}")
            
            if request.is_json:
                return jsonify({
                    'success': True,
                    'message': 'Mensagem enviada com sucesso'
                }), 201
            
            flash('Mensagem enviada com sucesso', 'success')
            return redirect(url_for('user.my_messages'))
            
        except Exception as e:
            db.session.rollback()
            if request.is_json:
                return jsonify({'success': False, 'error': str(e)}), 500
            flash('Erro ao enviar mensagem', 'error')
    
    return render_template('user/new_message.html')


# ============================================================
# ════════════════════════════════════════════════════════════
# 📄 TERMOS E CONDIÇÕES
# ════════════════════════════════════════════════════════════

@user_bp.route('/terms')
def terms():
    """Termos e condições"""
    return render_template('user/terms.html')


@user_bp.route('/privacy')
def privacy():
    """Política de privacidade"""
    return render_template('user/privacy.html')
