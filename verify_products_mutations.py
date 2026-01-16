import requests
import json

BASE_URL = 'http://localhost:5000/api/products'

def test_create_product():
    print("\ntesting Create Product...")
    payload = {
        "name": "Test Product",
        "regMonths": 3,
        "price": 100000,
        "description": "Test Description",
        "active": True
    }
    try:
        response = requests.post(BASE_URL + '/', json=payload)
        if response.status_code == 201:
            print("✅ Create Successful")
            print(json.dumps(response.json(), indent=2, ensure_ascii=False))
            return response.json()['id']
        else:
            print(f"❌ Create Failed: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return None

def test_update_product(product_id):
    if not product_id:
        print("\nSkipping Update Test (No ID)")
        return

    print(f"\nTesting Update Product {product_id}...")
    payload = {
        "name": "Updated Product",
        "regMonths": 6,
        "price": 200000,
        "description": "Updated Description",
        "active": False
    }
    try:
        response = requests.put(f'{BASE_URL}/{product_id}', json=payload)
        if response.status_code == 200:
            print("✅ Update Successful")
            print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        else:
            print(f"❌ Update Failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    new_id = test_create_product()
    test_update_product(new_id)
