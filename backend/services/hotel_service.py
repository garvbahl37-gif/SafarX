# backend/services/hotel_service.py

import requests
import logging
import re
from typing import Optional, Dict, Any
from functools import lru_cache
from config import get_settings

logger = logging.getLogger(__name__)


def _get_hotel_headers() -> dict:
    """Build RapidAPI headers fresh from settings each call."""
    settings = get_settings()
    return {
        "x-rapidapi-key":  settings.rapidapi_key,
        "x-rapidapi-host": settings.rapidapi_host,
    }


def _get_base_url() -> str:
    settings = get_settings()
    return f"https://{settings.rapidapi_host}/api/v1/hotels"


def _extract_geo_id(raw_geo_id: str) -> str:
    """
    Extract the clean numeric geoId from whatever format TripAdvisor returns.

    Examples:
      "loc;317100;g317100"  →  "317100"
      "g317100"             →  "317100"
      "317100"              →  "317100"
      "295424"              →  "295424"
    """
    if not raw_geo_id:
        return raw_geo_id

    # If it contains semicolons e.g. "loc;317100;g317100"
    # grab the first pure numeric segment
    if ";" in raw_geo_id:
        parts = raw_geo_id.split(";")
        for part in parts:
            # strip leading letters like "g" then check if numeric
            cleaned = re.sub(r'^[a-zA-Z]+', '', part)
            if cleaned.isdigit():
                return cleaned

    # If it starts with letters followed by digits e.g. "g317100"
    match = re.match(r'^[a-zA-Z]+(\d+)$', raw_geo_id)
    if match:
        return match.group(1)

    # Already a plain number
    if raw_geo_id.isdigit():
        return raw_geo_id

    # Fallback — return as-is
    return raw_geo_id


# ── Public service functions ──────────────────────────────────────────────────
def _normalize_query(q: str) -> str:
    return q.strip().lower()


@lru_cache(maxsize=200)
def _search_location_cached(norm_query: str) -> Dict[str, Any]:
    """Cached internal location search."""
    try:
        url = f"{_get_base_url()}/searchLocation"
        params = {"query": norm_query}

        response = requests.get(
            url,
            headers=_get_hotel_headers(),
            params=params,
            timeout=15,
        )
        response.raise_for_status()

        data = response.json()

        if data.get("status"):
            items = data.get("data", [])
            for item in items:
                if "title" in item:
                    item["title"] = (
                        item["title"]
                        .replace("<b>", "")
                        .replace("</b>", "")
                    )
                if "documentId" in item:
                    item["geoId"] = _extract_geo_id(item["documentId"])

            return {"success": True, "data": items}

        return {"success": False, "error": data.get("message", "Unknown error"), "data": []}

    except requests.exceptions.Timeout:
        logger.error("Timeout searching location: %s", norm_query)
        return {"success": False, "error": "Request timed out", "data": []}
    except requests.exceptions.RequestException as e:
        logger.error("Error searching location: %s", str(e))
        return {"success": False, "error": str(e), "data": []}


def search_location(query: str) -> Dict[str, Any]:
    norm = _normalize_query(query)

    if len(norm) < 3:
        return {"success": True, "data": []}

    return _search_location_cached(norm)


def get_hotels_filter(
    geoId: str,
    checkIn: str,
    checkOut: str,
) -> Dict[str, Any]:
    """Get available hotel filters for a location."""
    try:
        url    = f"{_get_base_url()}/getHotelsFilter"
        params = {
            "geoId":    _extract_geo_id(geoId),
            "checkIn":  checkIn,
            "checkOut": checkOut,
        }

        response = requests.get(
            url,
            headers=_get_hotel_headers(),
            params=params,
            timeout=15,
        )
        response.raise_for_status()

        data = response.json()

        if data.get("status"):
            return {"success": True, "data": data.get("data", {})}

        return {
            "success": False,
            "error":   data.get("message", "Unknown error"),
            "data":    {},
        }

    except requests.exceptions.RequestException as e:
        logger.error("Error getting hotel filters: %s", str(e))
        return {"success": False, "error": str(e), "data": {}}


def search_hotels(
    geoId: str,
    checkIn: str,
    checkOut: str,
    pageNumber:   int = 1,
    sort:         Optional[str] = None,
    adults:       int = 0,
    rooms:        int = 0,
    currencyCode: str = "USD",
    rating:       int = 0,
    priceMin:     int = 0,
    priceMax:     int = 0,
) -> Dict[str, Any]:
    """Search hotels by geoId."""
    try:
        # Always extract clean numeric geoId before calling RapidAPI
        clean_geo_id = _extract_geo_id(geoId)
        logger.info("Searching hotels — raw geoId: %s → clean: %s", geoId, clean_geo_id)

        url    = f"{_get_base_url()}/searchHotels"
        params = {
            "geoId":        clean_geo_id,
            "checkIn":      checkIn,
            "checkOut":     checkOut,
            "pageNumber":   str(pageNumber),
            "currencyCode": currencyCode,
        }

        if sort:         params["sort"]     = sort
        if adults > 0:   params["adults"]   = str(adults)
        if rooms > 0:    params["rooms"]    = str(rooms)
        if rating > 0:   params["rating"]   = str(rating)
        if priceMin > 0: params["priceMin"] = str(priceMin)
        if priceMax > 0: params["priceMax"] = str(priceMax)

        response = requests.get(
            url,
            headers=_get_hotel_headers(),
            params=params,
            timeout=20,
        )
        response.raise_for_status()

        data = response.json()

        if data.get("status"):
            hotels    = data.get("data", {}).get("data", [])
            processed = _process_hotel_list(hotels)
            return {
                "success":        True,
                "data":           processed,
                "sortDisclaimer": data.get("data", {}).get("sortDisclaimer", ""),
            }

        # RapidAPI returned status: false
        logger.error(
            "RapidAPI hotel search failed — geoId: %s message: %s",
            clean_geo_id,
            data.get("message"),
        )
        return {
            "success": False,
            "error":   data.get("message", "No hotels found for this location"),
            "data":    [],
        }

    except requests.exceptions.Timeout:
        logger.error("Timeout searching hotels for geoId: %s", geoId)
        return {"success": False, "error": "Request timed out", "data": []}
    except requests.exceptions.RequestException as e:
        logger.error("Error searching hotels: %s", str(e))
        return {"success": False, "error": str(e), "data": []}


