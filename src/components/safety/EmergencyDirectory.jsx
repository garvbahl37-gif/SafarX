// src/components/safety/EmergencyDirectory.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PhoneCall,
  Search,
  Building2,
  Globe,
  Radio,
  ShieldCheck,
  Cross,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import {
  NATIONAL_EMERGENCY_NUMBERS,
  STATE_EMERGENCY_DATA,
  EMBASSY_DIRECTORY
} from "../../data/emergencyContacts";
import { getCleanTelUri } from "../../services/safetyService";

export default function EmergencyDirectory() {
  const [activeSection, setActiveSection] = useState("states"); // 'states' | 'national' | 'embassies'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState(null);

  const stateList = Object.keys(STATE_EMERGENCY_DATA);
  const filteredStates = stateList.filter((s) =>
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEmbassies = EMBASSY_DIRECTORY.filter(
    (emb) =>
      emb.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emb.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-ink-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl text-ivory space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-sand-400 mb-1">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Official Government Helplines & Embassy Directory</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold font-display text-ivory">
            Verified Emergency Contacts
          </h3>
          <p className="text-xs text-sand-400">
            ERSS 112, Ministry of Tourism 1363, all 28 Indian States, and Diplomatic Missions
          </p>
        </div>

        {/* Search Box */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search state, embassy, or service…"
            className="w-full bg-ink-950 border border-white/15 rounded-xl pl-9 pr-3.5 py-2 text-xs text-ivory placeholder-sand-600 focus:outline-none focus:border-amber-400 transition"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-2 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveSection("states")}
          className={`pb-3 px-3 transition border-b-2 ${
            activeSection === "states"
              ? "border-amber-400 text-amber-300 font-bold"
              : "border-transparent text-sand-400 hover:text-white"
          }`}
        >
          State Helplines (28 States & UTs)
        </button>

        <button
          onClick={() => setActiveSection("national")}
          className={`pb-3 px-3 transition border-b-2 ${
            activeSection === "national"
              ? "border-amber-400 text-amber-300 font-bold"
              : "border-transparent text-sand-400 hover:text-white"
          }`}
        >
          National 24x7 Hotlines (112, 1363, 1091)
        </button>

        <button
          onClick={() => setActiveSection("embassies")}
          className={`pb-3 px-3 transition border-b-2 ${
            activeSection === "embassies"
              ? "border-amber-400 text-amber-300 font-bold"
              : "border-transparent text-sand-400 hover:text-white"
          }`}
        >
          Foreign Embassies & Consulates
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: STATE HELPLINES */}
      {/* ======================================================== */}
      {activeSection === "states" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredStates.map((stateName) => {
              const data = STATE_EMERGENCY_DATA[stateName];
              return (
                <div
                  key={stateName}
                  className="bg-ink-950/80 border border-white/10 hover:border-amber-500/40 rounded-2xl p-4 transition group space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-ivory text-sm group-hover:text-amber-300 transition">
                      {stateName}
                    </h4>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-sand-300 font-mono">
                      State Desk
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-sand-300">
                    <div className="flex items-center justify-between">
                      <span className="text-sand-500">Police:</span>
                      <a
                        href={getCleanTelUri(data.police)}
                        className="font-mono text-ivory hover:text-amber-300 flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-lg transition"
                      >
                        <PhoneCall className="w-3 h-3 text-red-400" />
                        <span>{data.police}</span>
                      </a>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sand-500">Women:</span>
                      <a
                        href={getCleanTelUri(data.womenHelpline)}
                        className="font-mono text-rose-300 hover:text-rose-200 flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded-lg transition"
                      >
                        <PhoneCall className="w-3 h-3 text-rose-400" />
                        <span>{data.womenHelpline}</span>
                      </a>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sand-500">Tourist Police:</span>
                      <a
                        href={getCleanTelUri(data.touristPolice)}
                        className="font-mono text-amber-300 hover:text-amber-200 flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-lg transition truncate max-w-[170px]"
                      >
                        <PhoneCall className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{data.touristPolice}</span>
                      </a>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sand-500">Hospital / Med:</span>
                      <a
                        href={getCleanTelUri(data.hospital)}
                        className="text-sand-300 hover:text-white flex items-center gap-1 text-[11px] truncate max-w-[180px]"
                      >
                        <PhoneCall className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{data.hospital}</span>
                      </a>
                    </div>
                  </div>

                  {data.stateNotes && (
                    <p className="text-[11px] text-sand-500 pt-2 border-t border-white/5 line-clamp-2">
                      💡 {data.stateNotes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: NATIONAL HOTLINES */}
      {/* ======================================================== */}
      {activeSection === "national" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {NATIONAL_EMERGENCY_NUMBERS.map((item) => (
            <div
              key={item.id}
              className="bg-ink-950/80 border border-white/10 hover:border-white/20 rounded-2xl p-4.5 flex items-start justify-between gap-3 transition"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-sand-300 font-semibold">
                    {item.badge}
                  </span>
                </div>
                <p className="font-bold text-ivory text-sm">{item.title}</p>
                <p className="text-xs text-sand-400 leading-relaxed">{item.description}</p>
              </div>

              <a
                href={`tel:${item.number}`}
                className="shrink-0 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-base px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition"
              >
                <PhoneCall className="w-4 h-4" />
                {item.number}
              </a>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: EMBASSIES & DIPLOMATIC MISSIONS */}
      {/* ======================================================== */}
      {activeSection === "embassies" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredEmbassies.map((emb) => (
            <div
              key={emb.country}
              className="bg-ink-950/80 border border-white/10 rounded-2xl p-4.5 space-y-2 text-xs text-sand-300"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-ivory text-sm flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-400" />
                  Embassy / Mission of {emb.country}
                </h4>
                <span className="text-[10px] bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-full">
                  Consular Services
                </span>
              </div>

              <p className="text-sand-400">{emb.city}</p>
              <p className="text-[11px] text-sand-500">{emb.address}</p>

              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                <a
                  href={`tel:${emb.phone}`}
                  className="inline-flex items-center gap-1.5 font-mono text-amber-300 hover:text-white"
                >
                  <PhoneCall className="w-3 h-3" />
                  {emb.phone}
                </a>

                {emb.website && (
                  <a
                    href={emb.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    Official Portal <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
