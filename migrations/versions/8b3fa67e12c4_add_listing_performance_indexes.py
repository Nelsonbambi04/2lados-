"""add listing performance indexes

Revision ID: 8b3fa67e12c4
Revises: 7f40a0108c81
Create Date: 2026-10-09

Indexes only: this migration does not delete or rewrite business data.
Run it against a backed-up production database through the normal deployment
process, not from a local development machine pointed at production.
"""

from alembic import op


revision = '8b3fa67e12c4'
down_revision = '7f40a0108c81'
branch_labels = None
depends_on = None


def upgrade():
    op.create_index('ix_projects_client_created', 'projects', ['client_id', 'created_at'], unique=False)
    op.create_index('ix_projects_status_created', 'projects', ['status', 'created_at'], unique=False)
    op.create_index('ix_project_images_project_created', 'project_images', ['project_id', 'created_at'], unique=False)
    op.create_index('ix_project_documents_project_created', 'project_documents', ['project_id', 'created_at'], unique=False)
    op.create_index('ix_messages_user_created', 'messages', ['user_id', 'created_at'], unique=False)
    op.create_index('ix_portfolio_public_listing', 'portfolio_items', ['is_active', 'category', 'created_at'], unique=False)
    op.create_index('ix_publications_public_listing', 'publications', ['is_active', 'category', 'is_featured', 'created_at'], unique=False)


def downgrade():
    op.drop_index('ix_publications_public_listing', table_name='publications')
    op.drop_index('ix_portfolio_public_listing', table_name='portfolio_items')
    op.drop_index('ix_messages_user_created', table_name='messages')
    op.drop_index('ix_project_documents_project_created', table_name='project_documents')
    op.drop_index('ix_project_images_project_created', table_name='project_images')
    op.drop_index('ix_projects_status_created', table_name='projects')
    op.drop_index('ix_projects_client_created', table_name='projects')