def search_hotels_by_location(
    latitude:     str,
    longitude:    str,
    checkIn:      str,
    checkOut:     str,
    pageNumber:   int = 1,
    sort:         Optional[str] = None,
    adults:       int = 0,
    rooms:        int = 0,
    currencyCode: str = "USD",
) -> Dict[str, Any]:
    """Search hotels by geographic coordinates."""
    try:
        url    = f"{_get_base_url()}/searchHotelsByLocation"
        params = {
            "latitude":     latitude,
            "longitude":    longitude,
            "checkIn":      checkIn,
            "checkOut":     checkOut,
            "pageNumber":   str(pageNumber),
            "currencyCode": currencyCode,
        }

        if sort:        params["sort"]   = sort
        if adults > 0:  params["adults"] = str(adults)
        if rooms > 0:   params["rooms"]  = str(rooms)

        response = requests.get(
            url,
            headers=_get_hotel_headers(),
            params=params,
            timeout=20,
        )
        response.raise_for_status()

        data = response.json()

        if data.get("status"):
            hotels    = data.get("data", {}).get("data", [])
            processed = _process_hotel_list(hotels)
            return {
                "success":        True,
                "data":           processed,
                "sortDisclaimer": data.get("data", {}).get("sortDisclaimer", ""),
            }

        return {
            "success": False,
            "error":   data.get("message", "Unknown error"),
            "data":    [],
        }

    except requests.exceptions.RequestException as e:
        logger.error("Error searching hotels by location: %s", str(e))
        return {"success": False, "error": str(e), "data": []}


def get_hotel_details(
    hotel_id: str,
    checkIn:  str,
    checkOut: str,
    adults:   int = 0,
    rooms:    int = 0,
    currency: str = "USD",
) -> Dict[str, Any]:
    """Get detailed information for a specific hotel."""
    try:
        url    = f"{_get_base_url()}/getHotelDetails"
        params = {
            "id":       hotel_id,
            "checkIn":  checkIn,
            "checkOut": checkOut,
            "currency": currency,
        }

        if adults > 0:  params["adults"] = str(adults)
        if rooms > 0:   params["rooms"]  = str(rooms)

        response = requests.get(
            url,
            headers=_get_hotel_headers(),
            params=params,
            timeout=20,
        )
        response.raise_for_status()

        data = response.json()

        if data.get("status"):
            return {"success": True, "data": data.get("data", {})}

        return {
            "success": False,
            "error":   data.get("message", "Unknown error"),
            "data":    {},
        }

    except requests.exceptions.Timeout:
        logger.error("Timeout getting hotel details for id: %s", hotel_id)
        return {"success": False, "error": "Request timed out", "data": {}}
    except requests.exceptions.RequestException as e:
        logger.error("Error getting hotel details: %s", str(e))
        return {"success": False, "error": str(e), "data": {}}


# ── Private helper ────────────────────────────────────────────────────────────

def _process_hotel_list(hotels: list) -> list:
    """Clean and normalise hotel list data."""
    processed = []

    for hotel in hotels:
        thumbnail = None
        photos    = hotel.get("cardPhotos", [])

        if photos:
            template = photos[0].get("sizes", {}).get("urlTemplate", "")
            if template:
                thumbnail = (
                    template
                    .replace("{width}",  "400")
                    .replace("{height}", "300")
                )

        processed.append({
            "id":              hotel.get("id"),
            "title":           hotel.get("title", "").lstrip("0123456789. "),
            "primaryInfo":     hotel.get("primaryInfo"),
            "secondaryInfo":   hotel.get("secondaryInfo"),
            "rating":          hotel.get("bubbleRating", {}).get("rating", 0),
            "reviewCount":     hotel.get("bubbleRating", {}).get("count", "0"),
            "provider":        hotel.get("provider"),
            "priceForDisplay": hotel.get("priceForDisplay"),
            "isSponsored":     hotel.get("isSponsored", False),
            "badge":           hotel.get("badge", {}),
            "thumbnail":       thumbnail,
            "photos": [
                p.get("sizes", {})
                 .get("urlTemplate", "")
                 .replace("{width}",  "800")
                 .replace("{height}", "600")
                for p in photos[:4]
                if p.get("sizes", {}).get("urlTemplate")
            ],
        })

    return processed