import requests
import json

url = 'http://localhost:8000/api/token/'
data = {
    'username': 'testuser',
    'password': 'test123'
}

response = requests.post(url, json=data)
print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")
