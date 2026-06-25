import sys
import os

# Add the /server directory to the Python path so it can find your modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'server'))

# Import your FastAPI app
from main import app