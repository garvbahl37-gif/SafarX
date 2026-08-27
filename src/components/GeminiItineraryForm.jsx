import React, { useState } from "react";
import { generateItinerary } from "../services/aiService";
import toast from "react-hot-toast";
import { globalDestinations } from "../data/globalDestinations";
import {
  Users, Wallet, Clock, Compass, Heart, Camera,
  Utensils, Map as MapIcon, Sun, Moon,
  Palmtree, Building, LandPlot, Music, Check, ArrowRight
} from "lucide-react";

/**
 * Options for various preferences
 */
const TRAVEL_PACES = [
  { id: "Relaxed", label: "Relaxed", desc: "Plenty of downtime", icon: <Palmtree size={18} /> },
  { id: "Moderate", label: "Moderate", desc: "Balanced activity", icon: <Compass size={18} /> },
  { id: "Intense", label: "Intense", desc: "Packed schedule", icon: <Clock size={18} /> },
];

const TRAVEL_STYLES = [
  { id: "Budget", label: "Budget", desc: "Cost-conscious", icon: <Wallet size={18} /> },
  { id: "Mid Range", label: "Mid range", desc: "Comfort focused", icon: <Building size={18} /> },
  { id: "Luxury", label: "Luxury", desc: "Top-tier stays", icon: <Heart size={18} /> },
];

const INTERESTS_OPTIONS = [
  { id: "Culture", label: "Culture", icon: <LandPlot size={16} /> },
  { id: "History", label: "History", icon: <Building size={16} /> },
  { id: "Nature", label: "Nature", icon: <Palmtree size={16} /> },
  { id: "Adventure", label: "Adventure", icon: <Compass size={16} /> },
  { id: "Food", label: "Food", icon: <Utensils size={16} /> },
  { id: "Shopping", label: "Shopping", icon: <Wallet size={16} /> },
  { id: "Nightlife", label: "Nightlife", icon: <Moon size={16} /> },
  { id: "Relaxation", label: "Relaxation", icon: <Sun size={16} /> },
  { id: "Photography", label: "Photography", icon: <Camera size={16} /> },
  { id: "Art", label: "Art", icon: <Music size={16} /> },
];

