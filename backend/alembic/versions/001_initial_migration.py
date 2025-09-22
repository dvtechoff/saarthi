"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('password_hash', sa.String(length=255), nullable=False),
    sa.Column('role', sa.Enum('COMMUTER', 'DRIVER', 'AUTHORITY', name='userrole'), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=True),
    sa.Column('phone', sa.String(length=20), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # Create routes table
    op.create_table('routes',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_routes_id'), 'routes', ['id'], unique=False)

    # Create stops table
    op.create_table('stops',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('latitude', sa.Float(), nullable=False),
    sa.Column('longitude', sa.Float(), nullable=False),
    sa.Column('route_id', sa.Integer(), nullable=True),
    sa.Column('sequence_order', sa.Integer(), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.ForeignKeyConstraint(['route_id'], ['routes.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stops_id'), 'stops', ['id'], unique=False)

    # Create buses table
    op.create_table('buses',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('bus_number', sa.String(length=20), nullable=False),
    sa.Column('route_id', sa.Integer(), nullable=True),
    sa.Column('current_latitude', sa.Float(), nullable=True),
    sa.Column('current_longitude', sa.Float(), nullable=True),
    sa.Column('speed', sa.Float(), nullable=True),
    sa.Column('heading', sa.Float(), nullable=True),
    sa.Column('occupancy', sa.Enum('LOW', 'MEDIUM', 'HIGH', name='occupancylevel'), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('last_updated', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    sa.ForeignKeyConstraint(['route_id'], ['routes.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_buses_bus_number'), 'buses', ['bus_number'], unique=True)
    op.create_index(op.f('ix_buses_id'), 'buses', ['id'], unique=False)

    # Create trips table
    op.create_table('trips',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('trip_id', sa.String(length=50), nullable=False),
    sa.Column('driver_id', sa.Integer(), nullable=True),
    sa.Column('bus_id', sa.Integer(), nullable=True),
    sa.Column('route_id', sa.Integer(), nullable=True),
    sa.Column('status', sa.Enum('ACTIVE', 'COMPLETED', 'CANCELLED', name='tripstatus'), nullable=True),
    sa.Column('start_time', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    sa.Column('end_time', sa.DateTime(timezone=True), nullable=True),
    sa.Column('distance_traveled', sa.Float(), nullable=True),
    sa.ForeignKeyConstraint(['bus_id'], ['buses.id'], ),
    sa.ForeignKeyConstraint(['driver_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['route_id'], ['routes.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_trips_trip_id'), 'trips', ['trip_id'], unique=True)
    op.create_index(op.f('ix_trips_id'), 'trips', ['id'], unique=False)

    # Create feedbacks table
    op.create_table('feedbacks',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('commuter_id', sa.Integer(), nullable=True),
    sa.Column('bus_id', sa.Integer(), nullable=True),
    sa.Column('occupancy', sa.Enum('LOW', 'MEDIUM', 'HIGH', name='occupancylevel'), nullable=False),
    sa.Column('comment', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    sa.ForeignKeyConstraint(['bus_id'], ['buses.id'], ),
    sa.ForeignKeyConstraint(['commuter_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_feedbacks_id'), 'feedbacks', ['id'], unique=False)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index(op.f('ix_feedbacks_id'), table_name='feedbacks')
    op.drop_table('feedbacks')
    op.drop_index(op.f('ix_trips_id'), table_name='trips')
    op.drop_index(op.f('ix_trips_trip_id'), table_name='trips')
    op.drop_table('trips')
    op.drop_index(op.f('ix_buses_id'), table_name='buses')
    op.drop_index(op.f('ix_buses_bus_number'), table_name='buses')
    op.drop_table('buses')
    op.drop_index(op.f('ix_stops_id'), table_name='stops')
    op.drop_table('stops')
    op.drop_index(op.f('ix_routes_id'), table_name='routes')
    op.drop_table('routes')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS userrole')
    op.execute('DROP TYPE IF EXISTS occupancylevel')
    op.execute('DROP TYPE IF EXISTS tripstatus')
