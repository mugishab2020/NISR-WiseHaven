#!/bin/bash
# Automated database setup for WiseHaven

echo "🗄️  Setting up WiseHaven database..."
echo ""

# Create user and database with sudo
echo "Creating PostgreSQL user and database..."
sudo -u postgres psql << EOF
-- Drop existing if any
DROP DATABASE IF EXISTS wisehaven;
DROP USER IF EXISTS wisehaven;

-- Create user
CREATE USER wisehaven WITH PASSWORD 'wisehaven123';

-- Create database
CREATE DATABASE wisehaven OWNER wisehaven;

-- Grant privileges  
GRANT ALL PRIVILEGES ON DATABASE wisehaven TO wisehaven;

-- Show result
\l wisehaven
\du wisehaven
EOF

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Connection details:"
echo "  URL: postgresql://wisehaven:wisehaven123@localhost:5432/wisehaven"
echo "  User: wisehaven"
echo "  Password: wisehaven123"
echo "  Database: wisehaven"
echo ""
echo "Now run migrations with:"
echo "  source venv/bin/activate"
echo "  prisma migrate dev --name init --schema=models/schema.prisma"
