# SafarX Agent backend

FastAPI service behind the SafarX Agent. Deployed as a Hugging Face Space
(Docker SDK) at `bharatverse11/SafarX`.

**TBO has been removed.** Flights and hotels now use Amadeus's free
Self-Service tier, and the chat runs on Groq. Every provider here has a free
tier and none requires a paid contract.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET  | `/` | health + which providers are configured |
| POST | `/chat` | Groq-backed travel chat |
| POST | `/flights/search` | Amadeus flight offers |
| POST | `/hotels/search` | Amadeus hotels by city |
| GET  | `/trains/between` | trains between two stations |

The frontend contract is unchanged: `flights/search` still accepts
`{origin, destination, departure_date, adult_count, cabin_class, trip_type}`
and still returns `{success, data: {flights: [...]}}`.

## Environment

Set these in **Space settings → Variables and secrets**:

| Secret | Needed for | Free? |
|---|---|---|
| `GROQ_API_KEY` | chat | yes |
| `AMADEUS_CLIENT_ID` | flights, hotels | yes (test env) |
| `AMADEUS_CLIENT_SECRET` | flights, hotels | yes (test env) |
| `RAPIDAPI_KEY` | trains (optional) | free tier |

Missing keys degrade gracefully — the endpoint returns a clear message
instead of failing, so the app still runs.

## Run locally

```bash
pip install -r requirements.txt
uvicorn app:app --reload --port 7860
```
