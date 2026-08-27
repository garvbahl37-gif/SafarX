import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Activity, Users, Cloud, Globe, AlertCircle, TrendingUp } from 'lucide-react';
import { fetchConfidenceScores } from '../services/confidenceService';

const ConfidenceMeter = ({ destination, coordinates, travelDate }) => {
    const [scores, setScores] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (destination && coordinates && travelDate) {
            fetchMetrics();
        }
    }, [destination, coordinates, travelDate]);

    const fetchMetrics = async () => {
        if (!destination || !travelDate || !coordinates) return;
        setLoading(true);
        setError(null);
        try {
            const result = await fetchConfidenceScores(destination, travelDate, coordinates);
            setScores(result);
            toast.success('Confidence metrics loaded!');
        } catch (err) {
            console.error('Error fetching metrics:', err);
            setError('Failed to load confidence metrics');
            toast.error('Failed to load metrics');
        } finally {
            setLoading(false);
        }
    };

    const getMeterColor = (score) => {
        if (score >= 80) return 'bg-green-50 border-green-200';
        if (score >= 60) return 'bg-yellow-50 border-yellow-200';
        if (score >= 40) return 'bg-orange-50 border-orange-200';
        return 'bg-red-50 border-red-200';
    };

    const getTextColor = (score) => {
        if (score >= 80) return 'text-green-700';
        if (score >= 60) return 'text-yellow-700';
        if (score >= 40) return 'text-orange-700';
        return 'text-red-700';
    };

    const getBarColor = (score) => {
        if (score >= 80) return 'bg-green-600';
        if (score >= 60) return 'bg-yellow-600';
        if (score >= 40) return 'bg-orange-600';
        return 'bg-red-600';
    };

    const getStatusBadge = (score) => {
        if (score >= 80) return { text: 'Excellent', icon: '✨' };
        if (score >= 60) return { text: 'Good', icon: '👍' };
        if (score >= 40) return { text: 'Fair', icon: '⚠️' };
        return { text: 'Challenging', icon: '⛔' };
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-200 mb-6">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="inline-block animate-spin mb-4">
                            <TrendingUp size={32} className="text-blue-600" />
                        </div>
                        <p className="text-gray-600 font-semibold">Loading confidence metrics...</p>
                        <p className="text-sm text-gray-500 mt-1">Analyzing safety, weather, crowds & language</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-200 mb-6">
                <div className="flex items-center gap-3 text-red-600">
                    <AlertCircle size={24} />
                    <div>
                        <p className="font-semibold">{error}</p>
                        <button
                            onClick={fetchMetrics}
                            className="text-sm mt-2 px-4 py-1 bg-red-100 rounded hover:bg-red-200 transition"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!scores) return null;

    const metrics = [
        {
            icon: Activity,
            label: 'Safety Score',
            score: scores.safety,
            color: 'text-red-600',
            description: 'Crime & security index',
            source: 'Wikidata'
        },
        {
            icon: Users,
            label: 'Crowd Level',
            score: scores.crowd,
            color: 'text-purple-600',
            description: 'Tourist density (higher = less crowded)',
            source: 'Smart Algorithm'
        },
        {
            icon: Cloud,
            label: 'Weather Comfort',
            score: scores.weather,
            color: 'text-cyan-600',
            description: 'Temperature & humidity comfort',
            source: 'OpenWeather'
        },
        {
            icon: Globe,
            label: 'Language Friendly',
            score: scores.language,
            color: 'text-green-600',
            description: 'English friendliness index',
            source: 'Local Data'
        }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-200 mb-6">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">🌍 Travel Confidence Meter</h2>
                    <button
                        onClick={fetchMetrics}
                        className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                    >
                        Refresh
                    </button>
                </div>
                <p className="text-sm text-gray-600">Comprehensive travel readiness analysis for {destination}</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {metrics.map((metric, idx) => {
                    const Icon = metric.icon;
                    const status = getStatusBadge(metric.score);

                    return (
                        <div
                            key={idx}
                            className={`p-4 rounded-lg border ${getMeterColor(metric.score)} transition-all hover:shadow-md`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Icon size={20} className={metric.color} />
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">{metric.label}</p>
                                        <p className="text-xs text-gray-500">{metric.source}</p>
                                    </div>
                                </div>
                                <span className="text-lg">{status.icon}</span>
                            </div>

                            <p className={`text-3xl font-bold mb-2 ${getTextColor(metric.score)}`}>
                                {metric.score}
                            </p>

                            <div className="mb-2">
                                <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${getBarColor(metric.score)}`}
                                        style={{ width: `${metric.score}%` }}
                                    ></div>
                                </div>
                            </div>

                            <p className="text-xs text-gray-600">{metric.description}</p>
                            <p className={`text-xs font-semibold mt-2 ${getTextColor(metric.score)}`}>
                                {status.text}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Overall Score Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Overall Confidence Score</p>
                        <p className="text-gray-600 text-sm">Your trip readiness assessment</p>
                    </div>
                    <span className="text-4xl font-bold text-blue-600">{scores.overall}</span>
                </div>

                <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
                    <div
                        className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                        style={{ width: `${scores.overall}%` }}
                    ></div>
                </div>

                <div className="mt-3 text-center">
                    <p className={`text-sm font-semibold ${scores.overall >= 80 ? 'text-green-600' :
                        scores.overall >= 60 ? 'text-yellow-600' :
                            scores.overall >= 40 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                        {scores.overall >= 80 && '✨ Excellent! Great destination choice!'}
                        {scores.overall >= 60 && scores.overall < 80 && '👍 Good choice! You\'re well-prepared.'}
                        {scores.overall >= 40 && scores.overall < 60 && '⚠️ Fair - Consider these factors before traveling.'}
                        {scores.overall < 40 && '⛔ Challenging conditions - Plan carefully!'}
                    </p>
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm">💡 Travel Tips</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                    {scores.safety >= 80 && <li>✅ Safety: Excellent security rating</li>}
                    {scores.safety < 60 && <li>⚠️ Safety: Check latest travel advisories</li>}

                    {scores.crowd >= 80 && <li>✅ Crowds: Less crowded - great for exploration</li>}
                    {scores.crowd < 40 && <li>⚠️ Crowds: Peak season - expect larger crowds</li>}

                    {scores.weather >= 75 && <li>✅ Weather: Perfect travel conditions</li>}
                    {scores.weather < 50 && <li>⚠️ Weather: Pack for extreme conditions</li>}

                    {scores.language >= 75 && <li>✅ Language: Great English infrastructure</li>}
                    {scores.language < 50 && <li>💬 Language: Consider translation apps & guides</li>}
                </ul>
            </div>
        </div>
    );
};

export default ConfidenceMeter;