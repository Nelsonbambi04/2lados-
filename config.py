"""
Configurações do Flask para o Sistema Dois Lados
Dois Lados - Escritório de Arquitetura e Construção
"""

import os
from datetime import timedelta


class Config:
    """Configuração base da aplicação"""
    
    # Segurança
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production-doislados-2024'
    
    # Base de Dados SQLite por defeito
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database', 'dois_lados.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {}
    
    # Sessões
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    
    # Flask-Login
    REMEMBER_COOKIE_DURATION = timedelta(days=7)
    
    # Upload de ficheiros
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'dwg'}
    
    # Página inicial
    INDEX_PAGE = 'index'


class DevelopmentConfig(Config):
    """Configuração para desenvolvimento"""
    DEBUG = True
    SQLALCHEMY_ECHO = False  # True para ver SQL no terminal
    SQLALCHEMY_ENGINE_OPTIONS = {}


class ProductionConfig(Config):
    """Configuração para produção"""
    DEBUG = False
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'


class TestingConfig(Config):
    """Configuração para testes"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_ENGINE_OPTIONS = {}
    WTF_CSRF_ENABLED = False


# ============================================
# CONFIGURAÇÃO DE E-MAIL (FLASK-MAIL)
# ============================================

class MailConfig:
    """Configurações de e-mail usando Gmail SMTP"""
    
    # Servidor SMTP
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'True').lower() in ('true', 'on', '1')
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'False').lower() in ('true', 'on', '1')
    
    # Credenciais (NUNCA hardcoded - usar variáveis de ambiente!)
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME') or 'nelsonbambi177@gmail.com'
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD') or ''
    
    # Remetente
    MAIL_DEFAULT_SENDER = ('Dois Lados - Arquitetura', 'noreply@doislados.co.ao')
    
    # Admin destinatário
    ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL') or 'nelsonbambi177@gmail.com'


# Combinar configurações
class CombinedConfig(Config, MailConfig):
    """Configuração combinada"""
    pass


# Dicionário de configurações
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
