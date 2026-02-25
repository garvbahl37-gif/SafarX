# backend/services/tbo_service.py

"""
TBO Flight API Service
Handles all communication with TBO's flight booking API.

Key Points from TBO Docs:
- Generate token ONCE per day (valid 00:00 AM to 11:59 PM)
- NEVER generate a new token on every search request
- TraceId from search is valid for only 15 minutes
- For LCC flights: go directly to Ticket endpoint
- For Non-LCC flights: Book first, then Ticket
"""

import httpx
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

# ─── Load environment variables directly ─────────────────────
import os
from dotenv import load_dotenv
load_dotenv()

TBO_CLIENT_ID = os.getenv("TBO_CLIENT_ID", "ApiIntegrationNew")
TBO_USERNAME = os.getenv("TBO_USERNAME", "")
TBO_PASSWORD = os.getenv("TBO_PASSWORD", "")
TBO_END_USER_IP_ENV = os.getenv("TBO_END_USER_IP", "")

TBO_AUTH_URL = os.getenv(
    "TBO_AUTH_URL",
    "http://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate"
)
TBO_LOGOUT_URL = os.getenv(
    "TBO_LOGOUT_URL",
    "http://Sharedapi.tektravels.com/SharedData.svc/rest/Logout"
)
TBO_SEARCH_URL = os.getenv(
    "TBO_SEARCH_URL",
    "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search"
)
TBO_BOOK_URL = os.getenv(
    "TBO_BOOK_URL",
    "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Book"
)
TBO_TICKET_URL = os.getenv(
    "TBO_TICKET_URL",
    "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Ticket"
)


# ─── In-Memory Token Cache ────────────────────────────────────
# IMPORTANT: Per TBO docs — generate only ONE token per day
# Token is valid from 00:00 AM to 11:59 PM of the same day
_token_cache = {
    "token_id": None,
    "member_id": None,
    "agency_id": None,
    "date": None,         # date this token was generated (YYYY-MM-DD)
}

# Cache for public IP so we don't fetch it on every request
_public_ip_cache = {
    "ip": None
}


# ─── Helper: Get Public IP ────────────────────────────────────

async def get_end_user_ip() -> str:
    """
    Get the server's public IP address.
    
    TBO requires EndUserIp in every request.
    We auto-detect if not set in .env
    
    Priority:
    1. Value from .env file (TBO_END_USER_IP)
    2. Auto-detected from ipify.org (cached after first call)
    3. Fallback to localhost (not ideal but won't crash)
    """
    # Priority 1: Use manually set IP from .env
    if TBO_END_USER_IP_ENV and TBO_END_USER_IP_ENV.strip():
        return TBO_END_USER_IP_ENV.strip()

    # Priority 2: Use cached IP
    if _public_ip_cache["ip"]:
        return _public_ip_cache["ip"]

    # Priority 3: Auto-detect public IP
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get("https://api.ipify.org")
            ip = response.text.strip()
            _public_ip_cache["ip"] = ip
            logger.info(f"Auto-detected public IP: {ip}")
            return ip
    except Exception as e:
        logger.warning(f"Could not detect public IP: {e}. Using fallback.")
        return "127.0.0.1"  # fallback


# ─── Helper: Check Token Validity ────────────────────────────

def _is_token_valid() -> bool:
    """
    Check if the cached TBO token is still valid for today.
    TBO tokens expire at midnight (00:00) each day.
    """
    if not _token_cache["token_id"]:
        return False
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    if _token_cache["date"] != today:
        logger.info("TBO token expired (new calendar day). Will re-authenticate.")
        return False
    
    return True


# ─── Helper: Map cabin class ─────────────────────────────────

def _map_cabin_class(class_name: str) -> int:
    """
    Map human-readable class name to TBO FlightCabinClass enum.
    1=All, 2=Economy, 3=PremiumEconomy, 4=Business,
    5=PremiumBusiness, 6=First
    """
    class_map = {
        "all": 1,
        "economy": 2,
        "premiumeconomy": 3,
        "business": 4,
        "premiumbusiness": 5,
        "first": 6,
    }
    return class_map.get(class_name.lower().replace(" ", ""), 2)


