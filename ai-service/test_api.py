import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoints():
    endpoints = ["/stats", "/predict", "/demand", "/anomalies"]
    for ep in endpoints:
        print(f"\n--- Testing {ep} ---")
        try:
            r = requests.get(f"{BASE_URL}{ep}", timeout=10)
            print(f"Status: {r.status_code}")
            print(json.dumps(r.json(), indent=2))
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_endpoints()
