"""
Tavily API Client for web search functionality.
Used for finding booking websites, travel deals, and real-time travel information.
"""

import os
from tavily import TavilyClient
from dotenv import load_dotenv

load_dotenv()


class TavilySearchClient:
    """Client for Tavily web search API."""
    
    def __init__(self):
        api_key = os.getenv("TAVILY_API_KEY")
        if not api_key:
            raise ValueError("TAVILY_API_KEY environment variable is not set")
        self.client = TavilyClient(api_key=api_key)
    
    async def search(self, query: str, max_results: int = 5) -> dict:
        """
        Perform a web search using Tavily API.
        
        Args:
            query: Search query string
            max_results: Maximum number of results to return
            
        Returns:
            Dictionary containing search results with URLs and summaries
        """
        try:
            # Add travel context to improve results
            enhanced_query = f"travel booking {query}"
            
            response = self.client.search(
                query=enhanced_query,
                search_depth="advanced",
                max_results=max_results,
                include_domains=[
                    "booking.com", "expedia.com", "skyscanner.com",
                    "kayak.com", "makemytrip.com", "goibibo.com",
                    "tripadvisor.com", "airbnb.com", "hotels.com",
                    "agoda.com", "cleartrip.com", "yatra.com"
                ]
            )
            
            results = []
            for result in response.get("results", []):
                results.append({
                    "title": result.get("title", ""),
                    "url": result.get("url", ""),
                    "content": result.get("content", "")[:300],
                    "score": result.get("score", 0)
                })
            
            return {
                "query": query,
                "results": results,
                "answer": response.get("answer", "")
            }
            
        except Exception as e:
            return {
                "query": query,
                "results": [],
                "error": str(e)
            }
    
    async def search_flights(self, origin: str, destination: str) -> dict:
        """Search for flight booking options."""
        query = f"best flight tickets from {origin} to {destination} cheap deals"
        return await self.search(query)
    
    async def search_hotels(self, destination: str, budget: str = "") -> dict:
        """Search for hotel booking options."""
        query = f"best hotels in {destination} {budget} booking"
        return await self.search(query)
    
    async def search_activities(self, destination: str) -> dict:
        """Search for activities and experiences."""
        query = f"best things to do activities experiences in {destination}"
        return await self.search(query)


# Singleton instance
_client = None


def get_tavily_client() -> TavilySearchClient:
    """Get or create Tavily client singleton."""
    global _client
    if _client is None:
        _client = TavilySearchClient()
    return _client
