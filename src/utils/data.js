export const heritageData = [
  {
    id: 1,
    title: "Machu Picchu",
    state: "Peru",
    category: "UNESCO World Heritage Site",
    coords: { lat: -13.1631, lng: -72.5450 },
    description:
      "Machu Picchu is a 15th-century Incan citadel sitting high in the Andes Mountains. Built by the Inca emperor Pachacuti, it is one of the most iconic archaeological sites in the world.",
    images: [
      "https://images.unsplash.com/photo-1587595431973-160d0d163dad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    videos: ["_aGqIhNPMQE"],
    audiobook:
      "High above the clouds, the ancient Incan citadel of Machu Picchu stands as a testament to human ingenuity and spiritual connection with nature.",
    timeline: [
      { year: 1450, event: "Construction begins under Emperor Pachacuti" },
      { year: 1572, event: "Abandoned during Spanish Conquest" },
      { year: 1911, event: "Rediscovered by Hiram Bingham" },
      { year: 1983, event: "UNESCO World Heritage Site designation" },
    ],
    architecture: "Classical Inca",
    significance: "Icon of Incan civilization and engineering mastery",
    rating: 4.9,
    reviews_count: 25423,
    featured: true,
  },
  {
    id: 2,
    title: "Colosseum",
    state: "Italy",
    category: "UNESCO World Heritage Site",
    coords: { lat: 41.8902, lng: 12.4922 },
    description:
      "The Colosseum is an oval amphitheatre in the centre of Rome. It is the largest ancient amphitheatre ever built and could hold up to 80,000 spectators.",
    images: [
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    ],
    videos: ["LBnMEh6gDqM"],
    audiobook:
      "Within the grand arches of the Colosseum, the echoes of gladiators and roaring crowds still reverberate through two millennia of history.",
    timeline: [
      { year: 70, event: "Construction begins under Emperor Vespasian" },
      { year: 80, event: "Inaugurated by Emperor Titus" },
      { year: 1980, event: "UNESCO World Heritage Site designation" },
    ],
    architecture: "Roman",
    significance: "Symbol of the Roman Empire and ancient engineering",
    rating: 4.8,
    reviews_count: 32890,
    featured: true,
  },
  {
    id: 3,
    title: "Great Wall of China",
    state: "China",
    category: "UNESCO World Heritage Site",
    coords: { lat: 40.4319, lng: 116.5704 },
    description:
      "The Great Wall of China is a series of fortifications stretching over 13,000 miles, built to protect against invasions from the north.",
    images: [
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    ],
    significance:
      "World's longest man-made structure, symbol of perseverance and defense",
    rating: 4.9,
    reviews_count: 28765,
    featured: true,
  },
];

export const festivalsData = [
  {
    id: 101,
    title: "Carnival of Rio",
    state: "Brazil",
    category: "Cultural Celebration",
    date: "February-March",
    description:
      "The Rio Carnival is the world's largest carnival featuring samba parades, elaborate costumes, and music.",
    images: [
      "https://images.unsplash.com/photo-1551524559-8af4e6624178?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    ],
    significance:
      "Celebrates Brazilian culture, music, and the spirit of community",
    traditions: [
      "Samba parades at the Sambadrome",
      "Elaborate costume competitions",
      "Street parties across the city",
    ],
    rating: 4.9,
    reviews_count: 35678,
    featured: true,
  },
  {
    id: 102,
    title: "La Tomatina",
    state: "Spain",
    category: "Cultural Celebration",
    date: "August",
    description:
      "La Tomatina is a festival held in Buñol, Spain, featuring the world's largest tomato fight.",
    images: [
      "https://images.unsplash.com/photo-1505932794465-147d1f1b2c97?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80",
    ],
    significance: "Celebrates community joy and the harvest season",
    traditions: [
      "Massive tomato fight in the streets",
      "Music and dancing",
      "Traditional Spanish cuisine",
    ],
    rating: 4.7,
    reviews_count: 18923,
    featured: true,
  },
];

export const artsData = [
  {
    id: 201,
    title: "Flamenco",
    state: "Spain",
    category: "Traditional Dance",
    description:
      "Flamenco is a passionate art form from Andalusia, Spain, combining singing, guitar, dance, and handclaps.",
    images: [
      "https://images.unsplash.com/photo-1534329539004-63a0fb4a912f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    ],
    history:
      "Over 200 years old, blending Romani, Moorish, and Andalusian influences",
    characteristics: [
      "Passionate footwork (Zapateado)",
      "Expressive hand movements",
      "Rhythmic guitar accompaniment",
    ],
    rating: 4.8,
    reviews_count: 4456,
    featured: true,
  },
  {
    id: 202,
    title: "Ballet",
    state: "France / Russia",
    category: "Classical Dance",
    description:
      "Ballet is a highly technical form of dance with formal technique that originated in the Italian Renaissance courts and developed into a performance dance form in France and Russia.",
    images: [
      "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    ],
    history:
      "Evolved from 15th-century Italian courts, formalized in France under Louis XIV",
    characteristics: [
      "Pointe work (dancing on toes)",
      "Graceful turnouts and extensions",
      "Narrative storytelling through movement",
    ],
    rating: 4.7,
    reviews_count: 3890,
    featured: true,
  },
];

export const statesData = [
  {
    name: "France",
    code: "FR",
    capital: "Paris",
    heritage_count: 49,
    coords: { lat: 46.2276, lng: 2.2137 },
    description: "Home to the Eiffel Tower, Louvre, and rich cultural heritage",
  },
  {
    name: "Italy",
    code: "IT",
    capital: "Rome",
    heritage_count: 58,
    coords: { lat: 41.8719, lng: 12.5674 },
    description: "The Colosseum, Vatican, and Renaissance masterpieces",
  },
  {
    name: "Japan",
    code: "JP",
    capital: "Tokyo",
    heritage_count: 25,
    coords: { lat: 36.2048, lng: 138.2529 },
    description: "Ancient temples, cherry blossoms, and samurai history",
  },
];

export const hiddenGemsData = [
  {
    id: 301,
    title: "Plitvice Lakes",
    state: "Croatia",
    description:
      "Plitvice Lakes National Park features 16 terraced lakes joined by waterfalls, set in a deep woodland with stunning turquoise waters.",
    images: [
      "https://images.unsplash.com/photo-1555990538-17d3d48ef83e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    ],
    coords: { lat: 44.8654, lng: 15.5820 },
    significance:
      "Natural wonder showcasing stunning karst landscape and pristine lakes",
    rating: 4.8,
    reviews_count: 2876,
  },
];
