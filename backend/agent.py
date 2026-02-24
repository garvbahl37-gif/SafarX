"""
Gemini-powered Travel AI Agent with tool calling capabilities.
"""

import os
import json
from typing import Optional
import google.generativeai as genai
from dotenv import load_dotenv

from prompts import SYSTEM_PROMPT, ITINERARY_PROMPT, RECOMMENDATION_PROMPT
from tools import (
    search_web,
    generate_itinerary,
    recommend_destinations,
    TOOL_DEFINITIONS
)


load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


class TravelAgent:
    """
    Immersive Traveler Companion AI Agent powered by Gemini.
    Handles travel queries with tool calling for VR, search, and recommendations.
    """
    
    def __init__(self):
        self.model = genai.GenerativeModel(
            model_name="gemini-3-flash-preview",
            system_instruction=SYSTEM_PROMPT,
            tools=self._get_tools()
        )
        self.chat_sessions = {}  # Store chat history per session
    
    def _get_tools(self):
        """Define tools for Gemini function calling."""
        return [
            genai.protos.Tool(
                function_declarations=[
                    genai.protos.FunctionDeclaration(
                        name="search_web",
                        description="Search the web for travel information, booking websites, flight prices, hotel deals. Use when users ask about booking or need real-time info.",
                        parameters=genai.protos.Schema(
                            type=genai.protos.Type.OBJECT,
                            properties={
                                "query": genai.protos.Schema(
                                    type=genai.protos.Type.STRING,
                                    description="Search query for travel information"
                                )
                            },
                            required=["query"]
                        )
                    ),

                    genai.protos.FunctionDeclaration(
                        name="generate_itinerary",
                        description="Generate a detailed day-by-day travel itinerary. Use when users want to plan a trip.",
                        parameters=genai.protos.Schema(
                            type=genai.protos.Type.OBJECT,
                            properties={
                                "destination": genai.protos.Schema(
                                    type=genai.protos.Type.STRING,
                                    description="Travel destination"
                                ),
                                "days": genai.protos.Schema(
                                    type=genai.protos.Type.INTEGER,
                                    description="Number of days"
                                ),
                                "preferences": genai.protos.Schema(
                                    type=genai.protos.Type.STRING,
                                    description="Travel preferences"
                                )
                            },
                            required=["destination", "days"]
                        )
                    ),
                    genai.protos.FunctionDeclaration(
                        name="recommend_destinations",
                        description="Recommend destinations based on preferences. Use when users describe their ideal trip.",
                        parameters=genai.protos.Schema(
                            type=genai.protos.Type.OBJECT,
                            properties={
                                "budget": genai.protos.Schema(
                                    type=genai.protos.Type.STRING,
                                    description="Budget: 'budget', 'moderate', 'luxury'"
                                ),
                                "style": genai.protos.Schema(
                                    type=genai.protos.Type.STRING,
                                    description="Style: 'adventure', 'relaxation', 'cultural'"
                                ),
                                "interests": genai.protos.Schema(
                                    type=genai.protos.Type.STRING,
                                    description="Interests like beaches, mountains, food"
                                )
                            },
                            required=[]
                        )
                    )
                ]
            )
        ]
    
    def get_or_create_session(self, session_id: str):
        """Get existing chat session or create new one."""
        if session_id not in self.chat_sessions:
            self.chat_sessions[session_id] = self.model.start_chat(history=[])
        return self.chat_sessions[session_id]
    
    async def _execute_tool(self, tool_name: str, tool_args: dict) -> dict:
        """Execute a tool and return results."""
        if tool_name == "search_web":
            return await search_web(tool_args.get("query", ""))

        elif tool_name == "generate_itinerary":
            return generate_itinerary(
                tool_args.get("destination", ""),
                tool_args.get("days", 3),
                tool_args.get("preferences")
            )
        elif tool_name == "recommend_destinations":
            return recommend_destinations(
                budget=tool_args.get("budget"),
                style=tool_args.get("style"),
                interests=tool_args.get("interests", "").split(",") if tool_args.get("interests") else None
            )
        return {"error": f"Unknown tool: {tool_name}"}
    
    async def chat(self, message: str, session_id: str = "default") -> dict:
        """
        Process a chat message and return agent response.
        
        Args:
            message: User message
            session_id: Session ID for chat history
            
        Returns:
            Dictionary with response text, tool calls, and metadata
        """
        chat = self.get_or_create_session(session_id)
        
        try:
            # Send message to Gemini
            response = chat.send_message(message)
            
            result = {
                "response": "",
                "tool_calls": [],
                "search_results": None,
                "itinerary": None,
                "recommendations": None

            }
            
            # Process response parts
            for part in response.parts:
                if hasattr(part, 'text') and part.text:
                    result["response"] += part.text
                
                if hasattr(part, 'function_call') and part.function_call:
                    fc = part.function_call
                    tool_name = fc.name
                    tool_args = dict(fc.args)
                    
                    # Execute tool
                    tool_result = await self._execute_tool(tool_name, tool_args)
                    
                    result["tool_calls"].append({
                        "name": tool_name,
                        "args": tool_args,
                        "result": tool_result
                    })
                    
                    # Categorize results
                    if tool_name == "search_web":
                        result["search_results"] = tool_result
                    elif tool_name == "generate_itinerary":
                        result["itinerary"] = tool_result
                    elif tool_name == "recommend_destinations":
                        result["recommendations"] = tool_result
                    
                    # Send tool result back to model for final response

                    function_response = genai.protos.Part(
                        function_response=genai.protos.FunctionResponse(
                            name=tool_name,
                            response={"result": json.dumps(tool_result)}
                        )
                    )
                    
                    follow_up = chat.send_message(function_response)
                    for fp in follow_up.parts:
                        if hasattr(fp, 'text') and fp.text:
                            result["response"] += "\n\n" + fp.text
            
            return result
            
        except Exception as e:
            return {
                "response": f"I apologize, but I encountered an error: {str(e)}. Please try again.",
                "tool_calls": [],
                "error": str(e)
            }
    
    def clear_session(self, session_id: str):
        """Clear chat history for a session."""
        if session_id in self.chat_sessions:
            del self.chat_sessions[session_id]


# Global agent instance
_agent = None


def get_agent() -> TravelAgent:
    """Get or create agent singleton."""
    global _agent
    if _agent is None:
        _agent = TravelAgent()
    return _agent
