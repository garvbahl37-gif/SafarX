from pydantic import BaseModel
from typing import Optional, List

class SearchLocationRequest(BaseModel):
    query: str

class SearchHotelsRequest(BaseModel):
    geoId: str
    checkIn: str
    checkOut: str
    pageNumber: Optional[int] = 1
    sort: Optional[str] = None
    adults: Optional[int] = 0
    rooms: Optional[int] = 0
    currencyCode: Optional[str] = "USD"
    rating: Optional[int] = 0
    priceMin: Optional[int] = 0
    priceMax: Optional[int] = 0

class SearchHotelsByLocationRequest(BaseModel):
    latitude: str
    longitude: str
    checkIn: str
    checkOut: str
    pageNumber: Optional[int] = 1
    sort: Optional[str] = None
    adults: Optional[int] = 0
    rooms: Optional[int] = 0
    currencyCode: Optional[str] = "USD"

class HotelDetailsRequest(BaseModel):
    id: str
    checkIn: str
    checkOut: str
    adults: Optional[int] = 0
    rooms: Optional[int] = 0
    currency: Optional[str] = "USD"