import React from 'react';
import { MapPin, Calendar, Utensils, Star, Clock } from 'lucide-react';

const SimpleMarkdownDisplay = ({ markdown }) => {
    // Simple parser to convert markdown structure to UI
    // Expecting:
    // # Title
    // ## Country
    // ### Place
    // *Description*
    // **Highlights:** ...

    if (!markdown) return null;

    const sections = markdown.split('## 🏳️ ');
    const title = sections[0].replace('# 🌍 ', '').trim();
    const countrySections = sections.slice(1);

    return (
        <div className="space-y-8 mt-10">
            {/* Header card */}
            <div className="relative overflow-hidden bg-ink-900 border border-white/[0.07] p-8 md:p-10 rounded-3xl">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-saffron/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
                <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="route-dot" aria-hidden="true" />
                        <span className="eyebrow">Route notes</span>
                        <span className="route-line w-14 hidden sm:inline-block" aria-hidden="true" />
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl font-medium text-ivory tracking-tight mb-2">{title}</h1>
                    <p className="text-ivory-muted text-sm">A custom journey drafted by SafarX</p>
                </div>
            </div>

            {countrySections.map((section, idx) => {
                const lines = section.split('\n');
                const countryName = lines[0].trim();
                const content = lines.slice(1).join('\n');

                // Split by Places (### 📍 )
                const places = content.split('### 📍 ').slice(1);

                return (
                    <div key={idx} className="bg-ink-900/70 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-6 md:p-8">
                        <h2 className="font-display italic text-2xl md:text-3xl font-medium text-ivory mb-6 flex items-center gap-3">
                            <span className="route-dot" aria-hidden="true" />
                            {countryName}
                        </h2>

                        <div className="grid gap-6">
                            {places.map((placeBlock, pIdx) => {
                                const placeLines = placeBlock.split('\n').filter(l => l.trim());
                                const placeName = placeLines[0].trim();
                                const description = placeLines.find(l => l.startsWith('*'))?.replace(/\*/g, '') || '';

                                const highlights = placeLines.find(l => l.includes('Highlights:'))?.split('**')[2].trim();
                                const mustTry = placeLines.find(l => l.includes('Must Try:'))?.split('**')[2].trim();
                                const bestSeason = placeLines.find(l => l.includes('Best Season:'))?.split('**')[2].trim();

                                // Extract Day Plan
                                const dayPlanIndex = placeLines.findIndex(l => l.includes('> **Day Plan**'));
                                const dayPlan = dayPlanIndex !== -1 ? placeLines.slice(dayPlanIndex + 1) : [];

                                return (
                                    <div key={pIdx} className="bg-ink-800/80 border border-white/[0.07] rounded-2xl p-6 hover:border-saffron/35 transition-colors duration-500">
                                        <h3 className="text-lg md:text-xl font-bold text-ivory mb-2 flex items-center gap-2.5">
                                            <MapPin size={18} className="text-saffron shrink-0" aria-hidden="true" />
                                            {placeName}
                                        </h3>
                                        <p className="text-ivory-muted text-sm leading-relaxed mb-5">{description}</p>

                                        <div className="grid md:grid-cols-3 gap-3 mb-5">
                                            {highlights && (
                                                <div className="bg-white/[0.04] border border-white/[0.07] p-3.5 rounded-xl">
                                                    <div className="flex items-center gap-2 mb-1.5 font-data text-[10px] uppercase tracking-[0.18em] text-saffron">
                                                        <Star size={12} aria-hidden="true" /> Highlights
                                                    </div>
                                                    <div className="text-ivory text-sm leading-snug">{highlights}</div>
                                                </div>
                                            )}
                                            {mustTry && (
                                                <div className="bg-white/[0.04] border border-white/[0.07] p-3.5 rounded-xl">
                                                    <div className="flex items-center gap-2 mb-1.5 font-data text-[10px] uppercase tracking-[0.18em] text-saffron">
                                                        <Utensils size={12} aria-hidden="true" /> Must try
                                                    </div>
                                                    <div className="text-ivory text-sm leading-snug">{mustTry}</div>
                                                </div>
                                            )}
                                            {bestSeason && (
                                                <div className="bg-white/[0.04] border border-white/[0.07] p-3.5 rounded-xl">
                                                    <div className="flex items-center gap-2 mb-1.5 font-data text-[10px] uppercase tracking-[0.18em] text-saffron">
                                                        <Calendar size={12} aria-hidden="true" /> Season
                                                    </div>
                                                    <div className="text-ivory text-sm leading-snug">{bestSeason}</div>
                                                </div>
                                            )}
                                        </div>

                                        {dayPlan.length > 0 && (
                                            <div className="bg-ink-900/70 border border-white/[0.06] rounded-xl p-4">
                                                <h4 className="flex items-center gap-2 mb-3 font-data text-[10px] uppercase tracking-[0.18em] text-ivory/80">
                                                    <Clock size={12} className="text-saffron" aria-hidden="true" /> Suggested day plan
                                                </h4>
                                                <ul className="space-y-2">
                                                    {dayPlan.map((l, i) => {
                                                        const cleanLine = l.replace('> - ', '').replace('>', '').trim();
                                                        if (!cleanLine) return null;
                                                        return (
                                                            <li key={i} className="text-ivory-muted text-sm flex items-start leading-relaxed">
                                                                <span className="route-dot mt-1.5 mr-2.5 shrink-0" aria-hidden="true" />
                                                                {cleanLine}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SimpleMarkdownDisplay;
