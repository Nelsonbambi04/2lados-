"""
Modelos SQLAlchemy para o Sistema Dois Lados
Dois Lados - Escritório de Arquitetura e Construção
Luanda, Angola
"""

from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()


class User(UserMixin, db.Model):
    """
    Modelo de Utilizador
    Suporta tanto clientes como administradores
    """
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    projects = db.relationship('Project', backref='client', lazy='dynamic', foreign_keys='Project.client_id')
    messages = db.relationship('Message', backref='user', lazy='dynamic', foreign_keys='Message.user_id')
    quotes = db.relationship('Quote', backref='user', lazy='dynamic', foreign_keys='Quote.user_id')

    def set_password(self, password):
        """Encripta e define a password"""
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password):
        """Verifica se a password corresponde"""
        return check_password_hash(self.password_hash, password)

    def is_administrator(self):
        """Verifica se é administrador"""
        return self.is_admin and self.is_active

    def __repr__(self):
        return f'<User {self.username}>'


class Project(db.Model):
    """
    Modelo de Projeto
    Armazena informações de projetos de arquitetura
    """
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), nullable=False)  # residencial, comercial, urbanismo
    status = db.Column(db.String(30), default='orcamento', nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    budget = db.Column(db.Numeric(12, 2), nullable=True)
    location = db.Column(db.String(200), nullable=True)
    area_sqm = db.Column(db.Numeric(10, 2), nullable=True)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    phases = db.relationship('ProjectPhase', backref='project', lazy='dynamic', cascade='all, delete-orphan')
    images = db.relationship('ProjectImage', backref='project', lazy='dynamic', cascade='all, delete-orphan')
    documents = db.relationship('ProjectDocument', backref='project', lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Project {self.title}>'


class ProjectPhase(db.Model):
    """
    Modelo de Fase de Projeto
    Gerencia as etapas/cronograma do projeto
    """
    __tablename__ = 'project_phases'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    phase_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    phase_order = db.Column(db.Integer, default=1)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(30), default='pendente', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f'<ProjectPhase {self.phase_name}>'


class ProjectImage(db.Model):
    """
    Modelo de Imagens de Projeto
    Armazena URLs epath das imagens do portfólio
    """
    __tablename__ = 'project_images'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    caption = db.Column(db.String(200), nullable=True)
    is_main = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f'<ProjectImage {self.id}>'


class ProjectDocument(db.Model):
    """
    Documentos operacionais de cada obra.
    Suporta plantas, propostas, faturas, orcamentos e outros ficheiros internos.
    """
    __tablename__ = 'project_documents'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    document_type = db.Column(db.String(30), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    file_url = db.Column(db.String(500), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    mime_type = db.Column(db.String(120), nullable=True)
    amount = db.Column(db.Numeric(12, 2), nullable=True)
    status = db.Column(db.String(30), default='rascunho', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<ProjectDocument {self.title}>'


class Quote(db.Model):
    """
    Modelo de Orçamento
    Armazena pedidos de orçamento dos clientes
    """
    __tablename__ = 'quotes'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    client_name = db.Column(db.String(100), nullable=False)
    client_email = db.Column(db.String(120), nullable=False, index=True)
    client_phone = db.Column(db.String(20), nullable=True)
    service_type = db.Column(db.String(50), nullable=False)
    project_type = db.Column(db.String(50), nullable=True)
    description = db.Column(db.Text, nullable=False)
    budget_range = db.Column(db.String(50), nullable=True)
    location = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(30), default='pendente', nullable=False)
    admin_notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    def __repr__(self):
        return f'<Quote {self.id} - {self.client_name}>'


class Message(db.Model):
    """
    Modelo de Mensagem
    Armazena mensagens de contacto do formulário
    """
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    subject = db.Column(db.String(200), nullable=True)
    content = db.Column(db.Text, nullable=False)
    sender_role = db.Column(db.String(20), default='client', nullable=False)
    attachment_url = db.Column(db.String(500), nullable=True)
    attachment_name = db.Column(db.String(255), nullable=True)
    attachment_type = db.Column(db.String(80), nullable=True)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    is_replied = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f'<Message {self.id} - {self.subject}>'


class PortfolioItem(db.Model):
    """
    Modelo de Item do Portfólio
    Gerencia os projetos em exibição no site
    """
    __tablename__ = 'portfolio_items'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), nullable=False, index=True)
    image_url = db.Column(db.String(500), nullable=False)
    thumbnail_url = db.Column(db.String(500), nullable=True)
    location = db.Column(db.String(100), nullable=True)
    area_sqm = db.Column(db.Numeric(10, 2), nullable=True)
    year = db.Column(db.Integer, nullable=True)
    is_featured = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f'<PortfolioItem {self.title}>'


class Publication(db.Model):
    """
    Publicacoes do site: noticias, atividades, eventos, publicidades e obras.
    """
    __tablename__ = 'publications'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    summary = db.Column(db.String(300), nullable=True)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(30), nullable=False, index=True)
    image_url = db.Column(db.String(500), nullable=True)
    link_url = db.Column(db.String(500), nullable=True)
    event_date = db.Column(db.Date, nullable=True)
    location = db.Column(db.String(150), nullable=True)
    is_featured = db.Column(db.Boolean, default=False, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Publication {self.title}>'


class Newsletter(db.Model):
    """
    Modelo de Newsletter
    Armazena emails dos subscritores
    """
    __tablename__ = 'newsletter'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f'<Newsletter {self.email}>'


class SystemLog(db.Model):
    """
    Modelo de Log do Sistema
    Regista atividades para auditoria
    """
    __tablename__ = 'system_logs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f'<SystemLog {self.action}>'


# ============================================
# FUNÇÕES DE INICIALIZAÇÃO E SEED DATA
# ============================================

def create_admin_user():
    """Cria o utilizador administrador padrão"""
    admin = User.query.filter_by(email='admin@doislados.co.ao').first()
    if not admin:
        admin = User(
            username='admin',
            email='admin@doislados.co.ao',
            is_admin=True,
            is_active=True
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print('Admin user created: admin@doislados.co.ao / admin123')
    return admin


def init_sample_data():
    """Inicializa dados de exemplo para teste"""
    
    # Categorias de projeto
    categories = ['Residencial', 'Comercial', 'Urbanismo', 'Industrial']
    
    # Tipos de serviço
    services = [
        'Projeto Arquitetônico',
        'Fiscalização de Obras',
        'Design de Interiores',
        'Consultoria Técnica'
    ]
    
    # Verificar se já existem dados
    if Project.query.first() is None:
        # Criar projeto de exemplo
        sample_project = Project(
            title='Edifício Residencial Talatona',
            description='Complexo residencial de 12 andares em Talatona, Luanda',
            category='residencial',
            status='em_progresso',
            location='Talatona, Luanda',
            area_sqm=2500.00,
            budget=850000.00
        )
        db.session.add(sample_project)
        
        # Criar fases de exemplo
        phases = [
            ('Estudo Prévio', 'Análise de requisitos e viabilidade', 1),
            ('Anteprojeto', 'Desenvolvimento de plantas preliminares', 2),
            ('Projeto de Execução', 'Detalhamento técnico completo', 3),
            ('Licenciamento', 'Submissão e aprovação de licenças', 4),
            ('Fiscalização', 'Acompanhamento da construção', 5),
            ('Entrega', 'Entrega final ao cliente', 6)
        ]
        
        for name, desc, order in phases:
            phase = ProjectPhase(
                project=sample_project,
                phase_name=name,
                description=desc,
                phase_order=order,
                status='pendente' if order > 1 else 'em_progresso'
            )
            db.session.add(phase)
        
        # Criar item de portfólio de exemplo
        portfolio = PortfolioItem(
            title='Villa Margarida',
            description='Moradia de luxo com 4 suítes em Talatona',
            category='residencial',
            image_url='/static/uploads/portfolio/villa_margarida.jpg',
            location='Talatona, Luanda',
            area_sqm=450.00,
            year=2024,
            is_featured=True
        )
        db.session.add(portfolio)
        
        db.session.commit()
        print('Sample data initialized')
