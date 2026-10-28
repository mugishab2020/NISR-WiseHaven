#!/usr/bin/env bash
# Render build script for Prisma Python

set -o errexit  # Exit on error

# Install Python dependencies
pip install -r requirements.txt

# Generate Prisma client and fetch query engine binaries
prisma generate --schema models/schema.prisma

# Fetch Prisma query engine binaries for the deployment platform
prisma py fetch
