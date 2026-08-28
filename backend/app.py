"""
SafarX Agent backend.

TBO is gone. Chat runs on Groq, flights and hotels on Amadeus's free
Self-Service tier, trains on a free RapidAPI endpoint. Every provider is
optional: when a key is missing the endpoint says so plainly instead of
throwing, so the frontend keeps working with a useful message.
"""

import os
import time
from typing import Any, Dict, List, Optional

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

AMADEUS_HOST = os.getenv("AMADEUS_HOST", "https://test.api.amadeus.com")

# Booking.com, Airbnb and IRCTC all run on one RapidAPI subscription key.
BOOKING_HOST = "booking-com15.p.rapidapi.com"
AIRBNB_HOST = "airbnb19.p.rapidapi.com"
IRCTC_HOST = "indian-railway-irctc.p.rapidapi.com"


def rapid_headers(host: str) -> Dict[str, str]:
    return {"x-rapidapi-key": os.getenv("RAPIDAPI_KEY", ""), "x-rapidapi-host": host}

SYSTEM_PROMPT = """You are SafarX, a travel companion for Incredible India.

You help travellers plan trips across India: itineraries, heritage sites,
seasons, transport, and what a day realistically costs.

Rules:
- India only. If asked about anywhere else, say SafarX covers India and offer
  the closest Indian equivalent.
- Money is always in rupees, written like Rs 4,500.
- Be specific: real places, real months, real travel times.
- Lead with the answer. Keep it short and scannable.
- If unsure of a fact such as an entry fee or an opening time, say so rather
  than inventing it.
"""

app = FastAPI(title="SafarX Agent", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Amadeus token, cached until shortly before it expires ──────────────
_token: Dict[str, Any] = {"value": None, "expires": 0.0}


async def amadeus_token(client: httpx.AsyncClient) -> Optional[str]:
    cid = os.getenv("AMADEUS_CLIENT_ID")
    secret = os.getenv("AMADEUS_CLIENT_SECRET")
    if not (cid and secret):
        return None
    if _token["value"] and time.time() < _token["expires"]:
        return _token["value"]

    r = await client.post(
        f"{AMADEUS_HOST}/v1/security/oauth2/token",
        data={
            "grant_type": "client_credentials",
            "client_id": cid,
            "client_secret": secret,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=30,
    )
    if r.status_code != 200:
        return None
    body = r.json()
    _token["value"] = body.get("access_token")
    # refresh a minute early so a request never races the expiry
    _token["expires"] = time.time() + max(body.get("expires_in", 1799) - 60, 60)
    return _token["value"]


# ── Models ─────────────────────────────────────────────────────────────
class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    temperature: float = 0.6


class FlightRequest(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    adult_count: int = 1
    child_count: int = 0
    infant_count: int = 0
    cabin_class: int = 2          # kept for frontend compatibility
    trip_type: str = "one-way"
    direct_flight: bool = False


class HotelRequest(BaseModel):
    city_code: Optional[str] = None
    city: Optional[str] = None
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    adults: int = 2
    radius_km: int = Field(default=10, ge=1, le=50)


CABIN = {2: "ECONOMY", 3: "PREMIUM_ECONOMY", 4: "BUSINESS", 6: "FIRST"}


# ── Health ─────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "service": "SafarX Agent",
        "version": "2.0.0",
        "providers": {
            "chat": "groq" if os.getenv("GROQ_API_KEY") else "not configured",
            "flights": "amadeus"
            if os.getenv("AMADEUS_CLIENT_ID")
            else "not configured",
            "hotels": "amadeus"
            if os.getenv("AMADEUS_CLIENT_ID")
            else "not configured",
            "stays": "booking.com + airbnb"
            if os.getenv("RAPIDAPI_KEY")
            else "not configured",
            "trains": "irctc"
            if os.getenv("RAPIDAPI_KEY")
            else "not configured",
        },
    }


# ── Chat ───────────────────────────────────────────────────────────────
@app.post("/chat")
async def chat(req: ChatRequest):
    key = os.getenv("GROQ_API_KEY")
    if not key:
        return {
            "success": False,
            "error": "The agent is not configured yet — GROQ_API_KEY is missing.",
        }

    payload = {
        "model": GROQ_MODEL,
        "temperature": req.temperature,
        "max_tokens": 1200,
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}]
        + [m.model_dump() for m in req.messages],
    }

    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(
            GROQ_URL,
            json=payload,
            headers={"Authorization": f"Bearer {key}"},
        )
        if r.status_code != 200:
            return {
                "success": False,
                "error": "The model could not answer that. Try again in a moment.",
                "detail": r.text[:300],
            }
        data = r.json()
        return {
            "success": True,
            "reply": data["choices"][0]["message"]["content"],
            "model": data.get("model", GROQ_MODEL),
        }


