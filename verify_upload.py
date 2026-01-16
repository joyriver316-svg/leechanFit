import requests
import pandas as pd
import io

# Test Data
data = [
    {
        "이름": "TestUser1",
        "성별": "남",
        "전화번호": "010-1111-2222",
        "상품명": "", # Missing product name
        "접수일": "2024-01-01",
        "시작일": "2024-01-01",
        "종료일": "",
        "잔여 횟수": "10"
    }
]

df = pd.DataFrame(data)

# Create Excel file in memory
excel_file = io.BytesIO()
with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
    df.to_excel(writer, index=False)
excel_file.seek(0)

# Send Request
url = "http://localhost:5000/api/upload/upload-users"
files = {"file": ("test_upload.xlsx", excel_file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}

try:
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Request failed: {e}")
