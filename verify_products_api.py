import requests
import json

try:
    response = requests.get('http://localhost:5000/api/products/')
    if response.status_code == 200:
        print("✅ API Request Successful")
        data = response.json()
        print(f"📦 Products Found: {len(data)}")
        if len(data) > 0:
            print("First product sample:")
            print(json.dumps(data[0], indent=2, ensure_ascii=False))
        else:
            print("⚠️ No products returned (list is empty)")
    else:
        print(f"❌ API Request Failed: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"❌ Connection Error: {e}")
