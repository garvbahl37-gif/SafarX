import { GoogleGenerativeAI } from "@google/generative-ai";
import toast from "react-hot-toast";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.9, // Higher temperature = more random/diverse state choices
    topP: 0.95,
    topK: 40,
  },
});

export async function generateItinerary(params) {
  const { state, startDate, endDate, startTime, endTime } = params;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // Get current month for season-based recommendations
  const month = new Date(startDate).getMonth() + 1;
  const getSeasonalContext = (m) => {
    if ([12, 1, 2].includes(m)) return "winter (great for tropical destinations, ski resorts, Southern Hemisphere summer)";
    if ([3, 4, 5].includes(m)) return "spring (ideal for Europe, cherry blossoms in Japan, mild weather worldwide)";
    if ([6, 7, 8, 9].includes(m)) return "summer (peak season for Europe, avoid monsoon regions in Asia)";
    return "autumn (beautiful foliage, shoulder season deals, mild weather)";
  };

  const seasonalContext = getSeasonalContext(month);

  const isAnyState = !state || state === "any";

  const prompt = `
You are an expert global travel planner with deep knowledge of destinations worldwide — their geography, climate, culture, attractions, visa requirements, and accessibility.

USER INPUT:
- Preferred Destination: ${isAnyState ? "Any Destination (MUST pick ONE random suitable country/region)" : state}
- Trip Start Date: ${startDate}
- Trip End Date: ${endDate}
- Number of Days Available: ${dayCount} days
- Current Season: ${seasonalContext}
- Daily Start Time: ${startTime}
- Daily End Time: ${endTime}
- Hours Available Per Day: ${calculateHours(startTime, endTime)}

CRITICAL INSTRUCTIONS FOR "ANY DESTINATION" SELECTION:
If user selected "Any Destination":

1. DO NOT ALWAYS CHOOSE THE SAME DESTINATION.
   - Each request should recommend a DIFFERENT country/region from previous recommendations.
   - Treat this as a randomized recommendation system.

2. FILTER DESTINATIONS BY DURATION:
   - 1-2 days: Choose city breaks or nearby weekend getaways
   - 3-4 days: Choose medium-distance destinations (a single city or small region)
   - 5-7 days: Can choose farther destinations (full country explorations, multi-city trips)
   - 8+ days: Can recommend epic journeys (cross-country, multi-country tours)

3. CONSIDER SEASON (${seasonalContext}):
   - Winter (Dec-Feb): Southeast Asia, Australia, New Zealand, Caribbean, Middle East
   - Spring (Mar-May): Japan, Europe, Mediterranean, Morocco
   - Summer (Jun-Aug): Northern Europe, Iceland, Canada, Patagonia
   - Autumn (Sep-Nov): USA, China, Turkey, Greece, South America

4. RANDOM SELECTION:
   - Create a mental list of 4-5 suitable destinations based on days + season
   - RANDOMLY pick ONE from that list (not always the first or "best")
   - This ensures variety across multiple calls

5. AVOID REPETITION:
   - If user keeps selecting "Any Destination", they should see DIFFERENT recommendations each time

ITINERARY GENERATION:
For the SELECTED/RECOMMENDED destination:
1. Choose 1-2 main cities/regions best suited for ${dayCount} days
2. Generate COMPLETE day-wise AND hour-wise itinerary:
   - Each day covers ${startTime} to ${endTime}
   - Activities realistic with actual travel times
   - Include breakfast/lunch/dinner breaks
   - Mix cultural landmarks, local experiences, nature, food
3. For EVERY activity include realistic costs in local currency AND approximate USD
4. Add transport options (metro, bus, taxi, walking, trains, rideshare)
5. Include specific safety tips for that location
6. Calculate realistic total costs

RESPONSE FORMAT - STRICT JSON ONLY:
{
  "selectedState": "string (the randomly chosen destination / country)",
  "recommendationReason": "string (why this destination for ${dayCount} days in ${seasonalContext})",
  "recommendedCities": ["city1", "city2"],
  "tripSummary": "2-3 sentences about the trip",
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "theme": "string",
      "activities": [
        {
          "startTime": "HH:mm",
          "endTime": "HH:mm",
          "title": "string",
          "shortDescription": "string",
          "location": "string",
          "area": "string",
          "recommendedTransport": "string",
          "estimatedCostINR": number,
          "duration": "string",
          "safetyTips": "string"
        }
      ],
      "dayTotal": number
    }
  ],
  "costBreakdown": {
    "totalTransportCostINR": number,
    "totalFoodCostINR": number,
    "totalActivityTicketsCostINR": number,
    "totalEstimatedCostINR": number,
    "costPerDayAverage": number
  },
  "generalSafetyRecommendations": [
    "string specific to this destination"
  ],
  "bestTimeToVisit": "string",
  "travelTips": [
    "string with local knowledge"
  ],
  "packingRecommendations": [
    "string based on climate of this destination"
  ]
}

Generate NOW:
`;

  try {
    toast.loading("🚀 Planning your itinerary with AI...");

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let itinerary;
    try {
      const jsonMatch = text.match(/\`\`\`json\n?([\s\S]*?)\n?\`\`\`/) ||
        text.match(/\{[\s\S]*\}/);
      itinerary = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : text);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw response:", text);
      toast.error("⚠️ Response parsing failed. Please try again.");
      throw new Error("Invalid JSON from Gemini");
    }

    toast.dismiss();
    toast.success("✨ Itinerary generated successfully!");
    return itinerary;
  } catch (error) {
    console.error("Gemini Error:", error);
    toast.dismiss();
    toast.error("❌ Failed to generate itinerary. Check API key & internet.");
    throw error;
  }
}

function calculateHours(startTime, endTime) {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  const mins = end - start;
  const hours = (mins / 60).toFixed(1);
  return `${hours} hours`;
}
