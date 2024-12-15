import requests
import json

# Base URL for our Django application
BASE_URL = 'http://localhost:8000/api'

def print_section(title):
    """Helper function to print section headers"""
    print("\n" + "="*50)
    print(title)
    print("="*50)

def register_user():
    """Demonstrate user registration"""
    print_section("1. USER REGISTRATION")
    
    # Prepare registration data
    registration_data = {
        'username': 'mining_admin',
        'email': 'admin@mymine.com',
        'password': 'SecurePass123!',
        'password2': 'SecurePass123!',
        'role': 'admin',
        'department': 'Extraction'
    }
    
    # Send registration request
    response = requests.post(f'{BASE_URL}/register/', json=registration_data)
    
    # Print registration results
    print("Registration Response:")
    print(f"Status Code: {response.status_code}")
    
    # Parse and print response
    try:
        registration_result = response.json()
        print("\nRegistration Result:")
        print(json.dumps(registration_result, indent=2))
        return registration_result
    except ValueError:
        print("Failed to parse registration response")
        print(response.text)
        return None

def obtain_tokens(username, password):
    """Obtain JWT tokens"""
    print_section("2. TOKEN OBTAINMENT")
    
    # Prepare token request data
    token_data = {
        'username': username,
        'password': password
    }
    
    # Send token request
    response = requests.post(f'{BASE_URL}/token/', json=token_data)
    
    # Print token obtainment results
    print("Token Obtainment Response:")
    print(f"Status Code: {response.status_code}")
    
    # Parse and print response
    try:
        token_result = response.json()
        print("\nToken Result:")
        print(json.dumps(token_result, indent=2))
        return token_result
    except ValueError:
        print("Failed to parse token response")
        print(response.text)
        return None

def verify_token(token):
    """Verify JWT token"""
    print_section("3. TOKEN VERIFICATION")
    
    # Prepare token verification data
    verify_data = {
        'token': token
    }
    
    # Send token verification request
    response = requests.post(f'{BASE_URL}/token/verify/', json=verify_data)
    
    # Print token verification results
    print("Token Verification Response:")
    print(f"Status Code: {response.status_code}")
    
    # Parse and print response
    try:
        verify_result = response.json()
        print("\nVerification Result:")
        print(json.dumps(verify_result, indent=2))
        return verify_result
    except ValueError:
        print("Failed to parse verification response")
        print(response.text)
        return None

def refresh_token(refresh_token):
    """Refresh access token"""
    print_section("4. TOKEN REFRESH")
    
    # Prepare token refresh data
    refresh_data = {
        'refresh': refresh_token
    }
    
    # Send token refresh request
    response = requests.post(f'{BASE_URL}/token/refresh/', json=refresh_data)
    
    # Print token refresh results
    print("Token Refresh Response:")
    print(f"Status Code: {response.status_code}")
    
    # Parse and print response
    try:
        refresh_result = response.json()
        print("\nRefresh Result:")
        print(json.dumps(refresh_result, indent=2))
        return refresh_result
    except ValueError:
        print("Failed to parse refresh response")
        print(response.text)
        return None

def get_user_profile(access_token):
    """Retrieve user profile"""
    print_section("5. USER PROFILE RETRIEVAL")
    
    # Prepare headers with access token
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    # Send profile request
    response = requests.get(f'{BASE_URL}/profile/', headers=headers)
    
    # Print profile retrieval results
    print("Profile Retrieval Response:")
    print(f"Status Code: {response.status_code}")
    
    # Parse and print response
    try:
        profile_result = response.json()
        print("\nProfile Result:")
        print(json.dumps(profile_result, indent=2))
        return profile_result
    except ValueError:
        print("Failed to parse profile response")
        print(response.text)
        return None

def logout(refresh_token):
    """Logout and blacklist refresh token"""
    print_section("6. LOGOUT")
    
    # Prepare logout data
    logout_data = {
        'refresh_token': refresh_token
    }
    
    # Send logout request
    response = requests.post(f'{BASE_URL}/logout/', json=logout_data)
    
    # Print logout results
    print("Logout Response:")
    print(f"Status Code: {response.status_code}")
    
    # Parse and print response
    try:
        logout_result = response.json() if response.text else {}
        print("\nLogout Result:")
        print(json.dumps(logout_result, indent=2))
        return logout_result
    except ValueError:
        print("Failed to parse logout response")
        print(response.text)
        return None

def main():
    """
    Demonstrate full authentication workflow
    Note: This script assumes the Django server is running on localhost:8000
    """
    # 1. Register a new user
    registration = register_user()
    if not registration:
        print("Registration failed. Exiting.")
        return
    
    # 2. Obtain tokens
    tokens = obtain_tokens('mining_admin', 'SecurePass123!')
    if not tokens:
        print("Token obtainment failed. Exiting.")
        return
    
    access_token = tokens.get('access')
    refresh_token = tokens.get('refresh')
    
    # 3. Verify access token
    verify_token(access_token)
    
    # 4. Get user profile
    get_user_profile(access_token)
    
    # 5. Refresh token
    refresh_token_result = refresh_token(refresh_token)
    if refresh_token_result:
        # Update access token with new token
        access_token = refresh_token_result.get('access')
    
    # 6. Logout
    logout(refresh_token)

if __name__ == '__main__':
    main()
