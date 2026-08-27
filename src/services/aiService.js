import { GoogleGenerativeAI } from "@google/generative-ai";
import toast from "react-hot-toast";

// Initialize Gemini with the API key from environment variables
// Ensure VITE_GEMINI_API_KEY is allowed to be accessed from client-side
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


export async function generateItinerary(params) {
  const {
    state, startDate, endDate, startTime, endTime, destination,
    pace, travelStyle, interests, travelingWithChildren, travelingWithSeniors, budget, specialRequests
  } = params;

  // Calculate duration
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // Determine season
  const month = new Date(startDate).getMonth() + 1;
  const getSeasonalContext = (m) => {
    if ([12, 1, 2].includes(m)) return "winter";
    if ([3, 4, 5].includes(m)) return "summer";
    if ([6, 7, 8, 9].includes(m)) return "monsoon";
    return "autumn";
  };
  const seasonalContext = getSeasonalContext(month);

  const locationQuery = destination ? destination : (state === "any" || !state ? "Any destination worldwide" : state);

  // Construct Travelers String
  let travelersInfo = "Adults";
  if (travelingWithChildren) travelersInfo += ", Children";
  if (travelingWithSeniors) travelersInfo += ", Seniors";

  // Construct Interests String
  const interestsStr = interests && interests.length > 0 ? interests.join(", ") : "General Sightseeing";

  const prompt = `
    You are an expert global travel planner. Create a detailed ${dayCount}-day trip itinerary for ${locationQuery} during ${seasonalContext}.
    
    TRIP PARAMETERS:
    - Dates: ${startDate} to ${endDate} (${dayCount} days)
    - Active Hours: ${startTime} to ${endTime}
    - Pace: ${pace} (Adjust activity density accordingly)
    - Travel Style: ${travelStyle} (Reflect in accommodation/dining vibes, though exact booking not needed)
    - Interests: ${interestsStr}
    - Group Composition: ${travelersInfo}
    - Budget: ${budget ? budget + " total" : "Flexible"}
    - Special Requests: ${specialRequests || "None"}

    REQUIREMENTS:
    1. Return ONLY valid JSON. No other text. Do not wrap in markdown code blocks.
    2. If "Any destination worldwide" is requested, randomly select ONE best destination for the season.
    3. The itinerary MUST reflect the '${pace}' pace and '${interestsStr}' interests. 
    4. If traveling with children/seniors, ensure activities are age-appropriate and accessible.
    5. Structure the JSON exactly as follows:
    {
      "selectedState": "Name of the destination/country",
      "recommendationReason": "Why this place is good for this season",
      "tripSummary": "Brief overview of the trip honoring the ${pace} pace and ${travelStyle} style.",
      "days": [
        {
          "dayNumber": 1,
          "date": "YYYY-MM-DD",
          "theme": "Theme of the day",
          "activities": [
            {
              "startTime": "HH:MM",
              "endTime": "HH:MM",
              "title": "Activity Name",
              "shortDescription": "One sentence description",
              "location": "Specific place name",
              "estimatedCostINR": 500,
              "duration": "2 hours"
            }
          ]
        }
      ],
      "costBreakdown": {
        "totalEstimatedCostINR": 15000,
        "costPerDayAverage": 3000
      },
      "travelTips": ["Tip 1", "Tip 2 (Related to ${travelersInfo})"]
    }
  `;


  try {
    toast.loading("🚀 Planning your perfect trip with Gemini...");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log("Raw Gemini Response:", text);

    // Clean up potential markdown formatting from Gemini
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const itinerary = JSON.parse(text);

    toast.dismiss();
    toast.success("✨ Itinerary generated successfully!");
    return itinerary;

  } catch (error) {
    console.error("Gemini Service Error:", error);
    toast.dismiss();
    toast.error("❌ Failed to generate itinerary. Please try again.");
    throw error;
  }
}
