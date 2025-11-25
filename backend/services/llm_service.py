import google.generativeai as genai
import os
import json
from dotenv import load_dotenv
from pathlib import Path

# Load .env from backend directory
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def generate_outline(topic: str, doc_type: str) -> list[str]:
    if not GEMINI_API_KEY:
        # Mock response if no key provided
        return [f"Introduction to {topic}", "Market Overview", "Key Trends", "Challenges", "Conclusion"]

    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    Generate a structured outline for a {doc_type} document about "{topic}".
    Return ONLY a JSON array of strings, where each string is a section header (for docx) or slide title (for pptx).
    Do not include any markdown formatting or explanations.
    Example: ["Introduction", "Background", "Analysis", "Conclusion"]
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Clean up potential markdown code blocks
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        
        return json.loads(text)
    except Exception as e:
        print(f"Error generating outline: {e}")
        return [f"Introduction to {topic}", "Overview", "Details", "Summary"]

def generate_section_content(topic: str, section_title: str, doc_type: str) -> str:
    if not GEMINI_API_KEY:
        return f"This is generated content for {section_title} about {topic}."

    model = genai.GenerativeModel('gemini-2.5-flash')
    prompt = f"""
    Write content for a {doc_type} section titled "{section_title}" for a document about "{topic}".
    Keep it professional and concise.
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating content: {e}"
