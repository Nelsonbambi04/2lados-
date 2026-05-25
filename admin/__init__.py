"""
Blueprint Admin - Sistema Dois Lados
Dois Lados - Escritório de Arquitetura e Construção
"""

from flask import Blueprint

admin_bp = Blueprint('admin', __name__,
                      url_prefix='/admin',
                      template_folder='../templates/admin')

from . import routes
