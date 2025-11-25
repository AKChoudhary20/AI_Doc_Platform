import sys, os
sys.path.append(os.path.abspath('backend'))
from services.llm_service import generate_outline, generate_section_content

print('Testing outline generation:')
print(generate_outline('Artificial Intelligence', 'docx'))

print('\nTesting section generation:')
print(generate_section_content('Artificial Intelligence', 'Introduction', 'docx'))