const GeminiItineraryForm = ({ onItineraryGenerated }) => {
  // Separate UI state for dropdowns
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [availableCities, setAvailableCities] = useState([]);

  const [form, setForm] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "20:00",
    pace: "Moderate",
    travelStyle: "Mid Range",
    interests: [],
    travelingWithChildren: false,
    travelingWithSeniors: false,
    budget: "",
    specialRequests: "",
  });

  const [loading, setLoading] = useState(false);

  // Handle Country selection
  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    const countryData = globalDestinations.find(c => c.country === country);
    setAvailableCities(countryData ? countryData.cities : []);
    setSelectedCity("");
    setForm(prev => ({ ...prev, destination: "" }));
  };

  // Handle City selection
  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    if (city === "Select 'Others' and type manually below..." || selectedCountry === "Others") {
      setForm(prev => ({ ...prev, destination: "" }));
    } else {
      setForm(prev => ({ ...prev, destination: `${city}, ${selectedCountry}` }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Toggle interest
  const toggleInterest = (interestId) => {
    setForm(prev => {
      const exists = prev.interests.includes(interestId);
      if (exists) {
        return { ...prev, interests: prev.interests.filter(i => i !== interestId) };
      } else {
        return { ...prev, interests: [...prev.interests, interestId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalDest = form.destination;

    if (!finalDest && (selectedCountry === "Others" || selectedCity.includes("manual"))) {
      toast.error("Type your destination in the destination field to continue");
      return;
    }
    if (!finalDest) {
      toast.error("Choose a destination before generating an itinerary");
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast.error("Pick both a start and an end date for your trip");
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      toast.error("The end date is before the start date — swap them and try again");
      return;
    }

    try {
      setLoading(true);
      const itinerary = await generateItinerary({ ...form, destination: finalDest });
      onItineraryGenerated(itinerary, form);
    } catch (err) {
      console.error(err);
      toast.error("The itinerary couldn't be generated — check your connection and try again");
    } finally {
      setLoading(false);
    }
  };

  // --- Styles ---
  const inputClasses = "glass-input w-full";
  const selectClasses = "glass-input w-full appearance-none cursor-pointer";

  const radioCardClass = (active) => `
    relative flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer
    transition-all duration-300 text-center
    ${active
      ? "bg-saffron/10 border-saffron/60"
      : "bg-ink-800/60 border-white/[0.07] hover:border-white/20 hover:bg-ink-700/60"}
  `;

  const SectionTitle = (props) => {
    const Icon = props.icon;
    return (
      <h3 className="flex items-center gap-2.5 mb-5 pb-3 border-b border-white/[0.07]">
        <Icon size={15} className="text-saffron" aria-hidden="true" />
        <span className="font-data text-[11px] uppercase tracking-[0.22em] text-ivory/80">
          {props.children}
        </span>
      </h3>
    );
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-12">

        {/* 1. Destination Section */}
        <div>
          <SectionTitle icon={MapIcon}>Destination &amp; dates</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="itinerary-country" className="form-label">Country</label>
              <select
                id="itinerary-country"
                value={selectedCountry}
                onChange={handleCountryChange}
                className={selectClasses}
                required
              >
                <option value="" disabled className="bg-ink-900">Choose a country</option>
                {globalDestinations.map(c => (
                  <option key={c.country} value={c.country} className="bg-ink-900">{c.country}</option>
                ))}
              </select>
            </div>
            <div className={!selectedCountry ? "opacity-50 cursor-not-allowed" : ""}>
              <label htmlFor="itinerary-city" className="form-label">City or region</label>
              <select
                id="itinerary-city"
                value={selectedCity}
                onChange={handleCityChange}
                className={selectClasses}
                disabled={!selectedCountry}
                required={selectedCountry !== "Others"}
              >
                <option value="" disabled className="bg-ink-900">
                  {selectedCountry ? "Choose a city" : "Select a country first"}
                </option>
                {availableCities.map(city => (
                  <option key={city} value={city} className="bg-ink-900">{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Manual Destination Override */}
          {(selectedCountry === "Others" || selectedCity.includes("manual") || (!selectedCity && selectedCountry)) && (
            <div className="mb-6">
              <label htmlFor="itinerary-destination" className="form-label">Destination name</label>
              <input
                id="itinerary-destination"
                type="text"
                name="destination"
                value={form.destination}
                onChange={handleChange}
                placeholder="e.g. Rishikesh, Uttarakhand"
                className={inputClasses}
              />
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="itinerary-start" className="form-label">Start date</label>
              <input
                id="itinerary-start"
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                className={`${inputClasses} [color-scheme:dark]`}
              />
            </div>
            <div>
              <label htmlFor="itinerary-end" className="form-label">End date</label>
              <input
                id="itinerary-end"
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
                className={`${inputClasses} [color-scheme:dark]`}
              />
            </div>
          </div>
        </div>

        {/* 2. Preferences Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Travel Pace */}
          <div>
            <SectionTitle icon={Clock}>Travel pace</SectionTitle>
            <div className="grid grid-cols-3 gap-3" role="group" aria-label="Travel pace">
              {TRAVEL_PACES.map((pace) => (
                <button
                  key={pace.id}
                  type="button"
                  aria-pressed={form.pace === pace.id}
                  onClick={() => setForm(prev => ({ ...prev, pace: pace.id }))}
                  className={radioCardClass(form.pace === pace.id)}
                >
                  <span className={`mb-2 ${form.pace === pace.id ? "text-saffron" : "text-ivory-faint"}`}>
                    {pace.icon}
                  </span>
                  <span className="text-sm font-semibold text-ivory">{pace.label}</span>
                  <span className="text-[10px] text-ivory-faint mt-1 leading-tight">{pace.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Travel Style */}
          <div>
            <SectionTitle icon={Wallet}>Travel style</SectionTitle>
            <div className="grid grid-cols-3 gap-3" role="group" aria-label="Travel style">
              {TRAVEL_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  aria-pressed={form.travelStyle === style.id}
                  onClick={() => setForm(prev => ({ ...prev, travelStyle: style.id }))}
                  className={radioCardClass(form.travelStyle === style.id)}
                >
                  <span className={`mb-2 ${form.travelStyle === style.id ? "text-saffron" : "text-ivory-faint"}`}>
                    {style.icon}
                  </span>
                  <span className="text-sm font-semibold text-ivory">{style.label}</span>
                  <span className="text-[10px] text-ivory-faint mt-1 leading-tight">{style.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Interests */}
        <div>
          <SectionTitle icon={Heart}>Interests</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3" role="group" aria-label="Interests">
            {INTERESTS_OPTIONS.map((interest) => {
              const active = form.interests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleInterest(interest.id)}
                  className={`
                    flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all text-left
                    ${active
                      ? "bg-saffron/10 border-saffron/50"
                      : "bg-ink-800/60 border-white/[0.07] hover:border-white/20 hover:bg-ink-700/60"}
                  `}
                >
                  <span className={active ? "text-saffron" : "text-ivory-faint"}>{interest.icon}</span>
                  <span className={`text-sm ${active ? "text-ivory font-medium" : "text-ivory-muted"}`}>
                    {interest.label}
                  </span>
                  {active && <Check size={14} className="ml-auto text-saffron" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Details: Travelers & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Traveler Group Info */}
          <div>
            <SectionTitle icon={Users}>Who's traveling</SectionTitle>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-ink-800/60 border border-white/[0.07] cursor-pointer hover:border-white/20 transition">
                <input
                  type="checkbox"
                  name="travelingWithChildren"
                  checked={form.travelingWithChildren}
                  onChange={handleChange}
                  className="w-[18px] h-[18px] accent-saffron"
                />
                <span className="text-sm text-ivory-muted">Traveling with children (0–12)</span>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-ink-800/60 border border-white/[0.07] cursor-pointer hover:border-white/20 transition">
                <input
                  type="checkbox"
                  name="travelingWithSeniors"
                  checked={form.travelingWithSeniors}
                  onChange={handleChange}
                  className="w-[18px] h-[18px] accent-saffron"
                />
                <span className="text-sm text-ivory-muted">Traveling with seniors (65+)</span>
              </label>
            </div>
          </div>

          {/* Budget */}
          <div>
            <SectionTitle icon={Wallet}>Budget</SectionTitle>
            <label htmlFor="itinerary-budget" className="form-label">Total budget (₹)</label>
            <input
              id="itinerary-budget"
              type="number"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              placeholder="e.g. 40000"
              className={inputClasses}
            />
            <p className="mt-2 font-data text-[11px] text-ivory-faint">
              A rough total for the whole trip — stays, food, and tickets.
            </p>
          </div>
        </div>

        {/* 5. Special Requests */}
        <div>
          <label htmlFor="itinerary-requests" className="form-label">Special requests or notes</label>
          <textarea
            id="itinerary-requests"
            name="specialRequests"
            value={form.specialRequests}
            onChange={handleChange}
            placeholder="Dietary needs, mobility considerations, or must-see places…"
            rows={3}
            className={`${inputClasses} resize-none`}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center !py-4 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2.5">
              <span className="animate-spin h-4 w-4 border-2 border-ink-950/40 border-t-ink-950 rounded-full" aria-hidden="true" />
              Designing your journey…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Generate itinerary
              <ArrowRight size={16} aria-hidden="true" />
            </span>
          )}
        </button>
      </form>
    </div>
  );
};

export default GeminiItineraryForm;
