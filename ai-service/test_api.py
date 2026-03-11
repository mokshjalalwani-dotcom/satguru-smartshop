import requests

def test_api():
    base_url = "http://localhost:8000"
    endpoints = [
        "/health",
        "/stats?days=7",
        "/product-stats?days=7",
        "/history?days=7",
        "/insights",
        "/predict",
        "/transactions",
        "/demand",
        "/anomalies"
    ]
    
    for endpoint in endpoints:
        try:
            r = requests.get(base_url + endpoint)
            print(f"Testing {endpoint}: {r.status_code}")
            if r.status_code == 200:
                data = r.json()
                print(f"  Response: {str(data)[:100]}...")
            else:
                print(f"  Error: {r.text}")
        except Exception as e:
            print(f"  Failed {endpoint}: {e}")

if __name__ == "__main__":
    test_api()
