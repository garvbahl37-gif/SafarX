from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ─── Auth Models ─────────────────────────────────────────────

class TokenCache(BaseModel):
    """
    Stores the token in memory so we don't
    call authenticate on every search request.
    Token is valid from 00:00 AM to 11:59 PM same day.
    """
    token_id: str
    member_id: int
    agency_id: int
    generated_date: str  # store as YYYY-MM-DD


# ─── Search Request Models ────────────────────────────────────

class FlightSegment(BaseModel):
    """One segment of the journey (origin → destination)"""
    origin: str                  # e.g. "DEL"
    destination: str             # e.g. "BOM"
    departure_date: str          # e.g. "2024-08-10"
    cabin_class: int = 2         # 1=All 2=Economy 3=PremiumEconomy 4=Business 5=PremiumBusiness 6=First


class FlightSearchRequest(BaseModel):
    """
    What the frontend sends to our backend
    (simplified, human-friendly format)
    """
    origin: str                              # e.g. "DEL"
    destination: str                         # e.g. "DXB"
    departure_date: str                      # e.g. "2024-08-10"
    return_date: Optional[str] = None        # only for round trips
    adult_count: int = 1
    child_count: int = 0
    infant_count: int = 0
    cabin_class: int = 2                     # Economy default
    trip_type: str = "one-way"               # "one-way" | "round"
    direct_flight: bool = False


# ─── Booking Request Models ───────────────────────────────────

class PassengerFare(BaseModel):
    base_fare: float
    tax: float
    transaction_fee: float = 0
    yq_tax: float = 0
    additional_txn_fee_ofrd: float = 0
    additional_txn_fee_pub: float = 0
    air_trans_fee: float = 0


class PassengerDetail(BaseModel):
    title: str                    # "Mr", "Mrs", "Miss", "Mstr"
    first_name: str
    last_name: str
    pax_type: int                 # 1=Adult, 2=Child, 3=Infant
    gender: int                   # 1=Male, 2=Female
    date_of_birth: Optional[str] = None
    passport_no: Optional[str] = None
    passport_expiry: Optional[str] = None
    address_line1: str
    city: str
    country_code: str
    country_name: str
    contact_no: str
    email: str
    is_lead_pax: bool = False
    nationality: str = "IN"
    fare: PassengerFare


class FlightBookRequest(BaseModel):
    """What the frontend sends to book a flight"""
    result_index: str            # from search results
    trace_id: str                # from search response (valid 15 mins)
    passengers: List[PassengerDetail]


class FlightTicketRequest(BaseModel):
    """What the frontend sends to ticket (for LCC)"""
    result_index: str
    trace_id: str
    passengers: List[PassengerDetail]


class NonLCCTicketRequest(BaseModel):
    """For Non-LCC (already booked via Book endpoint)"""
    trace_id: str
    pnr: str
    booking_id: int
    is_price_change_accepted: bool = False