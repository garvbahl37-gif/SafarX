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
          <div className="flex items-center gap-2 text-xs font-data uppercase tracking-widest text-ivory-muted mb-1">
            <Building2 className="w-4 h-4 text-saffron-bright" />
            <span>Official Government Helplines & Embassy Directory</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold font-display text-ivory">
            Verified Emergency Contacts
          </h3>
          <p className="text-xs text-ivory-muted">
            ERSS 112, Ministry of Tourism 1363, all 28 Indian States, and Diplomatic Missions
          </p>
        </div>

        {/* Search Box */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ivory-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search state, embassy, or service…"
            className="w-full bg-ink-950 border border-white/15 rounded-xl pl-9 pr-3.5 py-2 text-xs text-ivory placeholder-ivory-faint focus:outline-none focus:border-saffron-bright transition"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-2 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveSection("states")}
          className={`pb-3 px-3 transition border-b-2 ${
            activeSection === "states"
              ? "border-saffron-bright text-saffron-bright font-bold"
              : "border-transparent text-ivory-muted hover:text-ivory"
          }`}
        >
          State Helplines (28 States & UTs)
        </button>

        <button
          onClick={() => setActiveSection("national")}
          className={`pb-3 px-3 transition border-b-2 ${
            activeSection === "national"
              ? "border-saffron-bright text-saffron-bright font-bold"
              : "border-transparent text-ivory-muted hover:text-ivory"
          }`}
        >
          National 24x7 Hotlines (112, 1363, 1091)
        </button>

        <button
          onClick={() => setActiveSection("embassies")}
          className={`pb-3 px-3 transition border-b-2 ${
            activeSection === "embassies"
              ? "border-saffron-bright text-saffron-bright font-bold"
              : "border-transparent text-ivory-muted hover:text-ivory"
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
                  className="bg-ink-950/80 border border-white/10 hover:border-saffron/40 rounded-2xl p-4 transition group space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-ivory text-sm group-hover:text-saffron-bright transition">
                      {stateName}
                    </h4>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-ivory-muted font-data">
                      State Desk
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-ivory-muted">
                    <div className="flex items-center justify-between">
                      <span className="text-ivory-faint">Police:</span>
                      <a
                        href={getCleanTelUri(data.police)}
                        className="font-data text-ivory hover:text-saffron-bright flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-lg transition"
                      >
                        <PhoneCall className="w-3 h-3 text-danger-bright" />
                        <span>{data.police}</span>
                      </a>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-ivory-faint">Women:</span>
                      <a
                        href={getCleanTelUri(data.womenHelpline)}
                        className="font-data text-danger-bright hover:text-danger-bright flex items-center gap-1.5 bg-danger/10 hover:bg-danger/20 px-2 py-0.5 rounded-lg transition"
                      >
                        <PhoneCall className="w-3 h-3 text-danger-bright" />
                        <span>{data.womenHelpline}</span>
                      </a>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-ivory-faint">Tourist Police:</span>
                      <a
                        href={getCleanTelUri(data.touristPolice)}
                        className="font-data text-saffron-bright hover:text-saffron-200 flex items-center gap-1.5 bg-saffron/10 hover:bg-saffron/20 px-2 py-0.5 rounded-lg transition truncate max-w-[170px]"
                      >
                        <PhoneCall className="w-3 h-3 text-saffron-bright shrink-0" />
                        <span className="truncate">{data.touristPolice}</span>
                      </a>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-ivory-faint">Hospital / Med:</span>
                      <a
                        href={getCleanTelUri(data.hospital)}
                        className="text-ivory-muted hover:text-ivory flex items-center gap-1 text-[11px] truncate max-w-[180px]"
                      >
                        <PhoneCall className="w-2.5 h-2.5 text-horizon-bright shrink-0" />
                        <span className="truncate">{data.hospital}</span>
                      </a>
                    </div>
                  </div>

                  {data.stateNotes && (
                    <p className="text-[11px] text-ivory-faint pt-2 border-t border-white/5 line-clamp-2">
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
                  <span className="text-[10px] uppercase font-data px-2 py-0.5 rounded-full bg-white/10 text-ivory-muted font-semibold">
                    {item.badge}
                  </span>
                </div>
                <p className="font-bold text-ivory text-sm">{item.title}</p>
                <p className="text-xs text-ivory-muted leading-relaxed">{item.description}</p>
              </div>

              <a
                href={`tel:${item.number}`}
                className="shrink-0 bg-danger hover:bg-danger text-ivory font-data font-bold text-base px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition"
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
              className="bg-ink-950/80 border border-white/10 rounded-2xl p-4.5 space-y-2 text-xs text-ivory-muted"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-ivory text-sm flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-horizon-bright" />
                  Embassy / Mission of {emb.country}
                </h4>
                <span className="text-[10px] bg-horizon/15 text-horizon-bright px-2 py-0.5 rounded-full">
                  Consular Services
                </span>
              </div>

              <p className="text-ivory-muted">{emb.city}</p>
              <p className="text-[11px] text-ivory-faint">{emb.address}</p>

              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                <a
                  href={`tel:${emb.phone}`}
                  className="inline-flex items-center gap-1.5 font-data text-saffron-bright hover:text-ivory"
                >
                  <PhoneCall className="w-3 h-3" />
                  {emb.phone}
                </a>

                {emb.website && (
                  <a
                    href={emb.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-horizon-bright hover:text-horizon-bright flex items-center gap-1"
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
