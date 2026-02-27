from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from services.hotel_service import (
    search_location,
    get_hotels_filter,
    search_hotels,
    search_hotels_by_location,
    get_hotel_details
)

router = APIRouter(prefix="/api/hotels", tags=["hotels"])


@router.get("/search-location")
async def api_search_location(query: str = Query(..., description="Location name")):
    """Search for hotel locations."""
    if not query or len(query.strip()) < 2:
        raise HTTPException(status_code=400, detail="Query must be at least 2 characters")
    
    result = search_location(query.strip())
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Search failed"))
    
    return result


@router.get("/filters")
async def api_get_filters(
    geoId: str = Query(...),
    checkIn: str = Query(...),
    checkOut: str = Query(...)
):
    """Get hotel filters for a location."""
    result = get_hotels_filter(geoId, checkIn, checkOut)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to get filters"))
    
    return result


@router.get("/search")
async def api_search_hotels(
    geoId: str = Query(...),
    checkIn: str = Query(...),
    checkOut: str = Query(...),
    pageNumber: int = Query(default=1),
    sort: Optional[str] = Query(default=None),
    adults: int = Query(default=0),
    rooms: int = Query(default=0),
    currencyCode: str = Query(default="USD"),
    rating: int = Query(default=0),
    priceMin: int = Query(default=0),
    priceMax: int = Query(default=0)
):
    """Search hotels by location ID."""
    result = search_hotels(
        geoId=geoId,
        checkIn=checkIn,
        checkOut=checkOut,
        pageNumber=pageNumber,
        sort=sort,
        adults=adults,
        rooms=rooms,
        currencyCode=currencyCode,
        rating=rating,
        priceMin=priceMin,
        priceMax=priceMax
    )
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Search failed"))
    
    return result


@router.get("/search-by-location")
async def api_search_by_location(
    latitude: str = Query(...),
    longitude: str = Query(...),
    checkIn: str = Query(...),
    checkOut: str = Query(...),
    pageNumber: int = Query(default=1),
    sort: Optional[str] = Query(default=None),
    adults: int = Query(default=0),
    rooms: int = Query(default=0),
    currencyCode: str = Query(default="USD")
):
    """Search hotels by coordinates."""
    result = search_hotels_by_location(
        latitude=latitude,
        longitude=longitude,
        checkIn=checkIn,
        checkOut=checkOut,
        pageNumber=pageNumber,
        sort=sort,
        adults=adults,
        rooms=rooms,
        currencyCode=currencyCode
    )
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Search failed"))
    
    return result


@router.get("/details")
async def api_get_hotel_details(
    id: str = Query(...),
    checkIn: str = Query(...),
    checkOut: str = Query(...),
    adults: int = Query(default=0),
    rooms: int = Query(default=0),
    currency: str = Query(default="USD")
):
    """Get details for a specific hotel."""
    result = get_hotel_details(
        hotel_id=id,
        checkIn=checkIn,
        checkOut=checkOut,
        adults=adults,
        rooms=rooms,
        currency=currency
    )
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to get details"))
    
    return result