# ─── Helper: Map trip type ───────────────────────────────────

def _map_trip_type(trip_type: str) -> int:
    """
    Map trip type string to TBO JourneyType enum.
    1=OneWay, 2=Return, 3=MultiStop,
    4=AdvanceSearch, 5=SpecialReturn
    """
    trip_map = {
        "one-way": 1,
        "oneway": 1,
        "round": 2,
        "return": 2,
        "multistop": 3,
    }
    return trip_map.get(trip_type.lower(), 1)


# ─── Helper: Format date for TBO ─────────────────────────────

def _format_date_for_tbo(date_str: str) -> str:
    """
    Convert 'YYYY-MM-DD' to TBO format 'YYYY-MM-DDT00:00:00'
    """
    return f"{date_str}T00:00:00"


# ─── Core: Authenticate ──────────────────────────────────────

async def authenticate() -> dict:
    """
    Authenticate with TBO API and get/return token.
    
    Uses in-memory cache — only makes actual API call
    when token is missing or expired (past midnight).
    
    Returns:
        dict with token_id, member_id, agency_id
    
    Raises:
        Exception if authentication fails
    """
    # Return cached token if still valid for today
    if _is_token_valid():
        return {
            "token_id": _token_cache["token_id"],
            "member_id": _token_cache["member_id"],
            "agency_id": _token_cache["agency_id"],
        }

    logger.info("Calling TBO Authenticate API...")

    end_user_ip = await get_end_user_ip()

    payload = {
        "ClientId": TBO_CLIENT_ID,
        "UserName": TBO_USERNAME,
        "Password": TBO_PASSWORD,
        "EndUserIp": end_user_ip,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            TBO_AUTH_URL,
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()

    data = response.json()

    # TBO Status codes:
    # 0=NotSet, 1=Successful, 2=Failed,
    # 3=IncorrectUsername, 4=IncorrectPassword, 5=PasswordExpired
    status = data.get("Status")
    
    status_messages = {
        0: "Authentication status not set",
        2: "Authentication failed",
        3: "Incorrect TBO username",
        4: "Incorrect TBO password",
        5: "TBO password expired — contact TBO support",
    }

    if status != 1:
        error_msg = data.get("Error", {}).get("ErrorMessage", "Unknown error")
        friendly_msg = status_messages.get(status, error_msg)
        logger.error(f"TBO Auth failed with status {status}: {friendly_msg}")
        raise Exception(f"TBO Authentication Error: {friendly_msg}")

    # Store in cache for the rest of the day
    _token_cache["token_id"] = data["TokenId"]
    _token_cache["member_id"] = data["Member"]["MemberId"]
    _token_cache["agency_id"] = data["Member"]["AgencyId"]
    _token_cache["date"] = datetime.now().strftime("%Y-%m-%d")

    logger.info(
        f"TBO Auth successful | "
        f"MemberId: {_token_cache['member_id']} | "
        f"AgencyId: {_token_cache['agency_id']} | "
        f"Token: {data['TokenId'][:8]}..."
    )

    return {
        "token_id": _token_cache["token_id"],
        "member_id": _token_cache["member_id"],
        "agency_id": _token_cache["agency_id"],
    }


# ─── Core: Search Flights ────────────────────────────────────

async def search_flights(
    origin: str,
    destination: str,
    departure_date: str,
    adult_count: int = 1,
    child_count: int = 0,
    infant_count: int = 0,
    cabin_class: int = 2,
    trip_type: str = "one-way",
    return_date: Optional[str] = None,
    direct_flight: bool = False,
) -> dict:
    """
    Search for available flights via TBO Search API.
    
    Flow:
    1. Get token (cached or fresh)
    2. Get public IP
    3. Build TBO request payload
    4. Call TBO Search endpoint
    5. Clean and return response
    
    IMPORTANT: Save the trace_id from response!
    It's needed for Book/Ticket calls and
    expires in only 15 minutes.
    
    Args:
        origin: IATA code e.g. "DEL"
        destination: IATA code e.g. "BOM"
        departure_date: "YYYY-MM-DD"
        adult_count: number of adults (max 9 total)
        child_count: number of children
        infant_count: number of infants
        cabin_class: 2=Economy, 4=Business, 6=First
        trip_type: "one-way" or "round"
        return_date: "YYYY-MM-DD" (required for round trips)
        direct_flight: filter for direct flights only
    
    Returns:
        dict with trace_id and list of flight results
    """
    auth = await authenticate()
    end_user_ip = await get_end_user_ip()

    # Build segments (journey legs)
    segments = [
        {
            "Origin": origin.upper().strip(),
            "Destination": destination.upper().strip(),
            "FlightCabinClass": cabin_class,
            "PreferredDepartureTime": _format_date_for_tbo(departure_date),
            "PreferredArrivalTime": _format_date_for_tbo(departure_date),
        }
    ]

    # Add return segment for round trips
    if trip_type in ("round", "return") and return_date:
        segments.append({
            "Origin": destination.upper().strip(),
            "Destination": origin.upper().strip(),
            "FlightCabinClass": cabin_class,
            "PreferredDepartureTime": _format_date_for_tbo(return_date),
            "PreferredArrivalTime": _format_date_for_tbo(return_date),
        })

    journey_type = _map_trip_type(trip_type)

    payload = {
        "EndUserIp": end_user_ip,
        "TokenId": auth["token_id"],
        "AdultCount": str(adult_count),
        "ChildCount": str(child_count),
        "InfantCount": str(infant_count),
        "DirectFlight": "true" if direct_flight else "false",
        "OneStopFlight": "false",
        "JourneyType": str(journey_type),
        "PreferredAirlines": None,
        "Segments": segments,
        "Sources": None,
    }

    logger.info(
        f"TBO Search | {origin} → {destination} | "
        f"{departure_date} | Adults: {adult_count} | "
        f"Class: {cabin_class} | Type: {trip_type}"
    )

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            TBO_SEARCH_URL,
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()

    data = response.json()

    # TBO wraps response in "Response" key
    tbo_response = data.get("Response", data)

    # Check for API-level errors
    error = tbo_response.get("Error", {})
    if error.get("ErrorCode", 0) != 0:
        error_msg = error.get("ErrorMessage", "Unknown search error")
        logger.error(f"TBO Search Error: {error_msg}")
        raise Exception(f"Flight search failed: {error_msg}")

    return _format_search_response(tbo_response)


def _format_search_response(tbo_response: dict) -> dict:
    """
    Transform TBO's raw search response into a
    clean format that our frontend can easily consume.
    """
    trace_id = tbo_response.get("TraceId", "")
    raw_results = tbo_response.get("Results", [])

    if not raw_results:
        return {
            "trace_id": trace_id,
            "origin": tbo_response.get("Origin", ""),
            "destination": tbo_response.get("Destination", ""),
            "total_results": 0,
            "flights": [],
        }

    # TBO sometimes returns Results as array of arrays
    # e.g. [[flight1, flight2], [flight3]] for round trips
    # We flatten for one-way, keep structure for round trip
    if raw_results and isinstance(raw_results[0], list):
        flat_results = []
        for group in raw_results:
            flat_results.extend(group)
        raw_results = flat_results

    formatted_flights = []
    for flight in raw_results:
        try:
            formatted = _format_single_flight(flight)
            formatted_flights.append(formatted)
        except Exception as e:
            logger.warning(f"Skipping malformed flight result: {e}")
            continue

    # Sort cheapest first
    formatted_flights.sort(
        key=lambda x: x.get("fare", {}).get("offered_fare", float("inf"))
    )

    return {
        "trace_id": trace_id,
        "origin": tbo_response.get("Origin", ""),
        "destination": tbo_response.get("Destination", ""),
        "total_results": len(formatted_flights),
        "flights": formatted_flights,
    }


def _format_single_flight(flight: dict) -> dict:
    """
    Extract and clean a single flight result from TBO response.
    Only picks fields the frontend actually needs.
    """
    fare = flight.get("Fare", {})
    segments = flight.get("Segments", [[]])

    # Segments come as [[seg1, seg2], [seg3]] nested structure
    segment_list = (
        segments[0]
        if segments and isinstance(segments[0], list)
        else segments
    )

    first_seg = segment_list[0] if segment_list else {}
    last_seg = segment_list[-1] if segment_list else {}

    airline = first_seg.get("Airline", {})
    origin_airport = first_seg.get("Origin", {}).get("Airport", {})
    dest_airport = last_seg.get("Destination", {}).get("Airport", {})

    return {
        "result_index": flight.get("ResultIndex", ""),
        "source": flight.get("Source", ""),
        "is_lcc": flight.get("IsLCC", False),
        "is_refundable": flight.get("IsRefundable", False),
        "airline_remarks": flight.get("AirlineRemarks", ""),
        "airline": {
            "code": airline.get("AirlineCode", ""),
            "name": airline.get("AirlineName", ""),
            "flight_number": airline.get("FlightNumber", ""),
            "fare_class": airline.get("FareClass", ""),
            "operating_carrier": airline.get("OperatingCarrier", ""),
        },
        "origin": {
            "airport_code": origin_airport.get("AirportCode", ""),
            "airport_name": origin_airport.get("AirportName", ""),
            "city_name": origin_airport.get("CityName", ""),
            "city_code": origin_airport.get("CityCode", ""),
            "country_name": origin_airport.get("CountryName", ""),
            "terminal": origin_airport.get("Terminal", ""),
            "departure_time": first_seg.get("DepTime", ""),
        },
        "destination": {
            "airport_code": dest_airport.get("AirportCode", ""),
            "airport_name": dest_airport.get("AirportName", ""),
            "city_name": dest_airport.get("CityName", ""),
            "city_code": dest_airport.get("CityCode", ""),
            "country_name": dest_airport.get("CountryName", ""),
            "terminal": dest_airport.get("Terminal", ""),
            "arrival_time": last_seg.get("ArrTime", ""),
        },
        "duration": first_seg.get("Duration", 0),
        "accumulated_duration": first_seg.get("AccumulatedDuration", 0),
        "stop_count": max(0, len(segment_list) - 1),
        "fare": {
            "currency": fare.get("Currency", "INR"),
            "base_fare": fare.get("BaseFare", 0),
            "tax": fare.get("Tax", 0),
            "yq_tax": fare.get("YQTax", 0),
            "offered_fare": fare.get("OfferedFare", 0),
            "published_fare": fare.get("PublishedFare", 0),
            "other_charges": fare.get("OtherCharges", 0),
            "commission_earned": fare.get("CommissionEarned", 0),
        },
        "fare_breakdown": flight.get("FareBreakdown", []),
        "segments": segment_list,
        "last_ticket_date": flight.get("LastTicketDate", ""),
    }


# ─── Core: Book Flight (Non-LCC only) ────────────────────────

async def book_flight(
    result_index: str,
    trace_id: str,
    passengers: list,
) -> dict:
    """
    Book a Non-LCC flight to get a PNR (hold booking).
    
    IMPORTANT:
    - Only for Non-LCC flights (IsLCC = False in search results)
    - For LCC flights, call ticket_flight_lcc() directly
    - If IsPriceChanged=True in response, re-send with updated fare
    - trace_id must be used within 15 minutes of search
    
    Args:
        result_index: from search response
        trace_id: from search response (15 min expiry!)
        passengers: list of passenger dicts
    
    Returns:
        dict with booking_id, pnr, and fare details
    """
    auth = await authenticate()
    end_user_ip = await get_end_user_ip()

    # Format passengers for TBO
    tbo_passengers = _format_passengers_for_tbo(passengers)

    payload = {
        "EndUserIp": end_user_ip,
        "TokenId": auth["token_id"],
        "TraceId": trace_id,
        "ResultIndex": result_index,
        "Passengers": tbo_passengers,
    }

    logger.info(
        f"TBO Book | ResultIndex: {result_index} | "
        f"Passengers: {len(tbo_passengers)}"
    )

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            TBO_BOOK_URL,
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()

    data = response.json()
    tbo_response = data.get("Response", data)

    is_price_changed = tbo_response.get("IsPriceChanged", False)
    is_time_changed = tbo_response.get("IsTimeChanged", False)

    if is_price_changed:
        logger.warning("TBO Book: Price has changed! Frontend must confirm new price.")
    if is_time_changed:
        logger.warning("TBO Book: Flight time has changed! Frontend must inform user.")

    itinerary = tbo_response.get("FlightItinerary", {})

    return {
        "success": True,
        "is_price_changed": is_price_changed,
        "is_time_changed": is_time_changed,
        "booking_id": itinerary.get("BookingId"),
        "pnr": itinerary.get("PNR"),
        "is_lcc": itinerary.get("IsLCC", False),
        "status": tbo_response.get("Status"),
        "fare": itinerary.get("Fare", {}),
        "passengers": itinerary.get("Passenger", []),
        "segments": itinerary.get("Segments", []),
        "ssr_denied": tbo_response.get("SSRDenied", ""),
        "ssr_message": tbo_response.get("SSRMessage", ""),
    }


# ─── Core: Ticket LCC Flights ────────────────────────────────

async def ticket_flight_lcc(
    result_index: str,
    trace_id: str,
    passengers: list,
    is_price_change_accepted: bool = False,
) -> dict:
    """
    Issue ticket for LCC (Low Cost Carrier) flights directly.
    No prior Book call needed for LCC.
    
    LCC examples: SpiceJet, IndiGo, GoAir, AirAsia, etc.
    Non-LCC examples: Air India, Jet Airways (via GDS)
    
    Args:
        result_index: from search response
        trace_id: from search response (15 min expiry!)
        passengers: list of passenger dicts with fare
        is_price_change_accepted: set True if user confirmed price change
    
    Returns:
        dict with pnr, booking_id, ticket_status
    """
    auth = await authenticate()
    end_user_ip = await get_end_user_ip()

    tbo_passengers = _format_passengers_for_tbo(passengers)

    payload = {
        "EndUserIp": end_user_ip,
        "TokenId": auth["token_id"],
        "TraceId": trace_id,
        "ResultIndex": result_index,
        "Passengers": tbo_passengers,
        "IsPriceChangeAccepted": is_price_change_accepted,
    }

    logger.info(f"TBO Ticket LCC | ResultIndex: {result_index}")

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            TBO_TICKET_URL,
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()

    data = response.json()
    tbo_response = data.get("Response", data)

    # TicketStatus: 0=Failed, 1=Successful, 2=NotSaved,
    # 3=NotCreated, 5=InProgress, 8=PriceChanged, 9=OtherError
    ticket_status = tbo_response.get("TicketStatus")

    if ticket_status == 8:
        logger.warning("LCC Ticket: Price changed — user must reconfirm")
    elif ticket_status not in (1, 5):
        logger.error(f"LCC Ticket failed with status: {ticket_status}")

    return {
        "success": ticket_status in (1, 5),
        "pnr": tbo_response.get("PNR"),
        "booking_id": tbo_response.get("BookingId"),
        "is_price_changed": tbo_response.get("IsPriceChanged", False),
        "is_time_changed": tbo_response.get("IsTimeChanged", False),
        "ticket_status": ticket_status,
        "message": tbo_response.get("Message", ""),
        "flight_itinerary": tbo_response.get("FlightItinerary", {}),
    }


# ─── Core: Ticket Non-LCC Flights ────────────────────────────

async def ticket_flight_non_lcc(
    trace_id: str,
    pnr: str,
    booking_id: int,
    is_price_change_accepted: bool = False,
) -> dict:
    """
    Issue ticket for Non-LCC flights (after Book call).
    
    Must be called AFTER book_flight() for Non-LCC airlines.
    Uses PNR and BookingId from book_flight() response.
    
    Args:
        trace_id: from original search response
        pnr: from book_flight() response
        booking_id: from book_flight() response
        is_price_change_accepted: True if user confirmed price change
    
    Returns:
        dict with ticket details
    """
    auth = await authenticate()
    end_user_ip = await get_end_user_ip()

    payload = {
        "EndUserIp": end_user_ip,
        "TokenId": auth["token_id"],
        "TraceId": trace_id,
        "PNR": pnr,
        "BookingId": booking_id,
        "IsPriceChangeAccepted": is_price_change_accepted,
    }

    logger.info(f"TBO Ticket Non-LCC | PNR: {pnr} | BookingId: {booking_id}")

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            TBO_TICKET_URL,
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()

    data = response.json()
    tbo_response = data.get("Response", data)

    ticket_status = tbo_response.get("TicketStatus")

    return {
        "success": ticket_status in (1, 5),
        "pnr": tbo_response.get("PNR"),
        "booking_id": tbo_response.get("BookingId"),
        "is_price_changed": tbo_response.get("IsPriceChanged", False),
        "ticket_status": ticket_status,
        "message": tbo_response.get("Message", ""),
        "flight_itinerary": tbo_response.get("FlightItinerary", {}),
    }


# ─── Helper: Format Passengers ───────────────────────────────

def _format_passengers_for_tbo(passengers: list) -> list:
    """
    Convert passenger data from our API format to TBO format.
    Handles all required and optional fields.
    """
    tbo_passengers = []

    for pax in passengers:
        tbo_pax = {
            "Title": pax.get("title", "Mr"),
            "FirstName": pax.get("first_name", ""),
            "LastName": pax.get("last_name", ""),
            "PaxType": str(pax.get("pax_type", 1)),  # 1=Adult, 2=Child, 3=Infant
            "DateOfBirth": pax.get("date_of_birth", ""),
            "Gender": str(pax.get("gender", 1)),     # 1=Male, 2=Female
            "PassportNo": pax.get("passport_no", ""),
            "PassportExpiry": pax.get("passport_expiry", ""),
            "AddressLine1": pax.get("address_line1", ""),
            "AddressLine2": pax.get("address_line2", ""),
            "City": pax.get("city", ""),
            "CountryCode": pax.get("country_code", "IN"),
            "CountryName": pax.get("country_name", "India"),
            "ContactNo": pax.get("contact_no", ""),
            "Email": pax.get("email", ""),
            "IsLeadPax": pax.get("is_lead_pax", False),
            "Nationality": pax.get("nationality", "IN"),
            # GST fields (mandatory in API but blank for B2C customers)
            "GSTCompanyAddress": pax.get("gst_company_address", ""),
            "GSTCompanyContactNumber": pax.get("gst_company_contact", ""),
            "GSTCompanyName": pax.get("gst_company_name", ""),
            "GSTNumber": pax.get("gst_number", ""),
            "GSTCompanyEmail": pax.get("gst_company_email", ""),
            "Fare": {
                "BaseFare": pax.get("fare", {}).get("base_fare", 0),
                "Tax": pax.get("fare", {}).get("tax", 0),
                "TransactionFee": pax.get("fare", {}).get("transaction_fee", 0),
                "YQTax": pax.get("fare", {}).get("yq_tax", 0),
                "AdditionalTxnFeeOfrd": 0,
                "AdditionalTxnFeePub": 0,
                "AirTransFee": 0,
            },
        }
        tbo_passengers.append(tbo_pax)

    return tbo_passengers