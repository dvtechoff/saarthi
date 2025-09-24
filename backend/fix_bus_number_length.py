"""Update bus_number field length

Revision ID: increase_bus_number_length
Revises: 
Create Date: 2025-09-24 13:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'increase_bus_number_length'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    """Increase bus_number field length from 20 to 50 characters"""
    # Alter the bus_number column to allow 50 characters
    op.alter_column('buses', 'bus_number',
                    existing_type=sa.String(20),
                    type_=sa.String(50),
                    existing_nullable=False,
                    existing_server_default=None)

def downgrade():
    """Revert bus_number field length back to 20 characters"""
    # Note: This could cause data loss if there are entries longer than 20 chars
    op.alter_column('buses', 'bus_number',
                    existing_type=sa.String(50),
                    type_=sa.String(20),
                    existing_nullable=False,
                    existing_server_default=None)