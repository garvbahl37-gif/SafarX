
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { MOCK_GROUPS } from '../../data/socialMockData';
import GroupCard from './GroupCard';

const TravelMatchMaker = () => {
    const [step, setStep] = useState(0); // 0: Intro, 1: Loading, 2: Results
    const [matches, setMatches] = useState([]);

    const findMatches = () => {
        setStep(1);
        // Simulate AI processing
        setTimeout(() => {
            // Simple mock logic: just return first 2 groups as "matches"
            setMatches(MOCK_GROUPS.slice(0, 2));
            setStep(2);
        }, 2000);
    };

    return (
        <div className="bg-gradient-to-br from-sky-50 to-blue-50/90 backdrop-blur-xl rounded-2xl p-6 text-gray-900 relative overflow-hidden shadow-2xl border border-white/50 max-w-lg mx-auto">
            
            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div 
                        key="intro"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center space-y-4"
                    >
                        <div>
                            <h2 className="text-xl font-bold mb-1 tracking-tight text-blue-900">Find Your Travel Tribe</h2>
                            <p className="text-blue-700/80 text-sm max-w-sm mx-auto font-medium leading-relaxed">
                                Analysis your travel style to find the perfect group.
                            </p>
                        </div>
                        <button 
                            onClick={findMatches}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 hover:scale-105 transform duration-200"
                        >
                            Find My Match
                        </button>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-8"
                    >
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <h3 className="text-sm font-bold text-blue-900">Analyzing profile...</h3>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div 
                         key="results"
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         className="space-y-4"
                    >
                        <div className="flex justify-between items-center border-b border-blue-100 pb-3">
                            <h3 className="text-sm font-bold flex items-center gap-2 text-blue-900">
                                Top Matches
                            </h3>
                            <button onClick={() => setStep(0)} className="text-xs font-bold text-blue-500 hover:text-blue-700">
                                Reset
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {matches.map(group => (
                                <div key={group.groupId} className="bg-white border border-blue-100 rounded-xl p-3 hover:shadow-md transition-all cursor-pointer group flex gap-3">
                                    {/* Image Restored */}
                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                        <img 
                                            src={group.image || "https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=200"} 
                                            alt={group.name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                                        />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-sm text-gray-900 truncate pr-2 group-hover:text-blue-600 transition-colors">{group.name}</h4>
                                            <span className="bg-green-50 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-100 flex-shrink-0">98%</span>
                                        </div>
                                        
                                        <div className="flex gap-3 text-[10px] font-medium text-gray-500 mb-2">
                                            <span className="flex items-center gap-1"><MapPin size={10} className="text-blue-400"/> {group.destination.city}</span>
                                            <span className="flex items-center gap-1"><Calendar size={10} className="text-blue-400"/> {group.travelDates.startDate}</span>
                                        </div>

                                        <button className="w-full bg-blue-50 text-blue-600 py-1 rounded-md font-bold hover:bg-blue-100 text-[10px] transition-colors">
                                            View Group
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default TravelMatchMaker;
