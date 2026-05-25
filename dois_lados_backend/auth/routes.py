# ============================================================
# DOIS LADOS - ROTAS DE AUTENTICAÇÃO (AUTH BLUEPRINT)
# ============================================================
# Este módulo contém todas as rotas de autenticação:
# - Login (Admin e Utilizador)
# - Logout
# - Registo público (apenas utilizadores normais)
# - Registo de admins (apenas admins)
# ============================================================

from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash, session
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from app import db

# ============================================================
# INSTÂNCIA DO BLUEPRINT
# ============================================================
auth_bp = Blueprint('auth', __name__, 
                    url_prefix='/auth',
                    template_folder='../templates/auth')

# ============================================================
# DECORADORES PERSONALIZADOS
# ============================================================

def admin_required(f):
    """Decorator que verifica se o utilizador atual é admin"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return redirect(url_for('auth.login', next=request.url))
        if not current_user.is_admin:
            return jsonify({'error': 'Acesso restrito a administradores'}), 403
        return f(*args, **kwargs)
    return decorated_function


def user_required(f):
    """Decorator que verifica se o utilizador está autenticado"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return redirect(url_for('auth.login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function


def public_only(f):
    """Decorator que impede acessos autenticados (ex: login/register)"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if current_user.is_authenticated:
            if current_user.is_admin:
                return redirect(url_for('admin.dashboard'))
            return redirect(url_for('user.dashboard'))
        return f(*args, **kwargs)
    return decorated_function

# ============================================================
# TRATAMENTO DE ERROS
# ============================================================

@auth_bp.errorhandler(400)
def bad_request(e):
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Pedido inválido'}), 400
    return render_template('errors/400.html', error=e), 400


@auth_bp.errorhandler(401)
def unauthorized(e):
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Não autenticado'}), 401
    return render_template('errors/401.html', error=e), 401


@auth_bp.errorhandler(403)
def forbidden(e):
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Acesso negado'}), 403
    return render_template('errors/403.html', error=e), 401


# ============================================================
# 📂 IMPORTAÇÃO DINÂMICA (evita importações circulares)
# ============================================================

def get_models():
    """Obtém os modelos para evitar importações circulares"""
    from models import User, Client
    return User, Client

# ============================================================
# ════════════════════════════════════════════════════════════
# 🔐 ROTAS DE LOGIN
# ════════════════════════════════════════════════════════════
# ════════════════════════════════════════════════════════════

# ---------- LOGIN (PÁGINA WEB) ----------

@auth_bp.route('/login', methods=['GET', 'POST'])
@public_only
def login():
    """
    GET: Renderiza a página de login
    POST: Processa o formulário de login
    
    Tipos de login:
    - Admin: Redireciona para /admin/dashboard
    - Utilizador: Redireciona para /user/dashboard
    """
    from models import User
    
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form.to_dict()
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        remember = data.get('remember', False)
        
        # Validação básica
        if not email or not password:
            if request.is_json:
                return jsonify({'success': False, 'error': 'Email e palavra-passe são obrigatórios'}), 400
            flash('Email e palavra-passe são obrigatórios', 'error')
            return render_template('auth/login.html')
        
        # Verificar se é email ou username
        user = User.query.filter(
            (User.email == email) | (User.username == email)
        ).first()
        
        # Verificar credenciais
        if user and user.check_password(password):
            if not user.is_active:
                if request.is_json:
                    return jsonify({'success': False, 'error': 'Conta desativada. Contacte o administrador'}), 403
                flash('Conta desativada. Contacte o administrador', 'warning')
                return render_template('auth/login.html')
            
            # Login bem sucedido
            login_user(user, remember=remember)
            
            # Atualizar último login
            from datetime import datetime
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            # Log de acesso
            print(f"✅ LOGIN: {user.email} ({'Admin' if user.is_admin else 'User'})")
            
            if request.is_json:
                return jsonify({
                    'success': True,
                    'message': 'Login efetuado com sucesso',
                    'redirect': url_for('admin.dashboard') if user.is_admin else url_for('user.dashboard'),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'is_admin': user.is_admin
                    }
                })
            
            # Redirecionar para onde queria ou para área correspondente
            next_page = request.args.get('next')
            if next_page:
                return redirect(next_page)
            return redirect(url_for('admin.dashboard') if user.is_admin else url_for('user.dashboard'))
        
        # Credenciais inválidas
        print(f"❌ FALHA LOGIN: {email}")
        if request.is_json:
            return jsonify({'success': False, 'error': 'Credenciais inválidas'}), 401
        flash('Email ou palavra-passe incorretos', 'error')
    
    return render_template('auth/login.html')


# ---------- LOGIN (API) ----------

@auth_bp.route('/api/login', methods=['POST'])
def api_login():
    """
    API: Login para integração com frontend React
    
    POST /api/auth/login
    Body: { email, password, remember }
    """
    from models import User
    
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'error': 'Dados não fornecidos'}), 400
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    remember = data.get('remember', False)
    
    if not email or not password:
        return jsonify({'success': False, 'error': 'Email e palavra-passe são obrigatórios'}), 400
    
    user = User.query.filter(
        (User.email == email) | (User.username == email)
    ).first()
    
    if user and user.check_password(password):
        if not user.is_active:
            return jsonify({'success': False, 'error': 'Conta desativada'}), 403
        
        login_user(user, remember=remember)
        
        # Incluir cliente associado se existir
        client_data = None
        if user.client:
            client_data = {
                'id': user.client.id,
                'name': user.client.name,
                'phone': user.client.phone
            }
        
        return jsonify({
            'success': True,
            'message': 'Login efetuado com sucesso',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': user.is_admin,
                'is_active': user.is_active,
                'client': client_data
            },
            'redirect': '/admin/dashboard' if user.is_admin else '/user/dashboard'
        })
    
    return jsonify({'success': False, 'error': 'Credenciais inválidas'}), 401


# ============================================================
# ════════════════════════════════════════════════════════════
# 🚪 LOGOUT
# ════════════════════════════════════════════════════════════

@auth_bp.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    """Termina a sessão do utilizador atual"""
    user_email = current_user.email
    logout_user()
    print(f"🚪 LOGOUT: {user_email}")
    
    if request.is_json:
        return jsonify({'success': True, 'message': 'Sessão terminada'})
    
    flash('Sessão terminada com sucesso', 'info')
    return redirect(url_for('auth.login'))


@auth_bp.route('/api/logout', methods=['POST'])
@login_required
def api_logout():
    """API: Termina a sessão do utilizador"""
    logout_user()
    return jsonify({'success': True, 'message': 'Sessão terminada'})


# ============================================================
# ════════════════════════════════════════════════════════════
# 📝 REGISTO PÚBLICO (UTILIZADORES NORMAIS)
# ════════════════════════════════════════════════════════════

@auth_bp.route('/register', methods=['GET', 'POST'])
@public_only
def register():
    """
    GET: Renderiza a página de registo
    POST: Cria um novo utilizador (não-admin)
    
    Validações:
    - Username único (3-30 caracteres, alfanumérico)
    - Email único e válido
    - Password com requisitos mínimos (8+ chars, 1 maiúscula, 1 número)
    """
    from models import User
    
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form.to_dict()
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        confirm_password = data.get('confirm_password', '')
        phone = data.get('phone', '').strip()
        accept_terms = data.get('accept_terms', False)
        
        # Validações
        errors = []
        
        if not username or len(username) < 3:
            errors.append('Username deve ter pelo menos 3 caracteres')
        if len(username) > 30:
            errors.append('Username não pode exceder 30 caracteres')
        if not username.isalnum():
            errors.append('Username deve conter apenas letras e números')
        
        if not email or '@' not in email:
            errors.append('Email inválido')
        
        if not password or len(password) < 8:
            errors.append('Palavra-passe deve ter pelo menos 8 caracteres')
        if password != confirm_password:
            errors.append('Palavra-passe e confirmação não coincidem')
        
        if not accept_terms:
            errors.append('Deve aceitar os termos e condições')
        
        # Verificar se username já existe
        if User.query.filter_by(username=username).first():
            errors.append('Este username já está em uso')
        
        # Verificar se email já existe
        if User.query.filter_by(email=email).first():
            errors.append('Este email já está registado')
        
        if errors:
            if request.is_json:
                return jsonify({'success': False, 'errors': errors}), 400
            for error in errors:
                flash(error, 'error')
            return render_template('auth/register.html', data=data)
        
        try:
            # Criar novo utilizador (não-admin por padrão)
            new_user = User(
                username=username,
                email=email,
                is_admin=False,  # ❌ Utilizadores normais não são admins
                is_active=True,
                phone=phone
            )
            new_user.set_password(password)
            
            db.session.add(new_user)
            db.session.flush()  # Obter ID antes de criar cliente
            
            # Criar registo de cliente associado (opcional)
            if phone:
                from models import Client
                client = Client(
                    user_id=new_user.id,
                    name=username,
                    email=email,
                    phone=phone
                )
                db.session.add(client)
            
            db.session.commit()
            
            print(f"✅ NOVO UTILIZADOR REGISTADO: {email}")
            
            if request.is_json:
                return jsonify({
                    'success': True,
                    'message': 'Conta criada com sucesso! Agora pode fazer login.',
                    'redirect': url_for('auth.login')
                }), 201
            
            flash('Conta criada com sucesso! Faça login para continuar.', 'success')
            return redirect(url_for('auth.login'))
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ ERRO AO REGISTAR: {str(e)}")
            
            if request.is_json:
                return jsonify({'success': False, 'error': 'Erro ao criar conta. Tente novamente.'}), 500
            flash('Erro ao criar conta. Tente novamente.', 'error')
    
    return render_template('auth/register.html')


@auth_bp.route('/api/register', methods=['POST'])
def api_register():
    """API: Registo público de novos utilizadores"""
    return register()


# ============================================================
# ════════════════════════════════════════════════════════════
# 👑 REGISTO DE ADMINISTRADORES (SÓ PARA ADIMS)
# ════════════════════════════════════════════════════════════

@auth_bp.route('/admin/users/new', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_create_user():
    """
    GET: Renderiza formulário de criação de admin/user
    POST: Cria novo utilizador ou admin
    
    ⚠️ NOTA: Apenas admins podem criar outros admins!
    """
    from models import User
    
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form.to_dict()
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        confirm_password = data.get('confirm_password', '')
        is_admin = data.get('is_admin', False)
        is_active = data.get('is_active', True)
        full_name = data.get('full_name', '').strip()
        phone = data.get('phone', '').strip()
        
        # Validações
        errors = []
        
        if not username or len(username) < 3:
            errors.append('Username deve ter pelo menos 3 caracteres')
        if not username.isalnum():
            errors.append('Username deve conter apenas letras e números')
        
        if not email or '@' not in email:
            errors.append('Email inválido')
        
        if not password or len(password) < 8:
            errors.append('Palavra-passe deve ter pelo menos 8 caracteres')
        if password != confirm_password:
            errors.append('Palavra-passe e confirmação não coincidem')
        
        # Só admin pode criar admins
        if is_admin and not current_user.is_admin:
            if request.is_json:
                return jsonify({'success': False, 'error': 'Sem permissão para criar admins'}), 403
            flash('Sem permissão para criar administradores', 'error')
            return redirect(url_for('admin.dashboard'))
        
        # Verificar duplicados
        if User.query.filter_by(username=username).first():
            errors.append('Este username já existe')
        if User.query.filter_by(email=email).first():
            errors.append('Este email já existe')
        
        if errors:
            if request.is_json:
                return jsonify({'success': False, 'errors': errors}), 400
            for error in errors:
                flash(error, 'error')
            return render_template('auth/admin_create_user.html', data=data)
        
        try:
            # Criar utilizador com papel definido
            new_user = User(
                username=username,
                email=email,
                full_name=full_name if full_name else username,
                is_admin=is_admin,
                is_active=is_active,
                phone=phone,
                created_by=current_user.id  # Registo de quem criou
            )
            new_user.set_password(password)
            
            db.session.add(new_user)
            db.session.commit()
            
            # Log da ação
            print(f"✅ {'ADMIN' if is_admin else 'USER'} CRIADO POR {current_user.username}: {email}")
            
            if request.is_json:
                return jsonify({
                    'success': True,
                    'message': f"{'Administrador' if is_admin else 'Utilizador'} criado com sucesso",
                    'user': {
                        'id': new_user.id,
                        'username': new_user.username,
                        'email': new_user.email,
                        'is_admin': new_user.is_admin
                    }
                }), 201
            
            flash(f"{'Administrador' if is_admin else 'Utilizador'} criado com sucesso", 'success')
            return redirect(url_for('admin.list_users'))
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ ERRO AO CRIAR UTILIZADOR: {str(e)}")
            
            if request.is_json:
                return jsonify({'success': False, 'error': str(e)}), 500
            flash('Erro ao criar utilizador', 'error')
    
    return render_template('auth/admin_create_user.html')


@auth_bp.route('/api/admin/users', methods=['POST'])
@login_required
@admin_required
def api_admin_create_user():
    """API: Criar novo utilizador (admin ou normal)"""
    return admin_create_user()


# ============================================================
# ════════════════════════════════════════════════════════════
# 👥 LISTAR UTILIZADORES (ADMIN)
# ════════════════════════════════════════════════════════════

@auth_bp.route('/admin/users', methods=['GET'])
@login_required
@admin_required
def list_users():
    """Lista todos os utilizadores do sistema"""
    from models import User
    
    # Filtros
    user_type = request.args.get('type', 'all')  # all, admin, user
    status = request.args.get('status', 'all')   # all, active, inactive
    search = request.args.get('search', '')
    
    query = User.query
    
    if user_type == 'admin':
        query = query.filter_by(is_admin=True)
    elif user_type == 'user':
        query = query.filter_by(is_admin=False)
    
    if status == 'active':
        query = query.filter_by(is_active=True)
    elif status == 'inactive':
        query = query.filter_by(is_active=False)
    
    if search:
        query = query.filter(
            (User.username.ilike(f'%{search}%')) |
            (User.email.ilike(f'%{search}%'))
        )
    
    users = query.order_by(User.created_at.desc()).all()
    
    if request.is_json:
        return jsonify({
            'success': True,
            'users': [u.to_dict() for u in users],
            'total': len(users)
        })
    
    return render_template('auth/list_users.html', users=users, 
                           filters={'type': user_type, 'status': status, 'search': search})


@auth_bp.route('/api/admin/users', methods=['GET'])
@login_required
@admin_required
def api_list_users():
    """API: Listar utilizadores"""
    return list_users()


# ============================================================
# ════════════════════════════════════════════════════════════
# ✏️ EDITAR UTILIZADOR
# ════════════════════════════════════════════════════════════

@auth_bp.route('/admin/users/<int:user_id>/edit', methods=['GET', 'POST', 'PUT'])
@login_required
@admin_required
def edit_user(user_id):
    """Edita um utilizador existente"""
    from models import User
    
    user = User.query.get_or_404(user_id)
    
    if request.method == 'POST' or request.method == 'PUT':
        data = request.get_json() if request.is_json else request.form.to_dict()
        
        # Atualizar campos permitidos
        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'email' in data:
            new_email = data['email'].strip().lower()
            # Verificar se email já existe (exceto este user)
            if new_email != user.email and User.query.filter_by(email=new_email).first():
                if request.is_json:
                    return jsonify({'success': False, 'error': 'Email já em uso'}), 400
                flash('Email já está em uso', 'error')
                return render_template('auth/edit_user.html', user=user)
            user.email = new_email
        
        if 'phone' in data:
            user.phone = data['phone']
        
        # Só admins podem alterar estes campos
        if current_user.is_admin:
            if 'is_admin' in data:
                # Prevenir auto-remoção de admin
                if user.id != current_user.id or data['is_admin'] == 'true':
                    user.is_admin = data['is_admin'] in [True, 'true', '1']
            
            if 'is_active' in data:
                user.is_active = data['is_active'] in [True, 'true', '1']
        
        # Alterar password (opcional)
        if data.get('password'):
            if len(data['password']) < 8:
                if request.is_json:
                    return jsonify({'success': False, 'error': 'Password deve ter pelo menos 8 caracteres'}), 400
                flash('Password deve ter pelo menos 8 caracteres', 'error')
                return render_template('auth/edit_user.html', user=user)
            
            user.set_password(data['password'])
            print(f"🔑 PASSWORD ALTERADA: {user.email} por {current_user.username}")
        
        try:
            db.session.commit()
            print(f"✏️ UTILIZADOR ATUALIZADO: {user.email}")
            
            if request.is_json:
                return jsonify({
                    'success': True,
                    'message': 'Utilizador atualizado',
                    'user': user.to_dict()
                })
            
            flash('Utilizador atualizado com sucesso', 'success')
            return redirect(url_for('auth.list_users'))
            
        except Exception as e:
            db.session.rollback()
            if request.is_json:
                return jsonify({'success': False, 'error': str(e)}), 500
            flash('Erro ao atualizar utilizador', 'error')
    
    if request.is_json:
        return jsonify({'success': True, 'user': user.to_dict()})
    
    return render_template('auth/edit_user.html', user=user)


@auth_bp.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@login_required
@admin_required
def api_update_user(user_id):
    """API: Atualizar utilizador"""
    return edit_user(user_id)


# ============================================================
# ════════════════════════════════════════════════════════════
# 🗑️ ELIMINAR UTILIZADOR
# ════════════════════════════════════════════════════════════

@auth_bp.route('/admin/users/<int:user_id>/delete', methods=['POST', 'DELETE'])
@login_required
@admin_required
def delete_user(user_id):
    """Elimina um utilizador (soft delete - desativa)"""
    from models import User
    
    user = User.query.get_or_404(user_id)
    
    # Prevenir auto-eliminação
    if user.id == current_user.id:
        if request.is_json:
            return jsonify({'success': False, 'error': 'Não pode eliminar a sua própria conta'}), 400
        flash('Não pode eliminar a sua própria conta', 'error')
        return redirect(url_for('auth.list_users'))
    
    # Soft delete - apenas desativa
    user.is_active = False
    user.deleted_at = db.func.now()
    
    try:
        db.session.commit()
        print(f"🗑️ UTILIZADOR DESATIVADO: {user.email} por {current_user.username}")
        
        if request.is_json:
            return jsonify({'success': True, 'message': 'Utilizador desativado'})
        
        flash('Utilizador desativado com sucesso', 'success')
        return redirect(url_for('auth.list_users'))
        
    except Exception as e:
        db.session.rollback()
        if request.is_json:
            return jsonify({'success': False, 'error': str(e)}), 500
        flash('Erro ao eliminar utilizador', 'error')
        return redirect(url_for('auth.list_users'))


@auth_bp.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@login_required
@admin_required
def api_delete_user(user_id):
    """API: Eliminar utilizador"""
    return delete_user(user_id)


# ============================================================
# ════════════════════════════════════════════════════════════
# 👤 PERFIL DO UTILIZADOR
# ════════════════════════════════════════════════════════════

@auth_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    """Perfil do utilizador atual"""
    from models import User
    
    user = current_user
    
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form.to_dict()
        
        # Atualizar perfil
        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'bio' in data:
            user.bio = data['bio']
        
        # Atualizar email
        if 'email' in data:
            new_email = data['email'].strip().lower()
            if new_email != user.email:
                if User.query.filter_by(email=new_email).first():
                    if request.is_json:
                        return jsonify({'success': False, 'error': 'Email já em uso'}), 400
                    flash('Email já está em uso', 'error')
                    return render_template('auth/profile.html', user=user)
                user.email = new_email
        
        # Alterar password
        if data.get('new_password'):
            if not user.check_password(data.get('current_password', '')):
                if request.is_json:
                    return jsonify({'success': False, 'error': 'Palavra-passe atual incorreta'}), 400
                flash('Palavra-passe atual incorreta', 'error')
                return render_template('auth/profile.html', user=user)
            
            if len(data['new_password']) < 8:
                if request.is_json:
                    return jsonify({'success': False, 'error': 'Nova password deve ter pelo menos 8 caracteres'}), 400
                flash('Nova password deve ter pelo menos 8 caracteres', 'error')
                return render_template('auth/profile.html', user=user)
            
            user.set_password(data['new_password'])
            print(f"🔑 PASSWORD ALTERADA: {user.email}")
        
        try:
            db.session.commit()
            
            if request.is_json:
                return jsonify({'success': True, 'message': 'Perfil atualizado', 'user': user.to_dict()})
            
            flash('Perfil atualizado com sucesso', 'success')
            return redirect(url_for('auth.profile'))
            
        except Exception as e:
            db.session.rollback()
            if request.is_json:
                return jsonify({'success': False, 'error': str(e)}), 500
            flash('Erro ao atualizar perfil', 'error')
    
    if request.is_json:
        return jsonify({'success': True, 'user': user.to_dict()})
    
    return render_template('auth/profile.html', user=user)


# ============================================================
# ════════════════════════════════════════════════════════════
# 🔄 RECUPERAR PASSWORD
# ════════════════════════════════════════════════════════════

@auth_bp.route('/forgot-password', methods=['GET', 'POST'])
@public_only
def forgot_password():
    """Envia email de recuperação de password"""
    from models import User
    from itsdangerous import URLSafeTimedSerializer
    from flask import current_app
    
    if request.method == 'POST':
        email = request.get_json()['email'] if request.is_json else request.form.get('email', '').strip().lower()
        
        user = User.query.filter_by(email=email).first()
        
        if user:
            # Gerar token
            serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
            token = serializer.dumps(email, salt='password-reset-salt')
            
            # Aqui integrar com Flask-Mail para enviar email
            reset_url = url_for('auth.reset_password', token=token, _external=True)
            print(f"📧 LINK RECUPERAÇÃO: {reset_url}")
            
            # TODO: Enviar email real
            # send_email(user.email, 'Recuperação de Password', f'Clique aqui: {reset_url}')
        
        # Sempre retornar sucesso (segurança)
        if request.is_json:
            return jsonify({
                'success': True,
                'message': 'Se o email existir, receberá instruções para recuperar a password'
            })
        
        flash('Se o email existir, receberá instruções para recuperar a password', 'info')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/forgot_password.html')


@auth_bp.route('/reset-password/<token>', methods=['GET', 'POST'])
@public_only
def reset_password(token):
    """Redefine password com token válido"""
    from models import User
    from itsdangerous import URLSafeTimedSerializer
    from flask import current_app
    
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    
    try:
        email = serializer.loads(token, salt='password-reset-salt', max_age=3600)  # 1 hora
    except:
        if request.is_json:
            return jsonify({'success': False, 'error': 'Token inválido ou expirado'}), 400
        flash('Link de recuperação inválido ou expirado', 'error')
        return redirect(url_for('auth.forgot_password'))
    
    user = User.query.filter_by(email=email).first()
    if not user:
        if request.is_json:
            return jsonify({'success': False, 'error': 'Utilizador não encontrado'}), 404
        return redirect(url_for('auth.forgot_password'))
    
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form.to_dict()
        password = data.get('password', '')
        confirm = data.get('confirm_password', '')
        
        if not password or len(password) < 8:
            if request.is_json:
                return jsonify({'success': False, 'error': 'Password deve ter pelo menos 8 caracteres'}), 400
            flash('Password deve ter pelo menos 8 caracteres', 'error')
            return render_template('auth/reset_password.html', token=token)
        
        if password != confirm:
            if request.is_json:
                return jsonify({'success': False, 'error': 'Passwords não coincidem'}), 400
            flash('Passwords não coincidem', 'error')
            return render_template('auth/reset_password.html', token=token)
        
        user.set_password(password)
        db.session.commit()
        
        print(f"🔑 PASSWORD RECUPERADA: {user.email}")
        
        if request.is_json:
            return jsonify({'success': True, 'message': 'Password alterada com sucesso'})
        
        flash('Password alterada com sucesso! Faça login.', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('auth/reset_password.html', token=token)
