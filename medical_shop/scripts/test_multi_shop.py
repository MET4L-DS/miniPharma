"""
Test script for the new multi-shop manager schema
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_manager_registration():
    """Test registering a new manager"""
    print("\n=== Testing Manager Registration ===")
    
    data = {
        "phone": "1234567890",
        "password": "manager123",
        "name": "John Doe",
        "shopname": "ABC Pharmacy"
    }
    
    response = requests.post(f"{BASE_URL}/register/", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        return response.json()['token']
    return None

def test_manager_login(token=None):
    """Test manager login"""
    print("\n=== Testing Manager Login ===")
    
    data = {
        "phone": "1234567890",
        "password": "manager123"
    }
    
    response = requests.post(f"{BASE_URL}/login/", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        return response.json()['token']
    return token

def test_add_second_shop(token):
    """Test adding a second shop"""
    print("\n=== Testing Add Second Shop ===")
    
    data = {
        "phone": "9999999999",
        "shopname": "XYZ Medical Store"
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/shops/add/", json=data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_my_shops(token):
    """Test getting all shops for manager"""
    print("\n=== Testing My Shops ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/shops/mine/", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_switch_shop(token, shop_phone):
    """Test switching to another shop"""
    print(f"\n=== Testing Switch Shop to {shop_phone} ===")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/shops/{shop_phone}/switch/", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        return response.json()['token']
    return token

def test_add_staff(token, shop_phone):
    """Test adding staff to a shop"""
    print(f"\n=== Testing Add Staff to Shop {shop_phone} ===")
    
    data = {
        "phone": "8888888888",
        "name": "Staff Member",
        "password": "staff123"
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/shops/{shop_phone}/staffs/add/", json=data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_staff_login():
    """Test staff login"""
    print("\n=== Testing Staff Login ===")
    
    data = {
        "phone": "8888888888",
        "password": "staff123",
        "shop": "1234567890"
    }
    
    response = requests.post(f"{BASE_URL}/login/", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        return response.json()['token']
    return None

def run_all_tests():
    """Run all test scenarios"""
    print("=" * 60)
    print("MULTI-SHOP MANAGER SCHEMA TESTS")
    print("=" * 60)
    
    # Test 1: Register manager (creates first shop)
    token = test_manager_registration()
    if not token:
        print("\n❌ Registration failed. Stopping tests.")
        return
    
    # Test 2: Login as manager
    token = test_manager_login(token)
    
    # Test 3: Add second shop
    test_add_second_shop(token)
    
    # Test 4: Get all shops
    test_my_shops(token)
    
    # Test 5: Switch to second shop
    new_token = test_switch_shop(token, "9999999999")
    
    # Test 6: Add staff to first shop
    test_add_staff(token, "1234567890")
    
    # Test 7: Staff login
    staff_token = test_staff_login()
    
    # Test 8: Staff tries to access my_shops (should fail)
    if staff_token:
        print("\n=== Testing Staff Access to My Shops (Should Fail) ===")
        headers = {"Authorization": f"Bearer {staff_token}"}
        response = requests.get(f"{BASE_URL}/shops/mine/", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    print("\n" + "=" * 60)
    print("TESTS COMPLETED")
    print("=" * 60)

if __name__ == "__main__":
    try:
        run_all_tests()
    except requests.exceptions.ConnectionError:
        print("\n❌ Could not connect to server. Make sure the Django server is running on http://localhost:8000")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
