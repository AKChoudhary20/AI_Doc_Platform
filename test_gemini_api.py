import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

print(f"API Key loaded: {'Yes' if GEMINI_API_KEY else 'No'}")
if GEMINI_API_KEY:
    print(f"API Key (first 20 chars): {GEMINI_API_KEY[:20]}...")
    
    # Test the API
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        
        print("\n🔄 Testing Gemini API...")
        response = model.generate_content("Write a short paragraph about artificial intelligence.")
        
        print("\n✅ Gemini API is working!")
        print(f"Generated content:\n{response.text}")
    except Exception as e:
        print(f"\n❌ Gemini API failed: {e}")
else:
    print("\n❌ No API key found!")
