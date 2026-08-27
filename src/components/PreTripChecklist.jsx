import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, Circle, Plus, Trash2, AlertCircle, Download, Share2, MapPin, Calendar, ClipboardList } from 'lucide-react';
import ConfidenceMeter from './ConfidenceMeter';
import { getCoordinates } from '../services/confidenceService';

const PreTripChecklist = () => {
    const [checklists, setChecklists] = useState([]);
    const [activeChecklist, setActiveChecklist] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [newTrip, setNewTrip] = useState({
        trip_name: '',
        destination: '',
        travel_date: ''
    });
    const [coordinates, setCoordinates] = useState(null);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('safar360_checklists');
        if (saved) {
            const parsed = JSON.parse(saved);
            setChecklists(parsed);
            if (parsed.length > 0) {
                setActiveChecklist(parsed[0]);
            }
        }
    }, []);

    // Save to localStorage whenever checklists change
    useEffect(() => {
        if (checklists.length > 0) {
            localStorage.setItem('safar360_checklists', JSON.stringify(checklists));
        }
    }, [checklists]);

    // Fetch coordinates when destination changes
    useEffect(() => {
        if (activeChecklist?.destination) {
            fetchDestinationCoordinates(activeChecklist.destination);
        }
    }, [activeChecklist?.destination]);

    const fetchDestinationCoordinates = async (destination) => {
        try {
            const coords = await getCoordinates(destination);
            if (coords) {
                setCoordinates(coords);
            } else {
                // Default to India if coordinates not found
                setCoordinates({ lat: 20.5937, lng: 78.9629 });
            }
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            setCoordinates({ lat: 20.5937, lng: 78.9629 });
        }
    };

    const createNewChecklist = (e) => {
        e.preventDefault();

        if (!newTrip.trip_name || !newTrip.destination || !newTrip.travel_date) {
            toast.error('Fill in the trip name, destination, and travel date to create a checklist');
            return;
        }

        const newChecklist = {
            id: Date.now(),
            ...newTrip,
            items: Object.entries(DEFAULT_ITEMS).map(([category, items]) => ({
                category,
                items: items.map(item => ({ ...item, id: Math.random() }))
            })),
            createdAt: new Date().toISOString()
        };

        setChecklists([...checklists, newChecklist]);
        setActiveChecklist(newChecklist);
        setNewTrip({ trip_name: '', destination: '', travel_date: '' });
        setShowForm(false);
        toast.success('Checklist created');
    };

    const toggleItem = (categoryIndex, itemIndex) => {
        if (!activeChecklist) return;
        const updated = { ...activeChecklist };
        updated.items[categoryIndex].items[itemIndex].completed =
            !updated.items[categoryIndex].items[itemIndex].completed;
        setActiveChecklist(updated);
        setChecklists(checklists.map(c => c.id === updated.id ? updated : c));
    };

    const addCustomItem = (categoryIndex, itemName) => {
        if (!activeChecklist || !itemName.trim()) return;
        const updated = { ...activeChecklist };
        updated.items[categoryIndex].items.push({
            id: Math.random(),
            name: itemName,
            priority: 'medium',
            completed: false
        });
        setActiveChecklist(updated);
        setChecklists(checklists.map(c => c.id === updated.id ? updated : c));
        toast.success('Item added');
    };

    const deleteItem = (categoryIndex, itemIndex) => {
        if (!activeChecklist) return;
        const updated = { ...activeChecklist };
        updated.items[categoryIndex].items.splice(itemIndex, 1);
        setActiveChecklist(updated);
        setChecklists(checklists.map(c => c.id === updated.id ? updated : c));
        toast.success('Item removed');
    };

    const deleteChecklist = (id) => {
        const filtered = checklists.filter(c => c.id !== id);
        setChecklists(filtered);
        if (activeChecklist?.id === id) {
            setActiveChecklist(filtered[0] || null);
        }
        toast.success('Checklist deleted');
    };

    const downloadChecklist = () => {
        if (!activeChecklist) return;
        let content = `${activeChecklist.trip_name} - ${activeChecklist.destination}\n`;
        content += `Travel Date: ${activeChecklist.travel_date}\n\n`;
        activeChecklist.items.forEach(cat => {
            content += `\n${cat.category.toUpperCase()}\n`;
            content += `${'='.repeat(cat.category.length + 10)}\n`;
            cat.items.forEach(item => {
                const checked = item.completed ? '✓' : '✗';
                content += `[${checked}] ${item.name}\n`;
            });
        });
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', `${activeChecklist.trip_name}_checklist.txt`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success('Checklist downloaded');
    };

    const getProgressPercentage = () => {
        if (!activeChecklist) return 0;
        const total = activeChecklist.items.reduce((sum, cat) => sum + cat.items.length, 0);
        const completed = activeChecklist.items.reduce(
            (sum, cat) => sum + cat.items.filter(item => item.completed).length,
            0
        );
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    };

    const getCriticalItemsStatus = () => {
        if (!activeChecklist) return { total: 0, completed: 0 };
        const critical = activeChecklist.items.flatMap(cat =>
            cat.items.filter(item => item.priority === 'critical')
        );
        return {
            total: critical.length,
            completed: critical.filter(item => item.completed).length
        };
    };

    const criticalStatus = getCriticalItemsStatus();
    const progress = getProgressPercentage();

    const DEFAULT_ITEMS = {
        Documents: [
            { name: 'Passport', priority: 'critical', completed: false },
            { name: 'Visa (if required)', priority: 'critical', completed: false },
            { name: 'Travel Insurance', priority: 'high', completed: false },
            { name: 'Flight/Hotel Confirmations', priority: 'high', completed: false },
            { name: 'ID Card', priority: 'high', completed: false },
            { name: 'Driver\'s License', priority: 'medium', completed: false },
            { name: 'Credit Card & Bank Info', priority: 'high', completed: false }
        ],
        Health: [
            { name: 'Prescription Medications', priority: 'critical', completed: false },
            { name: 'Vaccination Certificates', priority: 'high', completed: false },
            { name: 'First Aid Kit', priority: 'medium', completed: false },
            { name: 'Sunscreen & Bug Spray', priority: 'medium', completed: false },
            { name: 'Travel Health Insurance Card', priority: 'high', completed: false }
        ],
        Clothing: [
            { name: 'Comfortable Walking Shoes', priority: 'high', completed: false },
            { name: 'Weather-Appropriate Clothing', priority: 'high', completed: false },
            { name: 'Underwear & Socks', priority: 'high', completed: false },
            { name: 'Comfortable Outfits', priority: 'high', completed: false },
            { name: 'Formal Wear (if needed)', priority: 'medium', completed: false },
            { name: 'Sleepwear', priority: 'high', completed: false },
            { name: 'Jacket/Sweater', priority: 'medium', completed: false }
        ],
        Electronics: [
            { name: 'Phone & Charger', priority: 'critical', completed: false },
            { name: 'Universal Power Adapter', priority: 'high', completed: false },
            { name: 'Power Bank', priority: 'high', completed: false },
            { name: 'Camera', priority: 'medium', completed: false },
            { name: 'Headphones', priority: 'medium', completed: false },
            { name: 'Laptop/Tablet', priority: 'medium', completed: false }
        ],
        Toiletries: [
            { name: 'Toothbrush & Toothpaste', priority: 'high', completed: false },
            { name: 'Deodorant', priority: 'medium', completed: false },
            { name: 'Shampoo & Conditioner', priority: 'medium', completed: false },
            { name: 'Skincare Products', priority: 'medium', completed: false },
            { name: 'Medications/Supplements', priority: 'high', completed: false },
            { name: 'Feminine Hygiene Products', priority: 'medium', completed: false },
            { name: 'Sunscreen', priority: 'high', completed: false }
        ],
        'Pre-Travel': [
            { name: 'Inform Bank of Travel Dates', priority: 'high', completed: false },
            { name: 'Check Flight Status', priority: 'high', completed: false },
            { name: 'Book Accommodations', priority: 'critical', completed: false },
            { name: 'Arrange Airport Transport', priority: 'high', completed: false },
            { name: 'Set Up Travel Itinerary', priority: 'medium', completed: false },
            { name: 'Buy Travel Insurance', priority: 'high', completed: false },
            { name: 'Download Offline Maps', priority: 'medium', completed: false }
        ]
    };

    const priorityBadge = (priority) => {
        if (priority === 'critical') {
            return (
                <span className="font-data text-[10px] uppercase tracking-[0.14em] bg-red-500/10 text-red-400 border border-red-500/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertCircle size={11} aria-hidden="true" /> Critical
                </span>
            );
        }
        if (priority === 'high') {
            return (
                <span className="font-data text-[10px] uppercase tracking-[0.14em] bg-saffron/10 text-saffron border border-saffron/25 px-2 py-0.5 rounded-full">
                    High
                </span>
            );
        }
        return (
            <span className="font-data text-[10px] uppercase tracking-[0.14em] bg-white/[0.05] text-ivory-faint border border-white/[0.08] px-2 py-0.5 rounded-full">
                Medium
            </span>
        );
    };

    return (
        <div className="min-h-screen pb-24 bg-ink-950">
            <div className="max-w-6xl mx-auto px-6 md:px-8 pt-10">

                {/* Header */}
                <div className="mb-12">
                    <p className="flex items-center gap-3 mb-5">
                        <span className="route-dot" />
                        <span className="eyebrow">Pre-departure</span>
                        <span className="route-line w-12 hidden sm:inline-block" />
                        <span className="eyebrow-muted">Packing checklist</span>
                    </p>
                    <h1 className="font-display text-4xl md:text-5xl font-light text-ivory tracking-tight leading-[1.08] mb-4">
                        Leave nothing on the <em className="font-medium italic text-saffron-bright">kitchen table</em>
                    </h1>
                    <p className="text-ivory-muted text-base md:text-lg max-w-2xl leading-relaxed">
                        Build a checklist per trip, track the critical items, and check your travel confidence for the destination.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Sidebar - Checklist List */}
                    <div className="lg:col-span-1">
                        <div className="bg-ink-800 rounded-2xl p-6 border border-white/[0.07] lg:sticky lg:top-24">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-display text-xl font-medium text-ivory">My trips</h2>
                                <button
                                    onClick={() => setShowForm(!showForm)}
                                    className="p-2 rounded-lg bg-saffron/10 border border-saffron/30 text-saffron hover:bg-saffron/20 transition-colors"
                                    aria-label={showForm ? 'Close new trip form' : 'Add a new trip'}
                                >
                                    <Plus size={18} className={`transition-transform duration-300 ${showForm ? 'rotate-45' : ''}`} aria-hidden="true" />
                                </button>
                            </div>

                            {showForm && (
                                <form onSubmit={createNewChecklist} className="mb-6 pb-6 border-b border-white/[0.07] space-y-4">
                                    <div>
                                        <label htmlFor="trip-name" className="form-label">Trip name</label>
                                        <input
                                            id="trip-name"
                                            type="text"
                                            placeholder="e.g. Winter in Rajasthan"
                                            value={newTrip.trip_name}
                                            onChange={(e) => setNewTrip({ ...newTrip, trip_name: e.target.value })}
                                            className="glass-input w-full !py-2.5 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="trip-destination" className="form-label">Destination</label>
                                        <input
                                            id="trip-destination"
                                            type="text"
                                            placeholder="e.g. Jaipur, Rajasthan"
                                            value={newTrip.destination}
                                            onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                                            className="glass-input w-full !py-2.5 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="trip-date" className="form-label">Travel date</label>
                                        <input
                                            id="trip-date"
                                            type="date"
                                            value={newTrip.travel_date}
                                            onChange={(e) => setNewTrip({ ...newTrip, travel_date: e.target.value })}
                                            className="glass-input w-full !py-2.5 text-sm [color-scheme:dark]"
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary w-full justify-center !py-2.5 text-sm">
                                        Create checklist
                                    </button>
                                </form>
                            )}

                            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                                {checklists.length === 0 ? (
                                    <p className="text-ivory-faint text-sm text-center py-8 leading-relaxed">
                                        No trips yet. Create your first checklist above.
                                    </p>
                                ) : (
                                    checklists.map((checklist) => (
                                        <div
                                            key={checklist.id}
                                            className={`p-3.5 rounded-xl transition-all border ${activeChecklist?.id === checklist.id
                                                ? 'bg-ink-700 border-saffron/40'
                                                : 'bg-ink-900/60 border-white/[0.07] hover:border-white/20'
                                                }`}
                                        >
                                            <button
                                                onClick={() => setActiveChecklist(checklist)}
                                                className="w-full text-left"
                                            >
                                                <p className="font-semibold text-ivory text-sm">{checklist.trip_name}</p>
                                                <p className="mt-1 font-data text-[11px] text-ivory-muted flex items-center gap-1.5">
                                                    <MapPin size={11} className="text-saffron/80" aria-hidden="true" /> {checklist.destination}
                                                </p>
                                                <p className="mt-0.5 font-data text-[11px] text-ivory-faint">
                                                    {new Date(checklist.travel_date).toLocaleDateString()}
                                                </p>
                                            </button>
                                            <button
                                                onClick={() => deleteChecklist(checklist.id)}
                                                className="mt-2 w-full text-xs text-ivory-faint hover:text-red-400 py-1 rounded transition-colors text-left"
                                            >
                                                Delete trip
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Confidence Meter + Checklist Items */}
                    <div className="lg:col-span-3">
                        {activeChecklist ? (
                            <>
                                {/* Confidence meter */}
                                {coordinates && (
                                    <ConfidenceMeter
                                        destination={activeChecklist.destination}
                                        coordinates={coordinates}
                                        travelDate={activeChecklist.travel_date}
                                    />
                                )}

                                {/* Progress card */}
                                <div className="bg-ink-800 rounded-2xl p-6 border border-white/[0.07] mb-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="font-display text-2xl font-medium text-ivory mb-1.5">{activeChecklist.trip_name}</h3>
                                            <p className="flex items-center gap-3 font-data text-[11px] uppercase tracking-[0.12em] text-ivory-muted">
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin size={11} className="text-saffron/80" aria-hidden="true" />
                                                    {activeChecklist.destination}
                                                </span>
                                                <span className="w-px h-3 bg-white/20" aria-hidden="true" />
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={11} className="text-saffron/80" aria-hidden="true" />
                                                    {new Date(activeChecklist.travel_date).toLocaleDateString()}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="flex gap-3 shrink-0">
                                            <button
                                                onClick={downloadChecklist}
                                                className="btn-ghost !px-4 !py-2 text-sm"
                                            >
                                                <Download size={15} aria-hidden="true" />
                                                <span className="hidden sm:inline">Download</span>
                                            </button>
                                            <button
                                                onClick={() => toast.success('Share link copied')}
                                                className="btn-ghost !px-4 !py-2 text-sm"
                                            >
                                                <Share2 size={15} aria-hidden="true" />
                                                <span className="hidden sm:inline">Share</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress stats */}
                                    <div className="grid grid-cols-3 gap-4 mb-5">
                                        <div className="bg-ink-900/70 p-4 rounded-xl border border-white/[0.06]">
                                            <p className="font-data text-[10px] uppercase tracking-[0.16em] text-ivory-faint mb-1.5">Progress</p>
                                            <p className="font-data text-2xl md:text-3xl font-medium text-saffron tabular-nums">{progress}%</p>
                                        </div>
                                        <div className="bg-ink-900/70 p-4 rounded-xl border border-white/[0.06]">
                                            <p className="font-data text-[10px] uppercase tracking-[0.16em] text-ivory-faint mb-1.5">Critical items</p>
                                            <p className="font-data text-2xl md:text-3xl font-medium text-ivory tabular-nums">
                                                {criticalStatus.completed}<span className="text-ivory-faint">/{criticalStatus.total}</span>
                                            </p>
                                        </div>
                                        <div className="bg-ink-900/70 p-4 rounded-xl border border-white/[0.06]">
                                            <p className="font-data text-[10px] uppercase tracking-[0.16em] text-ivory-faint mb-1.5">Items packed</p>
                                            <p className="font-data text-2xl md:text-3xl font-medium text-ivory tabular-nums">
                                                {activeChecklist.items.reduce((sum, cat) => sum + cat.items.filter(i => i.completed).length, 0)}
                                                <span className="text-ivory-faint">/{activeChecklist.items.reduce((sum, cat) => sum + cat.items.length, 0)}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Main progress bar */}
                                    <div
                                        className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden"
                                        role="progressbar"
                                        aria-valuenow={progress}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label="Packing progress"
                                    >
                                        <div
                                            className="bg-gradient-to-r from-saffron to-saffron-bright h-full transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Categories */}
                                <div className="space-y-6">
                                    {activeChecklist.items.map((category, catIndex) => (
                                        <div key={catIndex} className="bg-ink-800 rounded-2xl p-6 border border-white/[0.07]">
                                            <h3 className="flex items-center gap-3 mb-5">
                                                <span className="route-dot" aria-hidden="true" />
                                                <span className="font-display text-xl font-medium text-ivory">{category.category}</span>
                                                <span className="ml-auto font-data text-[11px] text-ivory-faint tabular-nums">
                                                    {category.items.filter(i => i.completed).length}/{category.items.length}
                                                </span>
                                            </h3>

                                            <div className="space-y-2.5 mb-4">
                                                {category.items.map((item, itemIndex) => (
                                                    <div
                                                        key={item.id}
                                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all border ${item.completed
                                                            ? 'bg-saffron/[0.06] border-saffron/25'
                                                            : 'bg-ink-900/60 border-white/[0.07] hover:border-white/20'
                                                            }`}
                                                    >
                                                        <button
                                                            onClick={() => toggleItem(catIndex, itemIndex)}
                                                            className="flex-shrink-0"
                                                            aria-label={item.completed ? `Mark ${item.name} as not packed` : `Mark ${item.name} as packed`}
                                                            aria-pressed={item.completed}
                                                        >
                                                            {item.completed ? (
                                                                <CheckCircle2 size={22} className="text-saffron" aria-hidden="true" />
                                                            ) : (
                                                                <Circle size={22} className="text-ivory-faint" aria-hidden="true" />
                                                            )}
                                                        </button>

                                                        <div className="flex-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                                                            <p className={`text-sm font-medium ${item.completed ? 'line-through text-ivory-faint' : 'text-ivory'}`}>
                                                                {item.name}
                                                            </p>
                                                            {priorityBadge(item.priority)}
                                                        </div>

                                                        <button
                                                            onClick={() => deleteItem(catIndex, itemIndex)}
                                                            className="flex-shrink-0 p-2 text-ivory-faint hover:text-red-400 rounded-lg transition-colors"
                                                            aria-label={`Remove ${item.name}`}
                                                        >
                                                            <Trash2 size={16} aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Add custom item */}
                                            <div className="pt-4 border-t border-white/[0.07]">
                                                <input
                                                    type="text"
                                                    placeholder={`Add an item to ${category.category.toLowerCase()} — press Enter`}
                                                    aria-label={`Add an item to ${category.category}`}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                                            addCustomItem(catIndex, e.target.value);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                    className="glass-input w-full !py-2.5 text-sm"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="bg-ink-800 rounded-2xl p-12 border border-white/[0.07] text-center">
                                <span className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-saffron/10 border border-saffron/25 flex items-center justify-center">
                                    <ClipboardList size={24} className="text-saffron" aria-hidden="true" />
                                </span>
                                <h3 className="font-display text-2xl font-medium text-ivory mb-2">No checklist yet</h3>
                                <p className="text-ivory-muted mb-8 max-w-sm mx-auto leading-relaxed">
                                    Create a checklist for your next trip and SafarX will pre-fill the essentials.
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="btn-primary"
                                >
                                    <Plus size={16} aria-hidden="true" />
                                    Create your first checklist
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreTripChecklist;
