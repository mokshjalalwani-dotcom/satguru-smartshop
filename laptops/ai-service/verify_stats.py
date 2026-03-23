import requests
import json

try:
    r = requests.get("http://localhost:8000/stats?days=7")
    print(json.dumps(r.json(), indent=2))
    
    r = requests.get("http://localhost:8000/inventory")
    print("\nInventory (first item):")
    print(json.dumps(r.json()[:1], indent=2))
except Exception as e:
    print(f"Error: {e}")
