from geopy.geocoders import Nominatim
from geopy.distance import geodesic
import time

# Initialize Nominatim geocoder with a unique user agent
geolocator = Nominatim(user_agent="esponja_chatbot_service")

def get_coordinates(address: str, cep: str) -> tuple[float, float] | None:
    """
    Tries to get latitude and longitude for a given address and CEP.
    Returns a tuple (lat, lon) or None if not found.
    """
    # Attempt 1: Full address + CEP
    query = f"{address}, {cep}, Brasil"
    try:
        location = geolocator.geocode(query, timeout=5)
        if location:
            return location.latitude, location.longitude
    except Exception as e:
        print(f"Geocoding error (Attempt 1): {e}")

    # Fallback attempt 1: Just CEP (often gives the center of the street/neighborhood)
    time.sleep(1) # Respect Nominatim rate limits
    query_cep = f"{cep}, Brasil"
    try:
        location = geolocator.geocode(query_cep, timeout=5)
        if location:
            return location.latitude, location.longitude
    except Exception as e:
        print(f"Geocoding error (Attempt 2): {e}")
        
    return None

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the geodesic distance between two points (in kilometers).
    """
    point1 = (lat1, lon1)
    point2 = (lat2, lon2)
    return geodesic(point1, point2).kilometers
