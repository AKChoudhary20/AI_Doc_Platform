# AI-Assisted Document Authoring Platform

A full-stack web application that allows users to generate, refine, and export structured business documents (Word .docx and PowerPoint .pptx) using AI.

## Features

- **User Authentication**: Secure login and registration.
- **Project Management**: Dashboard to manage multiple document projects.
- **Document Configuration**: Select document type (DOCX/PPTX) and define topic.
- **AI-Powered Outline**: Automatically suggest document structure based on topic.
- **Content Generation**: Generate content for each section/slide using Gemini API.
- **Interactive Refinement**: Refine content with natural language prompts (e.g., "Make it shorter").
- **Export**: Download final documents in .docx or .pptx format.

## Tech Stack

- **Backend**: FastAPI, SQLModel (SQLite), python-docx, python-pptx, google-generativeai
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Axios

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- Google Gemini API Key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Mac/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the `backend` directory with the following content:
   ```env
   SECRET_KEY=your_secret_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. Initialize the database (optional, app does it on startup but good for verification):
   ```bash
   python init_db.py
   ```

6. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

## Usage Guide

1. **Register/Login**: Create an account or log in.
2. **Create Project**: Click "New Project", select type (Word/PowerPoint), and enter a topic.
3. **Outline**: Use "AI Suggest" to generate an outline, or add sections manually.
4. **Generate**: Click "Create Project". In the editor, click "Generate Content" for each section.
5. **Refine**: Use the "Refine with AI" button to modify content.
6. **Export**: Click "Export" to download the final document.
