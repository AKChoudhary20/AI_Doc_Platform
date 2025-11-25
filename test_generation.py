import requests

# Login to get token
login_data = {
    "username": "test@example.com",
    "password": "test123"
}

response = requests.post("http://localhost:8000/auth/token", data=login_data)
if response.status_code != 200:
    print(f"Login failed: {response.text}")
    exit(1)

token = response.json()["access_token"]
print(f"✅ Login successful! Token: {token[:20]}...")

# Get sections for project 1
headers = {"Authorization": f"Bearer {token}"}
sections_response = requests.get("http://localhost:8000/projects/1/sections", headers=headers)

if sections_response.status_code != 200:
    print(f"Failed to get sections: {sections_response.text}")
    exit(1)

sections = sections_response.json()
print(f"\n✅ Found {len(sections)} sections:")
for s in sections:
    print(f"  - Section {s['id']}: {s['title']} (content: {'Yes' if s.get('content') else 'No'})")

# Test generation on first section
if sections:
    section_id = sections[0]['id']
    print(f"\n🔄 Testing content generation for section {section_id}...")
    
    gen_response = requests.post(
        f"http://localhost:8000/generation/section/{section_id}",
        headers=headers
    )
    
    if gen_response.status_code == 200:
        content = gen_response.json()["content"]
        print(f"\n✅ Content generated successfully!")
        print(f"Content preview: {content[:200]}...")
    else:
        print(f"\n❌ Generation failed: {gen_response.status_code}")
        print(f"Error: {gen_response.text}")
else:
    print("\n⚠️  No sections found to test generation")
