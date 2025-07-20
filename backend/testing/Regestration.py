import requests

def test_register_organization():
    url = "http://localhost:5000/api/auth/register-organization"
    data = {
        "email": "orgadmin@example.com",
        "password": "password123",
        "name": "Admin Name",
        "organizationName": "MyOrg",
        "address": {
            "street": "123 Main", "city": "Metro", "state": "MH", "zipCode": "123456", "country": "India"
        },
        "location": {"latitude": 19.1825, "longitude": 72.8402}
    }
    response = requests.post(url, json=data)
    print("Register Org:", response.status_code, response.json())
