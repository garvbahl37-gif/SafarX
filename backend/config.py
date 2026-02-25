# backend/config.py

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # TBO Credentials
    tbo_client_id: str = "ApiIntegrationNew"
    tbo_username: str = ""
    tbo_password: str = ""
    tbo_end_user_ip: str = ""

    # TBO URLs
    tbo_auth_url: str = "http://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate"
    tbo_logout_url: str = "http://Sharedapi.tektravels.com/SharedData.svc/rest/Logout"
    tbo_search_url: str = "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search"
    tbo_book_url: str = "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Book"
    tbo_ticket_url: str = "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Ticket"

    # App
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()