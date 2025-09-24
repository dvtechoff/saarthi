"""driver route assignments

Revision ID: f04f0c8269f5
Revises: 001
Create Date: 2025-09-24 00:15:58.599128

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'f04f0c8269f5'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'driver_route_assignments',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
        sa.Column('driver_id', sa.Integer(), nullable=False, index=True),
        sa.Column('route_id', sa.Integer(), nullable=False, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['driver_id'], ['users.id'], name='fk_dra_driver'),
        sa.ForeignKeyConstraint(['route_id'], ['routes.id'], name='fk_dra_route'),
    )
    op.create_unique_constraint('uq_driver_route', 'driver_route_assignments', ['driver_id', 'route_id'])
    op.create_index('ix_dra_driver_id', 'driver_route_assignments', ['driver_id'])
    op.create_index('ix_dra_route_id', 'driver_route_assignments', ['route_id'])


def downgrade() -> None:
    op.drop_index('ix_dra_route_id', table_name='driver_route_assignments')
    op.drop_index('ix_dra_driver_id', table_name='driver_route_assignments')
    op.drop_constraint('uq_driver_route', 'driver_route_assignments', type_='unique')
    op.drop_table('driver_route_assignments')
