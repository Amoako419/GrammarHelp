# GrammarHelp

GrammarHelp is an AI-powered writing assistant that helps users improve their writing through advanced text analysis and suggestions. The application provides grammar checking, tone analysis, plagiarism detection, and style suggestions.

## Features

- **Grammar & Spelling Check**: Identifies and corrects grammatical errors and spelling mistakes
- **Tone Analysis**: Analyzes the tone of your writing and suggests improvements
- **Plagiarism Detection**: Checks your text for potential plagiarism
- **Style Suggestions**: Provides recommendations to improve writing style and clarity
- **AI-Powered Text Generation**: Generates text based on your prompts

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: FastAPI (Python)
- **AI Model**: Google Gemini AI
- **Database**: PostgreSQL
- **Authentication**: JWT

## Prerequisites

- Python 3.11 or higher
- Node.js 16 or higher
- PostgreSQL
- Google Gemini AI API key

## Setup Instructions

### Backend Setup

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the backend directory:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the backend server:
   ```bash
   uvicorn app.main:app --reload --port 8001
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## Using the Application

1. **Text Analysis**
   - Select the type of analysis (Grammar, Tone, Plagiarism, or Style)
   - Enter your text in the input field
   - Click "Analyze Text" to get suggestions and improvements

2. **Text Generation**
   - Enter your prompt
   - Set the maximum length for the generated text
   - Click "Generate Text" to create AI-generated content

## API Endpoints

- `POST /api/analyze`: Analyze text for grammar, tone, plagiarism, or style
  ```json
  {
    "text": "Your text here",
    "analysis_type": "grammar|tone|plagiarism|style"
  }
  ```

- `POST /api/generate`: Generate text based on a prompt
  ```json
  {
    "prompt": "Your prompt here",
    "max_length": 500
  }
  ```

## Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build

# Backend build
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.