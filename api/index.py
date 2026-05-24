import sys
import os

# Allow Python to find modules inside the /server subdirectory
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'server'))

# Import the FastAPI app from your nested folder structure
from main import app