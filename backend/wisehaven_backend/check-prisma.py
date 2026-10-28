"""Diagnostic script to check Prisma setup."""

import os
import sys
from pathlib import Path

print("=== Prisma Diagnostic ===\n")

# Check Python version
print(f"Python version: {sys.version}")

# Check current directory
print(f"Current directory: {os.getcwd()}")

# Check if schema exists
schema_path = Path("models/schema.prisma")
print(f"Schema exists: {schema_path.exists()}")
if schema_path.exists():
    print(f"Schema path: {schema_path.absolute()}")

# Try importing Prisma
try:
    from prisma import Prisma
    print("\n✓ Prisma client import successful")
except ImportError as e:
    print(f"\n✗ Prisma client import failed: {e}")
    sys.exit(1)

# Check for query engine binary
try:
    from prisma.engine import BINARY_PATHS
    print(f"\n Binary paths:")
    print(f"  Query engine: {BINARY_PATHS.query_engine}")
    
    # Check if binary exists
    if Path(BINARY_PATHS.query_engine).exists():
        print(f"  ✓ Binary exists!")
    else:
        print(f"  ✗ Binary NOT found!")
        print(f"\nSearching for binaries...")
        
        # Search common locations
        locations = [
            Path.home() / ".cache/prisma-python",
            Path.cwd() / "prisma-query-engine-debian-openssl-3.0.x",
            Path("/opt/render/.cache/prisma-python"),
        ]
        
        for loc in locations:
            if loc.exists():
                print(f"  Found: {loc}")
                if loc.is_dir():
                    print(f"    Contents: {list(loc.glob('*'))[:5]}")
            
except Exception as e:
    print(f"\n✗ Error checking binary: {e}")

# Try creating a client (doesn't connect)
try:
    db = Prisma()
    print("\n✓ Prisma client instance created successfully")
except Exception as e:
    print(f"\n✗ Failed to create Prisma client: {e}")

print("\n=== End Diagnostic ===")