# ── Flights ────────────────────────────────────────────────────────────
@app.post("/flights/search")
async def search_flights(req: FlightRequest):
    """Amadeus flight offers, shaped to the response the frontend already reads."""
    async with httpx.AsyncClient(timeout=60) as client:
        token = await amadeus_token(client)
        if not token:
            return {
                "success": False,
                "error": "Flight search is not configured — add AMADEUS_CLIENT_ID "
                "and AMADEUS_CLIENT_SECRET to this Space.",
                "data": {"flights": []},
            }

        params = {
            "originLocationCode": req.origin.upper(),
            "destinationLocationCode": req.destination.upper(),
            "departureDate": req.departure_date,
            "adults": req.adult_count,
            "currencyCode": "INR",
            "max": 20,
            "travelClass": CABIN.get(req.cabin_class, "ECONOMY"),
        }
        if req.child_count:
            params["children"] = req.child_count
        if req.trip_type == "round" and req.return_date:
            params["returnDate"] = req.return_date
        if req.direct_flight:
            params["nonStop"] = "true"

        r = await client.get(
            f"{AMADEUS_HOST}/v2/shopping/flight-offers",
            params=params,
            headers={"Authorization": f"Bearer {token}"},
        )
        if r.status_code != 200:
            return {
                "success": False,
                "error": "No flights came back for that route and date.",
                "detail": r.text[:300],
                "data": {"flights": []},
            }

        offers = r.json().get("data", [])
        flights = []
        for o in offers:
            itin = (o.get("itineraries") or [{}])[0]
            segs = itin.get("segments") or []
            if not segs:
                continue
            first, last = segs[0], segs[-1]
            flights.append(
                {
                    "id": o.get("id"),
                    "airline": first.get("carrierCode"),
                    "flight_number": f"{first.get('carrierCode','')}{first.get('number','')}",
                    "origin": first.get("departure", {}).get("iataCode"),
                    "destination": last.get("arrival", {}).get("iataCode"),
                    "departure_time": first.get("departure", {}).get("at"),
                    "arrival_time": last.get("arrival", {}).get("at"),
                    "duration": itin.get("duration"),
                    "stops": max(len(segs) - 1, 0),
                    "fare": float(o.get("price", {}).get("grandTotal", 0)),
                    "currency": o.get("price", {}).get("currency", "INR"),
                    "seats_available": o.get("numberOfBookableSeats"),
                }
            )

        return {
            "success": True,
            "data": {"flights": flights, "trace_id": r.headers.get("x-request-id")},
        }


# ── Hotels ─────────────────────────────────────────────────────────────
@app.post("/hotels/search")
async def search_hotels(req: HotelRequest):
    async with httpx.AsyncClient(timeout=60) as client:
        token = await amadeus_token(client)
        if not token:
            return {
                "success": False,
                "error": "Hotel search is not configured — add AMADEUS_CLIENT_ID "
                "and AMADEUS_CLIENT_SECRET to this Space.",
                "data": {"hotels": []},
            }

        code = (req.city_code or req.city or "DEL").upper()[:3]
        r = await client.get(
            f"{AMADEUS_HOST}/v1/reference-data/locations/hotels/by-city",
            params={"cityCode": code, "radius": req.radius_km, "radiusUnit": "KM"},
            headers={"Authorization": f"Bearer {token}"},
        )
        if r.status_code != 200:
            return {
                "success": False,
                "error": "No stays came back for that city.",
                "detail": r.text[:300],
                "data": {"hotels": []},
            }

        hotels = [
            {
                "id": h.get("hotelId"),
                "name": h.get("name"),
                "lat": (h.get("geoCode") or {}).get("latitude"),
                "lng": (h.get("geoCode") or {}).get("longitude"),
                "distance_km": (h.get("distance") or {}).get("value"),
                "country": (h.get("address") or {}).get("countryCode"),
            }
            for h in r.json().get("data", [])[:40]
        ]
        return {"success": True, "data": {"hotels": hotels}}


