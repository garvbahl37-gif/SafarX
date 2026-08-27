import React, { useState } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MapPin, Calendar, Utensils, Star, Clock, Copy, CheckCircle } from 'lucide-react';
import { copyText } from './planner/itineraryToText';
import { EASE } from './planner/plannerOptions';

const SimpleMarkdownDisplay = ({ markdown }) => {
    // Simple parser to convert markdown structure to UI
    // Expecting:
    // # Title
    // ## Country
    // ### Place
    // *Description*
    // **Highlights:** ...

    const reduce = useReducedMotion();
    const [copied, setCopied] = useState(false);

    if (!markdown) return null;

    const sections = markdown.split('## 🏳️ ');
    const title = sections[0].replace('# 🌍 ', '').trim();
    const countrySections = sections.slice(1);

    const handleCopy = async () => {
        try {
            await copyText(markdown);
            setCopied(true);
            toast.success('Copied — paste it straight into WhatsApp');
            setTimeout(() => setCopied(false), 2500);
        } catch (error) {
            console.error('Clipboard error:', error);
            toast.error("Couldn't copy the plan — try again");
        }
    };

    const reveal = (delay = 0) => ({
        initial: reduce ? false : { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-60px' },
        transition: { duration: 0.6, delay: reduce ? 0 : delay, ease: EASE },
    });

    return (
        <div className="space-y-6 mt-8">
            <div className="flex justify-center">
                <button type="button" onClick={handleCopy} className="btn-ghost">
                    {copied ? <CheckCircle size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                    {copied ? 'Copied' : 'Copy for WhatsApp'}
                </button>
            </div>

            {/* Header card */}
            <Motion.header
                {...reveal()}
                className="relative overflow-hidden bg-ink-900 border border-white/[0.07] p-6 sm:p-9 md:p-11 rounded-3xl"
            >
                <div className="absolute -top-24 -right-20 w-72 h-72 bg-saffron/[0.09] rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
                <div className="relative">
                    <p className="flex items-center gap-3 mb-5">
                        <span className="route-dot" aria-hidden="true" />
                        <span className="eyebrow">Route notes</span>
                        <span className="route-line flex-1 max-w-[10rem]" aria-hidden="true" />
                    </p>
                    <h1 className="font-display italic text-3xl sm:text-4xl md:text-5xl font-medium text-ivory tracking-tight leading-[1.08] mb-3">
                        {title}
                    </h1>
                    <p className="font-data text-[11px] uppercase tracking-[0.2em] text-ivory-faint">
                        A custom journey drafted by SafarX
                    </p>
                </div>
            </Motion.header>

            {countrySections.map((section, idx) => {
                const lines = section.split('\n');
                const countryName = lines[0].trim();
                const content = lines.slice(1).join('\n');

                // Split by Places (### 📍 )
                const places = content.split('### 📍 ').slice(1);

                return (
                    <Motion.section
                        key={idx}
                        {...reveal(0.05)}
                        className="bg-ink-900 border border-white/[0.07] rounded-3xl p-5 sm:p-8"
                    >
                        <h2 className="font-display italic text-2xl md:text-3xl font-medium text-ivory mb-6 flex items-center gap-3">
                            <span className="route-dot" aria-hidden="true" />
                            {countryName}
                        </h2>

                        <div className="grid gap-4">
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

                                const facts = [
                                    { key: 'highlights', icon: Star, label: 'Highlights', value: highlights },
                                    { key: 'mustTry', icon: Utensils, label: 'Must try', value: mustTry },
                                    { key: 'season', icon: Calendar, label: 'Season', value: bestSeason },
                                ].filter(f => f.value);

                                return (
                                    <Motion.article
                                        key={pIdx}
                                        initial={reduce ? false : { opacity: 0, y: 18 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-50px' }}
                                        transition={{ duration: 0.5, delay: reduce ? 0 : Math.min(pIdx, 4) * 0.05, ease: EASE }}
                                        className="bg-ink-800 border border-white/[0.07] rounded-2xl p-5 sm:p-6 hover:border-saffron/35 transition-colors duration-500"
                                    >
                                        <h3 className="font-display text-xl md:text-2xl font-medium text-ivory mb-2.5 flex items-center gap-2.5">
                                            <MapPin size={18} className="text-saffron shrink-0" aria-hidden="true" />
                                            {placeName}
                                        </h3>
                                        <p className="text-ivory-muted text-sm leading-relaxed mb-5">{description}</p>

                                        {facts.length > 0 && (
                                            <div className="grid sm:grid-cols-3 gap-3 mb-5">
                                                {facts.map((fact) => {
                                                    const Icon = fact.icon;
                                                    return (
                                                        <div key={fact.key} className="bg-white/[0.04] border border-white/[0.07] p-3.5 rounded-xl">
                                                            <p className="flex items-center gap-2 mb-1.5 font-data text-[10px] uppercase tracking-[0.18em] text-saffron">
                                                                <Icon size={12} aria-hidden="true" /> {fact.label}
                                                            </p>
                                                            <p className="text-ivory text-sm leading-snug">{fact.value}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {dayPlan.length > 0 && (
                                            <div className="bg-ink-900 border border-white/[0.06] rounded-xl p-4">
                                                <h4 className="flex items-center gap-2 mb-3 font-data text-[10px] uppercase tracking-[0.18em] text-ivory/80">
                                                    <Clock size={12} className="text-saffron" aria-hidden="true" /> Suggested day plan
                                                </h4>
                                                <ul className="space-y-2.5 relative pl-4">
                                                    <span className="absolute left-[2px] top-2 bottom-2 w-px bg-gradient-to-b from-saffron/40 via-white/10 to-transparent" aria-hidden="true" />
                                                    {dayPlan.map((l, i) => {
                                                        const cleanLine = l.replace('> - ', '').replace('>', '').trim();
                                                        if (!cleanLine) return null;
                                                        return (
                                                            <li key={i} className="relative text-ivory-muted text-sm leading-relaxed">
                                                                <span className="route-dot absolute -left-4 top-2" aria-hidden="true" />
                                                                {cleanLine}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        )}
                                    </Motion.article>
                                );
                            })}
                        </div>
                    </Motion.section>
                );
            })}
        </div>
    );
};

export default SimpleMarkdownDisplay;
