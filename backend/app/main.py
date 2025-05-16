from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv
import os
import re
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="GrammarHelp API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini AI
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    logger.error("GEMINI_API_KEY not found in environment variables")
    raise ValueError("GEMINI_API_KEY environment variable is required")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')
logger.info("Using model: gemini-1.5-flash")

# Pydantic models
class TextAnalysisRequest(BaseModel):
    text: str
    analysis_type: str  # grammar, tone, plagiarism, style

class TextGenerationRequest(BaseModel):
    prompt: str
    max_length: Optional[int] = 500

class AnalysisResponse(BaseModel):
    suggestions: List[str]
    score: float
    details: Dict[str, Any]

def parse_analysis_response(response_text: str) -> Dict[str, Any]:
    """Parse the Gemini AI response into structured data."""
    try:
        # Extract suggestions
        suggestions = []
        # Look for numbered suggestions or bullet points
        suggestion_pattern = r"(?:\d+\.|\*|\-)\s*([^.\n]+\.)"
        suggestions = re.findall(suggestion_pattern, response_text)
        
        # If no numbered suggestions found, try to split by newlines and filter
        if not suggestions:
            lines = response_text.split('\n')
            suggestions = [line.strip() for line in lines if line.strip() and not line.lower().startswith(('summary', 'overall', 'detailed'))]
        
        # Extract score
        score = 0.0
        # Look for score in various formats
        score_patterns = [
            r"score:\s*(\d*\.?\d+)",
            r"quality score:\s*(\d*\.?\d+)",
            r"overall quality score:\s*(\d*\.?\d+)",
            r"score of\s*(\d*\.?\d+)"
        ]
        
        for pattern in score_patterns:
            score_match = re.search(pattern, response_text.lower())
            if score_match:
                try:
                    score = float(score_match.group(1))
                    break
                except ValueError:
                    continue
        
        # Extract summary and details
        summary = ""
        details = {}
        
        # Try to extract summary
        summary_match = re.search(r"summary[:\s]+([^\n]+)", response_text, re.IGNORECASE)
        if summary_match:
            summary = summary_match.group(1).strip()
        
        # Extract detailed explanation
        details_match = re.search(r"detailed explanation[:\s]+([^\n]+(?:\n[^\n]+)*)", response_text, re.IGNORECASE)
        if details_match:
            details["explanation"] = details_match.group(1).strip()
        
        details.update({
            "raw_analysis": response_text,
            "suggestions_count": len(suggestions),
            "summary": summary
        })
        
        return {
            "suggestions": suggestions,
            "score": score,
            "details": details
        }
    except Exception as e:
        logger.error(f"Error parsing analysis response: {str(e)}")
        logger.error(f"Response text: {response_text}")
        raise

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_text(request: TextAnalysisRequest):
    try:
        logger.info(f"Received analysis request for type: {request.analysis_type}")
        
        # Create a prompt based on the analysis type
        prompt = f"""Analyze the following text for {request.analysis_type}:
        Text: {request.text}
        
        Please provide your analysis in the following format:
        
        Summary of Analysis: [Provide a brief summary of your analysis]
        
        Suggestions for Improvement:
        Focus on these key areas:
        1. Specificity: How can the text be more specific and detailed?
        2. Unique Value: What unique features or benefits should be highlighted?
        3. Target Audience: How can the language be better tailored to the intended audience?
        4. Action Items: What specific changes would improve the text?
        
        Overall Quality Score: [Provide a score from 0 to 1, where:
        0.0-0.3: Needs significant improvement
        0.4-0.6: Average, needs some refinement
        0.7-0.8: Good, minor improvements needed
        0.9-1.0: Excellent, minimal changes required]
        
        Detailed Explanation: [Provide a detailed explanation of your analysis, including:
        - Why each suggestion would improve the text
        - How the suggestions align with the text's purpose
        - Specific examples of how to implement the suggestions]
        
        Please ensure your response follows this exact format with clear sections and a numerical score.
        """
        
        logger.info("Sending request to Gemini AI")
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            logger.error("Empty response from Gemini AI")
            raise HTTPException(status_code=500, detail="Empty response from AI model")
            
        logger.info("Parsing Gemini AI response")
        result = parse_analysis_response(response.text)
        
        logger.info(f"Analysis complete. Found {len(result['suggestions'])} suggestions")
        return AnalysisResponse(**result)
    except Exception as e:
        logger.error(f"Error in analyze_text: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate")
async def generate_text(request: TextGenerationRequest):
    try:
        response = model.generate_content(
            request.prompt,
            generation_config={"max_output_tokens": request.max_length}
        )
        return {"generated_text": response.text}
    except Exception as e:
        logger.error(f"Error in generate_text: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 