# ── Stays: Booking.com ─────────────────────────────────────────────────
@app.get("/stays/booking")
async def stays_booking(city: str, check_in: Optional[str] = None,
                        check_out: Optional[str] = None, adults: int = 2):
    """Hotels for an Indian city, via Booking.com."""
    if not os.getenv("RAPIDAPI_KEY"):
        return {"success": False, "error": "Stays are not configured — add RAPIDAPI_KEY.",
                "data": {"stays": []}}

    async with httpx.AsyncClient(timeout=45) as client:
        # Booking needs its own destination id before it will search.
        dest = await client.get(f"https://{BOOKING_HOST}/api/v1/hotels/searchDestination",
                                params={"query": city}, headers=rapid_headers(BOOKING_HOST))
        rows = dest.json().get("data") if dest.status_code == 200 else None
        if not rows:
            return {"success": False, "error": f"Could not find {city} on Booking.",
                    "data": {"stays": []}}

        first = rows[0]
        params = {"dest_id": first.get("dest_id"),
                  "search_type": (first.get("search_type") or "city").upper(),
                  "adults": adults, "room_qty": 1,
                  "currency_code": "INR", "languagecode": "en-us"}
        if check_in:
            params["arrival_date"] = check_in
        if check_out:
            params["departure_date"] = check_out

        r = await client.get(f"https://{BOOKING_HOST}/api/v1/hotels/searchHotels",
                             params=params, headers=rapid_headers(BOOKING_HOST))
        if r.status_code != 200:
            return {"success": False, "error": "Booking returned no stays for that search.",
                    "detail": r.text[:250], "data": {"stays": []}}

        stays = []
        for h in ((r.json().get("data") or {}).get("hotels") or [])[:30]:
            prop = h.get("property") or {}
            price = (prop.get("priceBreakdown") or {}).get("grossPrice") or {}
            stays.append({"id": h.get("hotel_id"), "name": prop.get("name"),
                          "rating": prop.get("reviewScore"), "reviews": prop.get("reviewCount"),
                          "stars": prop.get("propertyClass"),
                          "price": round(price.get("value", 0)) or None,
                          "currency": price.get("currency", "INR"),
                          "photo": (prop.get("photoUrls") or [None])[0],
                          "lat": prop.get("latitude"), "lng": prop.get("longitude"),
                          "source": "booking.com"})
        return {"success": True, "data": {"stays": stays, "city": first.get("name")}}


# ── Stays: Airbnb ──────────────────────────────────────────────────────
@app.get("/stays/airbnb")
async def stays_airbnb(city: str, adults: int = 2):
    """Homestays and apartments, via Airbnb."""
    if not os.getenv("RAPIDAPI_KEY"):
        return {"success": False, "error": "Stays are not configured — add RAPIDAPI_KEY.",
                "data": {"stays": []}}

    async with httpx.AsyncClient(timeout=45) as client:
        dest = await client.get(f"https://{AIRBNB_HOST}/api/v1/searchDestination",
                                params={"query": city}, headers=rapid_headers(AIRBNB_HOST))
        rows = dest.json().get("data") if dest.status_code == 200 else None
        if not rows:
            return {"success": False, "error": f"Could not find {city} on Airbnb.",
                    "data": {"stays": []}}

        place = rows[0]
        r = await client.get(f"https://{AIRBNB_HOST}/api/v2/searchPropertyByPlace",
                             params={"id": place.get("id"), "adults": adults, "currency": "INR"},
                             headers=rapid_headers(AIRBNB_HOST))
        if r.status_code != 200:
            return {"success": False, "error": "Airbnb returned no stays for that search.",
                    "detail": r.text[:250], "data": {"stays": []}}

        body = r.json().get("data") or {}
        stays = []
        for item in (body.get("list") or body.get("results") or [])[:30]:
            info = item.get("listing") or item
            quote = item.get("pricingQuote") or {}
            stays.append({"id": info.get("id"),
                          "name": info.get("name") or info.get("title"),
                          "rating": info.get("avgRatingLocalized") or info.get("avgRating"),
                          "photo": ((info.get("contextualPictures") or [{}])[0] or {}).get("picture"),
                          "price": (quote.get("structuredStayDisplayPrice") or {})
                                   .get("primaryLine", {}).get("price"),
                          "city": place.get("location_name"), "source": "airbnb"})
        return {"success": True, "data": {"stays": stays, "city": place.get("location_name")}}


# ── Trains ─────────────────────────────────────────────────────────────
@app.get("/trains/live")
async def train_live(train_number: str, start_day: int = 1):
    """Live running status for a train number, via IRCTC."""
    if not os.getenv("RAPIDAPI_KEY"):
        return {"success": False, "error": "Train search is not configured — add RAPIDAPI_KEY.",
                "data": {}}
    async with httpx.AsyncClient(timeout=45) as client:
        r = await client.get(
            f"https://{IRCTC_HOST}/api/trains-search/v1/train/{train_number}",
            params={"startDay": start_day, "isH5": "true", "client": "web"},
            headers={**rapid_headers(IRCTC_HOST), "x-rapid-api": "rapid-api-database"})
        if r.status_code != 200:
            return {"success": False,
                    "error": f"No live status came back for train {train_number}.", "data": {}}
        return {"success": True, "data": r.json().get("body", {})}
