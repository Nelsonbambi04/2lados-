"""
Configurações do Flask para o Sistema Dois Lados
Dois Lados - Escritório de Arquitetura e Construção
"""

import os
from datetime import timedelta
from urllib.parse import quote_plus


AIVEN_DATABASE_URL = (
    'mysql+pymysql://avnadmin:AVNS_eQhiBribmrQySa_9shY@'
    'mysql-25d29d17-doislados.l.aivencloud.com:23198/defaultdb?charset=utf8mb4'
)


def database_url():
    """Return the MySQL database URL using pymysql and Aiven-ready settings."""
    mysql_vars = {
        'MYSQL_USER': os.environ.get('MYSQL_USER'),
        'MYSQL_PASSWORD': os.environ.get('MYSQL_PASSWORD'),
        'MYSQL_HOST': os.environ.get('MYSQL_HOST'),
        'MYSQL_PORT': os.environ.get('MYSQL_PORT'),
        'MYSQL_DB': os.environ.get('MYSQL_DB'),
    }

    if all(mysql_vars.values()):
        user = quote_plus(mysql_vars['MYSQL_USER'])
        password = quote_plus(mysql_vars['MYSQL_PASSWORD'])
        host = mysql_vars['MYSQL_HOST']
        port = mysql_vars['MYSQL_PORT']
        database = quote_plus(mysql_vars['MYSQL_DB'])
        return f'mysql+pymysql://{user}:{password}@{host}:{port}/{database}?charset=utf8mb4'

    if any(mysql_vars.values()):
        missing = ', '.join(name for name, value in mysql_vars.items() if not value)
        raise RuntimeError(f'Missing MySQL environment variables: {missing}')

    url = os.environ.get('DATABASE_URL') or AIVEN_DATABASE_URL
    if url.startswith('mysql://'):
        url = url.replace('mysql://', 'mysql+pymysql://', 1)
    if not url.startswith('mysql+pymysql://'):
        raise RuntimeError('DATABASE_URL must use MySQL via mysql+pymysql://')
    return url


MYSQL_ENGINE_OPTIONS = {
    'pool_recycle': 280,
    'pool_pre_ping': True,
    'connect_args': {
        'ssl': {},
    },
}


class Config:
    """Configuração base da aplicação"""
    
    # Segurança
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production-doislados-2024'
    
    # Base de Dados MySQL Aiven. Nao ha fallback para SQLite.
    SQLALCHEMY_DATABASE_URI = database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = MYSQL_ENGINE_OPTIONS
    
    # Sessões
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'None'
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    
    # Flask-Login
    REMEMBER_COOKIE_DURATION = timedelta(days=7)
    REMEMBER_COOKIE_SECURE = True
    REMEMBER_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SAMESITE = 'None'
    
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
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_SAMESITE = 'Lax'
    REMEMBER_COOKIE_SECURE = False
    REMEMBER_COOKIE_SAMESITE = 'Lax'


class ProductionConfig(Config):
    """Configuração para produção"""
    DEBUG = False
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'None'
    REMEMBER_COOKIE_SECURE = True
    REMEMBER_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SAMESITE = 'None'


class TestingConfig(Config):
    """Configuração para testes"""
    TESTING = True
    WTF_CSRF_ENABLED = False


# ============================================
# CONFIGURAÇÃO DE E-MAIL (FLASK-MAIL)
# ============================================

class MailConfig:
    """Configuracoes de e-mail usando o SMTP do dominio Dois Lados."""
    
    # Servidor SMTP
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'mail.doislados.ao'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 465)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'False').lower() in ('true', 'on', '1')
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'True').lower() in ('true', 'on', '1')
    
    # Credenciais (NUNCA hardcoded - usar variáveis de ambiente!)
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = (os.environ.get('MAIL_PASSWORD') or '').replace(' ', '') or None
    MAIL_TIMEOUT = int(os.environ.get('MAIL_TIMEOUT') or 10)
    
    # Remetente
    MAIL_DEFAULT_SENDER = (
        'Dois Lados - Arquitetura',
        os.environ.get('MAIL_DEFAULT_SENDER') or os.environ.get('MAIL_USERNAME') or 'geral@doislados.ao'
    )
    
    # Admin destinatário
    SUBMISSION_EMAIL = os.environ.get('SUBMISSION_EMAIL') or 'geral@doislados.ao'
    ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL') or SUBMISSION_EMAIL
    APPLICATION_EMAIL = os.environ.get('APPLICATION_EMAIL') or SUBMISSION_EMAIL
    CONTACT_EMAIL = os.environ.get('CONTACT_EMAIL') or SUBMISSION_EMAIL


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
