"""
FastAPI Backend for Immersive Traveler Companion AI
Main application with all API endpoints.
"""

import os
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from agent import get_agent
from tavily_client import get_tavily_client
from tools import recommend_destinations, generate_itinerary


load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Immersive Traveler Companion AI",
    description="AI-powered travel assistant with VR previews, web search, and personalized recommendations",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============== Pydantic Models ==============

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"


class ChatResponse(BaseModel):
    response: str
    tool_calls: list = []
    search_results: Optional[dict] = None
    itinerary: Optional[dict] = None
    recommendations: Optional[dict] = None
    error: Optional[str] = None



class SearchRequest(BaseModel):
    query: str
    max_results: Optional[int] = 5


class SearchResponse(BaseModel):
    query: str
    results: list
    answer: Optional[str] = None
    error: Optional[str] = None





class ItineraryRequest(BaseModel):
    destination: str
    days: int
    preferences: Optional[str] = None


class ItineraryResponse(BaseModel):
    destination: str
    days: int
    itinerary: str



class RecommendRequest(BaseModel):
    budget: Optional[str] = None
    style: Optional[str] = None
    interests: Optional[List[str]] = None
    duration: Optional[str] = None
    season: Optional[str] = None


class RecommendResponse(BaseModel):
    recommendations: str
    preferences: dict


# ============== API Endpoints ==============

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": "Immersive Traveler Companion AI",
        "version": "1.0.0"
    }


@app.post("/agent", response_model=ChatResponse)
async def agent_chat(request: ChatRequest):
    """
    Main chat endpoint for the AI travel agent.
    Handles all travel queries with automatic tool calling.
    """
    try:
        agent = get_agent()
        result = await agent.chat(request.message, request.session_id)
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search", response_model=SearchResponse)
async def web_search(request: SearchRequest):
    """
    Direct web search endpoint using Tavily.
    Use for finding booking websites, travel deals, etc.
    """
    try:
        client = get_tavily_client()
        result = await client.search(request.query, request.max_results)
        return SearchResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))





@app.post("/itinerary", response_model=ItineraryResponse)
async def create_itinerary(request: ItineraryRequest):
    """
    Generate a detailed travel itinerary.
    Uses Gemini to create day-by-day plans.
    """
    try:
        agent = get_agent()
        
        # Generate itinerary via agent
        prompt = f"Generate a detailed {request.days}-day itinerary for {request.destination}"
        if request.preferences:
            prompt += f" with focus on: {request.preferences}"
        
        result = await agent.chat(prompt, session_id=f"itinerary_{request.destination}")
        
        return ItineraryResponse(
            destination=request.destination,
            days=request.days,
            itinerary=result["response"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommend", response_model=RecommendResponse)
async def get_recommendations(request: RecommendRequest):
    """
    Get personalized destination recommendations.
    Based on budget, style, interests, etc.
    """
    try:
        agent = get_agent()
        
        # Build recommendation prompt
        preferences = []
        if request.budget:
            preferences.append(f"budget: {request.budget}")
        if request.style:
            preferences.append(f"style: {request.style}")
        if request.interests:
            preferences.append(f"interests: {', '.join(request.interests)}")
        if request.duration:
            preferences.append(f"duration: {request.duration}")
        if request.season:
            preferences.append(f"season: {request.season}")
        
        pref_str = ", ".join(preferences) if preferences else "no specific preferences"
        prompt = f"Recommend travel destinations based on: {pref_str}"
        
        result = await agent.chat(prompt, session_id="recommendations")
        
        return RecommendResponse(
            recommendations=result["response"],
            preferences={
                "budget": request.budget,
                "style": request.style,
                "interests": request.interests,
                "duration": request.duration,
                "season": request.season
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/session/{session_id}")
async def clear_session(session_id: str):
    """Clear chat history for a session."""
    try:
        agent = get_agent()
        agent.clear_session(session_id)
        return {"status": "cleared", "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))





# ============== Run Server ==============

if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run("main:app", host=host, port=port, reload=True)
