# ============================================================
# DOIS LADOS - MODELOS SQLALCHEMY
# ============================================================
# Base de dados completa para sistema de arquitetura
# ============================================================

from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from sqlalchemy.orm import relationship

# ============================================================
# INSTÂNCIA SQLALCHEMY
# ============================================================
db = SQLAlchemy()

# ============================================================
# ════════════════════════════════════════════════════════════
# 👤 MODELO: USER (UTILIZADOR)
# ════════════════════════════════════════════════════════════

class User(db.Model, UserMixin):
    """
    Modelo de utilizador para autenticação
    
    Campos:
    - id: ID único
    - username: Nome de utilizador (único)
    - email: Email (único)
    - full_name: Nome completo
    - password_hash: Password encriptada
    - phone: Telefone
    - is_admin: True = admin, False = utilizador normal
    - is_active: Estado da conta
    - last_login: Último login
    - created_at: Data de criação
    - created_by: ID do utilizador que criou (para admins)
    """
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    full_name = db.Column(db.String(100))
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    bio = db.Column(db.Text)
    
    # Permissões
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    deleted_at = db.Column(db.DateTime)
    
    # Relações (para admins que criam outros users)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Relacionar com cliente (1:1)
    client = relationship('Client', backref='user', uselist=False, lazy=True)
    
    def __repr__(self):
        return f'<User {self.username} ({"Admin" if self.is_admin else "User"})>'
    
    def set_password(self, password):
        """Encripta e define a password"""
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')
    
    def check_password(self, password):
        """Verifica se a password está correta"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Converte para dicionário (serialização)"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'phone': self.phone,
            'is_admin': self.is_admin,
            'is_active': self.is_active,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# ============================================================
# ════════════════════════════════════════════════════════════
# 🏢 MODELO: CLIENT (CLIENTE)
# ════════════════════════════════════════════════════════════

class Client(db.Model):
    """
    Modelo de cliente (dados fiscais e contacto)
    
    Campos:
    - id: ID único
    - user_id: ID do utilizador associado (1:1)
    - name: Nome/Razão social
    - email: Email
    - phone: Telefone
    - company_name: Nome da empresa (opcional)
    - nif: Número de identificação fiscal
    - address: Morada
    - city: Cidade
    - province: Província
    - country: País
    """
    __tablename__ = 'clients'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=True)
    
    # Dados pessoais/empresa
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    company_name = db.Column(db.String(100))
    nif = db.Column(db.String(20))
    
    # Morada
    address = db.Column(db.String(200))
    city = db.Column(db.String(50), default='Luanda')
    province = db.Column(db.String(50), default='Luanda')
    country = db.Column(db.String(50), default='Angola')
    
    # Metadados
    is_active = db.Column(db.Boolean, default=True)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionar com projetos (1:N)
    projects = relationship('Project', backref='client', lazy=True)
    
    def __repr__(self):
        return f'<Client {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'company_name': self.company_name,
            'nif': self.nif,
            'address': self.address,
            'city': self.city,
            'province': self.province,
            'country': self.country,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# ============================================================
# ════════════════════════════════════════════════════════════
# 📁 MODELO: PROJECT (PROJETO)
# ════════════════════════════════════════════════════════════

class Project(db.Model):
    """
    Modelo de projeto/obra
    
    Campos:
    - id: ID único
    - title: Título do projeto
    - description: Descrição detalhada
    - category: Categoria (residential, commercial, urbanism, interior)
    - status: Estado (planning, in_progress, on_hold, completed, cancelled)
    - budget: Orçamento estimado
    - location: Localização
    - client_id: ID do cliente associado
    - created_by: ID do admin que criou
    """
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text)
    
    # Categoria e tipo
    category = db.Column(db.String(50), default='residential')  # residential, commercial, urbanism, interior
    project_type = db.Column(db.String(50))  # T3, T4, T5, Moradia, Prédio, etc.
    
    # Estado
    status = db.Column(db.String(20), default='planning', index=True)  # planning, in_progress, on_hold, completed, cancelled
    
    # Orçamento e prazos
    budget = db.Column(db.Float, default=0)
    currency = db.Column(db.String(3), default='USD')
    
    # Datas
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    delivery_date = db.Column(db.Date)
    
    # Localização
    location = db.Column(db.String(200))
    municipality = db.Column(db.String(100))  # Cacuaco, Talatona, etc.
    
    # Relações
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), index=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Imagem do projeto
    image_url = db.Column(db.String(500))
    
    # Metadados
    area = db.Column(db.Float)  # Área em m²
    is_featured = db.Column(db.Boolean, default=False)
    is_public = db.Column(db.Boolean, default=True)  # Mostrar no portfólio
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionar com fases (1:N)
    phases = relationship('ProjectPhase', backref='project', lazy=True, order_by='ProjectPhase.order_index')
    
    def __repr__(self):
        return f'<Project {self.title} ({self.status})>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'project_type': self.project_type,
            'status': self.status,
            'budget': self.budget,
            'currency': self.currency,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'delivery_date': self.delivery_date.isoformat() if self.delivery_date else None,
            'location': self.location,
            'municipality': self.municipality,
            'client_id': self.client_id,
            'client_name': self.client.name if self.client else None,
            'image_url': self.image_url,
            'area': self.area,
            'is_featured': self.is_featured,
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


# ============================================================
# ════════════════════════════════════════════════════════════
# 📅 MODELO: PROJECT PHASE (FASE DO PROJETO)
# ════════════════════════════════════════════════════════════

class ProjectPhase(db.Model):
    """
    Modelo de fase do projeto (cronograma)
    
    Exemplo de fases:
    - 1. Planeamento
    - 2. Estudo Prévio
    - 3. Projeto Base
    - 4. Projeto de Execução
    - 5. Licenciamento
    - 6. Execução da Obra
    - 7. Fiscalização
    - 8. Entrega Final
    """
    __tablename__ = 'project_phases'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False, index=True)
    
    phase_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    order_index = db.Column(db.Integer, default=0)  # Ordem da fase
    
    # Estado
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed
    
    # Datas
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    completed_at = db.Column(db.DateTime)
    
    # Percentagem concluída
    progress = db.Column(db.Integer, default=0)  # 0-100%
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Phase {self.order_index}. {self.phase_name} ({self.status})>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'phase_name': self.phase_name,
            'description': self.description,
            'order_index': self.order_index,
            'status': self.status,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'progress': self.progress,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# ============================================================
# ════════════════════════════════════════════════════════════
# 💰 MODELO: QUOTE (ORÇAMENTO)
# ════════════════════════════════════════════════════════════

class Quote(db.Model):
    """
    Modelo de orçamento/pedido de orçamento
    
    Campos:
    - id: ID único
    - client_name: Nome do cliente
    - email: Email
    - phone: Telefone
    - service_type: Tipo de serviço pretendido
    - description: Descrição do projeto
    - status: Estado (pending, approved, rejected, expired)
    """
    __tablename__ = 'quotes'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Dados do cliente
    client_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False, index=True)
    phone = db.Column(db.String(20))
    
    # Dados do orçamento
    service_type = db.Column(db.String(50), nullable=False, index=True)  # architectural, construction, interior, consultancy
    project_type = db.Column(db.String(50))  # T3, Moradia, etc.
    description = db.Column(db.Text, nullable=False)
    
    # Orçamento
    budget_range = db.Column(db.String(50))  # < 50K, 50K-100K, 100K-500K, > 500K
    estimated_budget = db.Column(db.Float)  # Orçamento estimado pelo admin
    
    # Localização
    location = db.Column(db.String(200))
    
    # Preferências
    preferred_date = db.Column(db.Date)  # Data preferida para início
    
    # Estado e acompanhamento
    status = db.Column(db.String(20), default='pending', index=True)  # pending, in_review, approved, rejected, expired
    admin_notes = db.Column(db.Text)  # Notas do admin
    processed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    processed_at = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = db.Column(db.DateTime)  # Data de expiração do orçamento
    
    # Relacionar com quem processou
    processed_by_user = relationship('User', foreign_keys=[processed_by])
    
    def __repr__(self):
        return f'<Quote {self.id} - {self.client_name} ({self.status})>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'client_name': self.client_name,
            'email': self.email,
            'phone': self.phone,
            'service_type': self.service_type,
            'project_type': self.project_type,
            'description': self.description,
            'budget_range': self.budget_range,
            'estimated_budget': self.estimated_budget,
            'location': self.location,
            'preferred_date': self.preferred_date.isoformat() if self.preferred_date else None,
            'status': self.status,
            'admin_notes': self.admin_notes,
            'processed_by': self.processed_by,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }


# ============================================================
# ════════════════════════════════════════════════════════════
# 💬 MODELO: MESSAGE (MENSAGEM)
# ════════════════════════════════════════════════════════════

class Message(db.Model):
    """
    Modelo de mensagem do formulário de contactos
    
    Campos:
    - id: ID único
    - name: Nome do remetente
    - email: Email
    - phone: Telefone
    - subject: Assunto
    - content: Conteúdo
    - is_read: Se foi lida
    - is_replied: Se foi respondida
    """
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Remetente
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    
    # Conteúdo
    subject = db.Column(db.String(200))
    content = db.Column(db.Text, nullable=False)
    
    # Acompanhamento
    is_read = db.Column(db.Boolean, default=False, index=True)
    read_at = db.Column(db.DateTime)
    read_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    is_replied = db.Column(db.Boolean, default=False)
    replied_at = db.Column(db.DateTime)
    replied_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    reply_content = db.Column(db.Text)
    
    # Metadados
    ip_address = db.Column(db.String(45))  # IPv6
    user_agent = db.Column(db.String(500))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self):
        return f'<Message {self.id} - {self.name} ({self.subject})>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'subject': self.subject,
            'content': self.content,
            'is_read': self.is_read,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'is_replied': self.is_replied,
            'replied_at': self.replied_at.isoformat() if self.replied_at else None,
            'reply_content': self.reply_content,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# ============================================================
# ════════════════════════════════════════════════════════════
# 🖼️ MODELO: PORTFOLIO ITEM (ITEM DO PORTFÓLIO)
# ════════════════════════════════════════════════════════════

class PortfolioItem(db.Model):
    """
    Modelo de item do portfólio (galeria de projetos)
    
    Campos:
    - id: ID único
    - title: Título
    - description: Descrição
    - category: Categoria
    - image_url: URL da imagem
    """
    __tablename__ = 'portfolio_items'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    
    # Categoria e tipo
    category = db.Column(db.String(50), default='residential', index=True)
    project_type = db.Column(db.String(50))
    
    # Imagem
    image_url = db.Column(db.String(500), nullable=False)
    thumbnail_url = db.Column(db.String(500))
    
    # Detalhes
    location = db.Column(db.String(200))
    year = db.Column(db.Integer)
    area = db.Column(db.Float)  # m²
    
    # Destaque
    is_featured = db.Column(db.Boolean, default=False, index=True)
    is_active = db.Column(db.Boolean, default=True)
    
    # SEO
    slug = db.Column(db.String(200), unique=True)
    meta_title = db.Column(db.String(100))
    meta_description = db.Column(db.String(200))
    
    # Admin
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<PortfolioItem {self.title} ({self.category})>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'project_type': self.project_type,
            'image_url': self.image_url,
            'thumbnail_url': self.thumbnail_url,
            'location': self.location,
            'year': self.year,
            'area': self.area,
            'is_featured': self.is_featured,
            'is_active': self.is_active,
            'slug': self.slug,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# ============================================================
# ════════════════════════════════════════════════════════════
# 🛠️ MODELO: SERVICE (SERVIÇO)
# ════════════════════════════════════════════════════════════

class Service(db.Model):
    """
    Modelo de serviço oferecido
    
    Campos:
    - id: ID único
    - name: Nome do serviço
    - description: Descrição
    - icon: Ícone (classe CSS ou emoji)
    """
    __tablename__ = 'services'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True)
    description = db.Column(db.Text)
    short_description = db.Column(db.String(255))
    
    # Ícone (emoji ou classe)
    icon = db.Column(db.String(50))
    
    # Conteúdo detalhado
    features = db.Column(db.Text)  # Lista de features (JSON)
    
    # Estado
    is_active = db.Column(db.Boolean, default=True)
    order_index = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Service {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'short_description': self.short_description,
            'icon': self.icon,
            'is_active': self.is_active,
            'order_index': self.order_index
        }


# ============================================================
# ════════════════════════════════════════════════════════════
# 📧 MODELO: NEWSLETTER
# ════════════════════════════════════════════════════════════

class Newsletter(db.Model):
    """Modelo para subscritores da newsletter"""
    __tablename__ = 'newsletter'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False, unique=True, index=True)
    name = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)
    ip_address = db.Column(db.String(45))
    subscribed_at = db.Column(db.DateTime, default=datetime.utcnow)
    unsubscribed_at = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<Newsletter {self.email}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'is_active': self.is_active,
            'subscribed_at': self.subscribed_at.isoformat() if self.subscribed_at else None
        }


# ============================================================
# ════════════════════════════════════════════════════════════
# 📄 MODELO: DOCUMENT (DOCUMENTO)
# ════════════════════════════════════════════════════════════

class Document(db.Model):
    """
    Modelo de documento (contratos, faturas, plantas)
    """
    __tablename__ = 'documents'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Identificação
    title = db.Column(db.String(200), nullable=False)
    document_type = db.Column(db.String(50), nullable=False)  # contract, invoice, plant, report
    
    # Ficheiro
    file_url = db.Column(db.String(500), nullable=False)
    original_filename = db.Column(db.String(255))
    file_size = db.Column(db.Integer)  # Bytes
    
    # Relações
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), index=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), index=True)
    quote_id = db.Column(db.Integer, db.ForeignKey('quotes.id'))
    
    # Estado
    is_public = db.Column(db.Boolean, default=False)
    is_signed = db.Column(db.Boolean, default=False)
    signed_at = db.Column(db.DateTime)
    
    # Admin
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Document {self.title} ({self.document_type})>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'document_type': self.document_type,
            'file_url': self.file_url,
            'file_size': self.file_size,
            'project_id': self.project_id,
            'client_id': self.client_id,
            'quote_id': self.quote_id,
            'is_public': self.is_public,
            'is_signed': self.is_signed,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# ============================================================
# 📊 SEED DATA - DADOS DE DEMONSTRAÇÃO
# ============================================================

def seed_data():
    """Insere dados de demonstração no banco de dados"""
    
    # Verificar se já existem dados
    if User.query.first():
        print("⚠️ Base de dados já contém dados. Pulando seed...")
        return
    
    print("🌱 A criar dados de demonstração...")
    
    # Admin principal
    admin = User(
        username='admin',
        email='admin@doislados.co.ao',
        full_name='Administrador',
        phone='+244 928 035 347',
        is_admin=True,
        is_active=True
    )
    admin.set_password('admin123')
    db.session.add(admin)
    db.session.flush()
    
    # Utilizador de demonstração
    demo_user = User(
        username='joaosilva',
        email='joao.silva@email.com',
        full_name='João Silva',
        phone='+244 928 035 347',
        is_admin=False,
        is_active=True
    )
    demo_user.set_password('cliente123')
    db.session.add(demo_user)
    db.session.flush()
    
    # Cliente associado ao demo user
    client = Client(
        user_id=demo_user.id,
        name='João Silva',
        email='joao.silva@email.com',
        phone='+244 928 035 347',
        nif='1234567890',
        address='Ngola Kiluanje',
        city='Luanda',
        province='Luanda',
        country='Angola'
    )
    db.session.add(client)
    db.session.flush()
    
    # Projetos de exemplo
    projects_data = [
        {
            'title': 'Moradia T5 - Talatona',
            'description': 'Moradia de luxo com 5 quartos, piscina e jardim.',
            'category': 'residential',
            'project_type': 'T5',
            'status': 'in_progress',
            'budget': 450000,
            'location': 'Talatona, Luanda',
            'municipality': 'Talatona',
            'client_id': client.id,
            'created_by': admin.id,
            'area': 450
        },
        {
            'title': 'Edifício Comercial Kilamba',
            'description': 'Prédio de 6 andares para escritórios e comércio.',
            'category': 'commercial',
            'project_type': 'Edifício',
            'status': 'completed',
            'budget': 1200000,
            'location': 'Kilamba, Luanda',
            'municipality': 'Kilamba',
            'client_id': None,
            'created_by': admin.id,
            'area': 2500
        },
        {
            'title': 'Urbanismo Cacuaco',
            'description': 'Projeto de urbanização com 50 lotes.',
            'category': 'urbanism',
            'project_type': 'Loteamento',
            'status': 'planning',
            'budget': 2500000,
            'location': 'Cacuaco, Luanda',
            'municipality': 'Cacuaco',
            'client_id': None,
            'created_by': admin.id,
            'area': 50000
        }
    ]
    
    for p_data in projects_data:
        project = Project(**p_data)
        db.session.add(project)
    
    # Serviços
    services_data = [
        {
            'name': 'Projeto Arquitetônico',
            'slug': 'projeto-arquitetonico',
            'short_description': 'Projetos residenciais e comerciais',
            'description': 'Desenvolvemos projetos arquitetônicos completos para construções novas ou remodelações.',
            'icon': '🏗️',
            'order_index': 1
        },
        {
            'name': 'Gestão de Obras',
            'slug': 'gestao-obras',
            'short_description': 'Fiscalização e controle de obra',
            'description': 'Acompanhamento completo da obra desde o projeto até à entrega final.',
            'icon': '📋',
            'order_index': 2
        },
        {
            'name': 'Design de Interiores',
            'slug': 'design-interiores',
            'short_description': 'Interiorismo e reabilitação',
            'description': 'Criação de espaços interiores funcionais e estéticos.',
            'icon': '🛋️',
            'order_index': 3
        },
        {
            'name': 'Consultoria Técnica',
            'slug': 'consultoria-tecnica',
            'short_description': 'Orçamentação e pareceres',
            'description': 'Análise técnica e orçamentação de projetos.',
            'icon': '📊',
            'order_index': 4
        }
    ]
    
    for s_data in services_data:
        service = Service(**s_data)
        db.session.add(service)
    
    # Portfólio
    portfolio_data = [
        {
            'title': 'Moradia Moderna Talatona',
            'description': 'Moradia contemporânea com áreas sociais amplas.',
            'category': 'residential',
            'project_type': 'Moradia',
            'location': 'Talatona, Luanda',
            'year': 2024,
            'area': 380,
            'is_featured': True,
            'created_by': admin.id,
            'image_url': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
        },
        {
            'title': 'Edifício Sede保险公司',
            'description': 'Sede empresarial moderna com 8 andares.',
            'category': 'commercial',
            'project_type': 'Edifício',
            'location': 'Centro, Luanda',
            'year': 2023,
            'area': 3500,
            'is_featured': True,
            'created_by': admin.id,
            'image_url': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'
        },
        {
            'title': 'Urbanização Cacuaco',
            'description': 'Loteamento com 80 terrenos infraestruturados.',
            'category': 'urbanism',
            'project_type': 'Loteamento',
            'location': 'Cacuaco, Luanda',
            'year': 2024,
            'area': 80000,
            'is_featured': False,
            'created_by': admin.id,
            'image_url': 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=800'
        },
        {
            'title': 'Apartamento T3 Miramar',
            'description': 'Remodelação completa de apartamento de luxo.',
            'category': 'interior',
            'project_type': 'T3',
            'location': 'Miramar, Luanda',
            'year': 2024,
            'area': 120,
            'is_featured': True,
            'created_by': admin.id,
            'image_url': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
        }
    ]
    
    for p_data in portfolio_data:
        item = PortfolioItem(**p_data)
        db.session.add(item)
    
    # Commit final
    db.session.commit()
    print("✅ Dados de demonstração criados com sucesso!")
    print("=" * 50)
    print("🔐 LOGINS DE DEMONSTRAÇÃO:")
    print("   Admin:    admin@doislados.co.ao / admin123")
    print("   Cliente:  joao.silva@email.com / cliente123")
    print("=" * 50)
