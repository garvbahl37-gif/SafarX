# backend/routers/flights.py

"""
Flight booking API routes.
These get mounted into the existing FastAPI app in main.py.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from services import tbo_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/flights",
    tags=["Flight Booking"],
)


# ─── Request / Response Models ────────────────────────────────

class FlightSearchRequest(BaseModel):
    origin: str = Field(..., min_length=2, max_length=3, example="DEL")
    destination: str = Field(..., min_length=2, max_length=3, example="DXB")
    departure_date: str = Field(..., example="2024-08-10")
    return_date: Optional[str] = Field(None, example="2024-08-17")
    adult_count: int = Field(1, ge=1, le=9)
    child_count: int = Field(0, ge=0, le=9)
    infant_count: int = Field(0, ge=0, le=9)
    cabin_class: int = Field(2, ge=1, le=6)
    trip_type: str = Field("one-way", example="one-way")
    direct_flight: bool = False

    class Config:
        json_schema_extra = {
            "example": {
                "origin": "DEL",
                "destination": "BOM",
                "departure_date": "2024-08-10",
                "adult_count": 1,
                "child_count": 0,
                "infant_count": 0,
                "cabin_class": 2,
                "trip_type": "one-way",
                "direct_flight": False
            }
        }


class PassengerFareModel(BaseModel):
    base_fare: float = 0
    tax: float = 0
    transaction_fee: float = 0
    yq_tax: float = 0


class PassengerModel(BaseModel):
    title: str = "Mr"
    first_name: str
    last_name: str
    pax_type: int = 1           # 1=Adult, 2=Child, 3=Infant
    gender: int = 1             # 1=Male, 2=Female
    date_of_birth: Optional[str] = None
    passport_no: Optional[str] = None
    passport_expiry: Optional[str] = None
    address_line1: str = ""
    city: str = ""
    country_code: str = "IN"
    country_name: str = "India"
    contact_no: str = ""
    email: str = ""
    is_lead_pax: bool = False
    nationality: str = "IN"
    fare: PassengerFareModel = PassengerFareModel()


class FlightBookRequest(BaseModel):
    result_index: str
    trace_id: str
    passengers: List[PassengerModel]


class FlightTicketLCCRequest(BaseModel):
    result_index: str
    trace_id: str
    passengers: List[PassengerModel]
    is_price_change_accepted: bool = False


class FlightTicketNonLCCRequest(BaseModel):
    trace_id: str
    pnr: str
    booking_id: int
    is_price_change_accepted: bool = False


# ─── Routes ──────────────────────────────────────────────────

@router.post("/search")
async def search_flights(request: FlightSearchRequest):
    """
    Search available flights via TBO API.
    
    - Returns list of flights sorted cheapest first
    - Save the `trace_id` from response for booking
    - trace_id expires in 15 minutes!
    - Cabin class: 2=Economy, 4=Business, 6=First
    """
    try:
        results = await tbo_service.search_flights(
            origin=request.origin,
            destination=request.destination,
            departure_date=request.departure_date,
            adult_count=request.adult_count,
            child_count=request.child_count,
            infant_count=request.infant_count,
            cabin_class=request.cabin_class,
            trip_type=request.trip_type,
            return_date=request.return_date,
            direct_flight=request.direct_flight,
        )
        return {"success": True, "data": results}

    except Exception as e:
        logger.error(f"Flight search failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/book")
async def book_flight(request: FlightBookRequest):
    """
    Book a Non-LCC flight (creates PNR / hold).
    
    - Only for Non-LCC flights (check IsLCC field in search results)
    - For LCC flights use /flights/ticket/lcc instead
    - If IsPriceChanged=true → show user new price → re-call with updated fare
    - trace_id must be used within 15 minutes of search!
    """
    try:
        # Convert Pydantic models to dicts for tbo_service
        passengers_data = [p.model_dump() for p in request.passengers]

        result = await tbo_service.book_flight(
            result_index=request.result_index,
            trace_id=request.trace_id,
            passengers=passengers_data,
        )
        return {"success": True, "data": result}

    except Exception as e:
        logger.error(f"Flight booking failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/ticket/lcc")
async def ticket_lcc(request: FlightTicketLCCRequest):
    """
    Directly issue ticket for LCC flights (no prior Book needed).
    
    LCC airlines: SpiceJet, IndiGo, GoAir, AirAsia, FlyDubai, etc.
    Check IsLCC=true in search results to identify LCC flights.
    """
    try:
        passengers_data = [p.model_dump() for p in request.passengers]

        result = await tbo_service.ticket_flight_lcc(
            result_index=request.result_index,
            trace_id=request.trace_id,
            passengers=passengers_data,
            is_price_change_accepted=request.is_price_change_accepted,
        )
        return {"success": True, "data": result}

    except Exception as e:
        logger.error(f"LCC ticket failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/ticket/non-lcc")
async def ticket_non_lcc(request: FlightTicketNonLCCRequest):
    """
    Issue ticket for Non-LCC flight (after /book call).
    
    Requires PNR and BookingId from the /book response.
    """
    try:
        result = await tbo_service.ticket_flight_non_lcc(
            trace_id=request.trace_id,
            pnr=request.pnr,
            booking_id=request.booking_id,
            is_price_change_accepted=request.is_price_change_accepted,
        )
        return {"success": True, "data": result}

    except Exception as e:
        logger.error(f"Non-LCC ticket failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/auth-status")
async def check_auth_status():
    """
    Check if TBO authentication token is valid.
    Useful for debugging — confirms credentials are working.
    """
    try:
        auth = await tbo_service.authenticate()
        ip = await tbo_service.get_end_user_ip()
        return {
            "success": True,
            "authenticated": True,
            "member_id": auth["member_id"],
            "agency_id": auth["agency_id"],
            "server_ip": ip,
            "token_preview": auth["token_id"][:8] + "..."
        }
    except Exception as e:
        return {
            "success": False,
            "authenticated": False,
            "error": str(e)
        }