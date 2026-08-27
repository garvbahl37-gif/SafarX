
export const MOCK_GROUPS = [
  {
    groupId: "grp_demo_aurora_chasers",
    name: "Aurora Chasers Expedition 🌌",
    description: "Join our exclusive small-group expedition to chase the Northern Lights. We provide professional photography gear, cozy cabins, and expert guides.",
    destination: {
      city: "Tromso",
      country: "Norway",
      coordinates: { lat: 69.6492, lng: 18.9553 }
    },
    travelDates: {
      startDate: "2026-11-10",
      endDate: "2026-11-18"
    },
    type: "public",
    category: "adventure",
    maxMembers: 15,
    language: "en",
    image: "https://images.unsplash.com/photo-1579033461380-adb47c3eb938?q=80&w=3864&auto=format&fit=crop",
    members: [],
    memberCount: 12,
    upcomingMeetups: [],
    stats: { totalMessages: 450, activeMembers: 10 },
    verified: true
  },
  {
    groupId: "grp_demo_tuscany_retreat",
    name: "Tuscany Wine & Culinary Retreat 🍷",
    description: "Experience the pure essence of Italy. Private villa stays, authentic cooking classes, truffle hunting, and tasting the finest Chianti wines.",
    destination: {
      city: "Florence",
      country: "Italy",
      coordinates: { lat: 43.7696, lng: 11.2558 }
    },
    travelDates: {
      startDate: "2026-06-05",
      endDate: "2026-06-12"
    },
    type: "public",
    category: "food",
    maxMembers: 20,
    language: "en",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=3800&auto=format&fit=crop",
    members: [],
    memberCount: 18,
    upcomingMeetups: [],
    stats: { totalMessages: 320, activeMembers: 15 },
    verified: true
  },
  {
    groupId: "grp_demo_kyoto_blossoms",
    name: "Kyoto Sakura Photography Tour 🌸",
    description: "Capture the ephemeral beauty of cherry blossoms in ancient Kyoto. Early access to temples, traditional tea ceremonies, and geisha district walks.",
    destination: {
      city: "Kyoto",
      country: "Japan",
      coordinates: { lat: 35.0116, lng: 135.7681 }
    },
    travelDates: {
      startDate: "2026-03-25",
      endDate: "2026-04-05"
    },
    type: "public",
    category: "photography",
    maxMembers: 12,
    language: "en",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=3870&auto=format&fit=crop",
    members: [],
    memberCount: 10,
    upcomingMeetups: [],
    stats: { totalMessages: 510, activeMembers: 9 },
    verified: true
  },
  {
    groupId: "grp_demo_sahara_glamping",
    name: "Sahara Desert Glamping Safari 🐪",
    description: "Luxury camping under the Saharan stars. Camel treks, 4x4 dune bashing, traditional Berber music, and spectacular golden sunsets.",
    destination: {
      city: "Merzouga",
      country: "Morocco",
      coordinates: { lat: 31.0968, lng: -4.0125 }
    },
    travelDates: {
      startDate: "2026-10-15",
      endDate: "2026-10-22"
    },
    type: "public",
    category: "adventure",
    maxMembers: 25,
    language: "en",
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=3800&auto=format&fit=crop",
    members: [],
    memberCount: 22,
    upcomingMeetups: [],
    stats: { totalMessages: 280, activeMembers: 18 },
    verified: true
  },
  {
    groupId: "grp_demo_swiss_alps",
    name: "Swiss Alps Luxury Ski Week ⛷️",
    description: "Heliskiing, luxury chalets, and après-ski in Zermatt. For advanced skiers seeking the ultimate alpine thrill with a view of the Matterhorn.",
    destination: {
      city: "Zermatt",
      country: "Switzerland",
      coordinates: { lat: 46.0207, lng: 7.7491 }
    },
    travelDates: {
      startDate: "2027-01-20",
      endDate: "2027-01-27"
    },
    type: "public",
    category: "sports",
    maxMembers: 10,
    language: "en",
    image: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?q=80&w=3800&auto=format&fit=crop",
    members: [],
    memberCount: 8,
    upcomingMeetups: [],
    stats: { totalMessages: 190, activeMembers: 8 },
    verified: true
  },
  {
    groupId: "grp_demo_maldives_dive",
    name: "Maldives Manta Ray Dive 🤿",
    description: "Sail on a luxury liveaboard and dive with majestic manta rays and whale sharks in the crystal-clear waters of the Baa Atoll.",
    destination: {
      city: "Malé",
      country: "Maldives",
      coordinates: { lat: 4.1755, lng: 73.5093 }
    },
    travelDates: {
      startDate: "2026-08-10",
      endDate: "2026-08-20"
    },
    type: "public",
    category: "adventure",
    maxMembers: 16,
    language: "en",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=3870&auto=format&fit=crop",
    members: [],
    memberCount: 14,
    upcomingMeetups: [],
    stats: { totalMessages: 410, activeMembers: 12 },
    verified: true
  },
  {
    groupId: "grp_paris_art",
    name: "Art Lovers in Paris 🎨",
    description: "Exploring museums, galleries, and street art together. We plan to visit the Louvre, Orsay, and some hidden gems in Montmartre.",
    destination: {
      city: "Paris",
      country: "France",
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    travelDates: {
      startDate: "2026-03-15",
      endDate: "2026-03-22"
    },
    type: "public",
    category: "art-culture",
    maxMembers: 50,
    language: "en",
    members: [
      { userId: "user_1", username: "sarah_travels", avatar: "https://i.pravatar.cc/150?u=sarah", role: "admin", verified: true, joinedAt: "2025-12-01", safetyScore: 9.8, status: "online" },
      { userId: "user_2", username: "marco_explorer", avatar: "https://i.pravatar.cc/150?u=marco", role: "moderator", verified: true, joinedAt: "2026-01-15", safetyScore: 9.2, status: "online" },
      { userId: "user_3", username: "jenny_w", avatar: "https://i.pravatar.cc/150?u=jenny", role: "member", verified: false, joinedAt: "2026-02-10", safetyScore: 6.5, status: "offline" },
      { userId: "user_4", username: "alex_guide", avatar: "https://i.pravatar.cc/150?u=alex", role: "member", verified: true, joinedAt: "2026-02-05", safetyScore: 8.9, status: "offline" },
      { userId: "user_7", username: "david_hiker", avatar: "https://i.pravatar.cc/150?u=david", role: "member", verified: true, joinedAt: "2026-02-20", safetyScore: 8.5, status: "online" },
      { userId: "user_8", username: "lisa_photo", avatar: "https://i.pravatar.cc/150?u=lisa", role: "member", verified: false, joinedAt: "2026-02-22", safetyScore: 5.5, status: "offline" },
      { userId: "user_9", username: "tom_foodie", avatar: "https://i.pravatar.cc/150?u=tom", role: "member", verified: true, joinedAt: "2026-02-25", safetyScore: 7.8, status: "offline" },
      { userId: "user_10", username: "anna_art", avatar: "https://i.pravatar.cc/150?u=anna", role: "member", verified: true, joinedAt: "2026-02-28", safetyScore: 9.0, status: "online" },
    ],
    memberCount: 16,
    upcomingMeetups: ["meet_louvre", "meet_cafe"],
    stats: { totalMessages: 347, activeMembers: 9 },
    verified: true
  },
  {
    groupId: "grp_tokyo_food",
    name: "Tokyo Foodie Adventure 🍜",
    description: "Ramen hunting, sushi making classes, and izakaya hopping! Join us for a culinary journey through Tokyo.",
    destination: {
      city: "Tokyo",
      country: "Japan",
      coordinates: { lat: 35.6762, lng: 139.6503 }
    },
    travelDates: {
      startDate: "2026-04-10",
      endDate: "2026-04-20"
    },
    type: "public",
    category: "food",
    maxMembers: 30,
    language: "en",
    members: [
      { userId: "user_5", username: "chef_mike", avatar: "https://i.pravatar.cc/150?u=mike", role: "admin", verified: true },
      { userId: "user_6", username: "sushi_lover", avatar: "https://i.pravatar.cc/150?u=sushi", role: "member", verified: true }
    ],
    memberCount: 8,
    upcomingMeetups: [],
    stats: { totalMessages: 120, activeMembers: 5 },
    verified: false
  },
  {
    groupId: "grp_bali_digital_nomads",
    name: "Bali Digital Nomads 💻",
    description: "Coworking, surfing, and networking in Canggu and Ubud. Perfect for remote workers looking for community.",
    destination: {
      city: "Bali",
      country: "Indonesia",
      coordinates: { lat: -8.4095, lng: 115.1889 }
    },
    travelDates: {
      startDate: "2026-05-01",
      endDate: "2026-05-30"
    },
    type: "public",
    category: "work-travel",
    maxMembers: 100,
    language: "en",
    members: [],
    memberCount: 45,
    upcomingMeetups: [],
    stats: { totalMessages: 890, activeMembers: 30 },
    verified: true
  },
  {
    groupId: "grp_london_history",
    name: "London History Walkers 🇬🇧",
    description: "Weekend walks through historic London. From Roman walls to Victorian alleys. Pub lunch included!",
    destination: {
      city: "London",
      country: "UK",
      coordinates: { lat: 51.5074, lng: -0.1278 }
    },
    travelDates: {
      startDate: "2026-06-10",
      endDate: "2026-06-15"
    },
    type: "public",
    category: "history",
    maxMembers: 20,
    language: "en",
    members: [],
    memberCount: 12,
    upcomingMeetups: [],
    stats: { totalMessages: 50, activeMembers: 8 },
    verified: false
  },
  {
    groupId: "grp_nyc_photography",
    name: "NYC Street Snappers 📸",
    description: "Capture the energy of New York City. Sunrise at Brooklyn Bridge and sunset in Manhattan.",
    destination: {
      city: "New York",
      country: "USA",
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    travelDates: {
      startDate: "2026-07-01",
      endDate: "2026-07-07"
    },
    type: "public",
    category: "photography",
    maxMembers: 15,
    language: "en",
    members: [],
    memberCount: 8,
    upcomingMeetups: [],
    stats: { totalMessages: 200, activeMembers: 10 },
    verified: true
  },
  {
    groupId: "grp_goa_chill",
    name: "Goa Beach & Yoga 🧘‍♀️",
    description: "Relaxing yoga sessions by the beach, sunset parties, and exploring North Goa's vibes.",
    destination: {
      city: "Goa",
      country: "India",
      coordinates: { lat: 15.2993, lng: 74.1240 }
    },
    travelDates: {
      startDate: "2026-11-15",
      endDate: "2026-11-20"
    },
    type: "public",
    category: "wellness",
    maxMembers: 40,
    language: "en",
    members: [],
    memberCount: 25,
    upcomingMeetups: [],
    stats: { totalMessages: 150, activeMembers: 15 },
    verified: true
  },
  {
    groupId: "grp_manali_trek",
    name: "Manali Trekking Club 🏔️",
    description: "High altitude trekking in the Himalayas. Hampta Pass and Solang Valley expeditions.",
    destination: {
      city: "Manali",
      country: "India",
      coordinates: { lat: 32.2396, lng: 77.1887 }
    },
    travelDates: {
      startDate: "2026-08-05",
      endDate: "2026-08-12"
    },
    type: "public",
    category: "adventure",
    maxMembers: 12,
    language: "en",
    members: [],
    memberCount: 6,
    upcomingMeetups: [],
    stats: { totalMessages: 80, activeMembers: 6 },
    verified: false
  },
  {
    groupId: "grp_kyoto_zen",
    name: "Kyoto Zen Gardens 🏯",
    description: "Peaceful tours of Kyoto's temples and gardens. Tea ceremonies and meditation sessions.",
    destination: {
      city: "Kyoto",
      country: "Japan",
      coordinates: { lat: 35.0116, lng: 135.7681 }
    },
    travelDates: {
      startDate: "2026-04-01",
      endDate: "2026-04-07"
    },
    type: "public",
    category: "culture",
    maxMembers: 15,
    language: "en",
    members: [],
    memberCount: 10,
    upcomingMeetups: [],
    stats: { totalMessages: 60, activeMembers: 4 },
    verified: true
  },
  {
    groupId: "grp_iceland_roadtrip",
    name: "Iceland Ring Road 🚗",
    description: "Epic road trip around Iceland chasing waterfalls, geysers, and the Northern Lights.",
    destination: {
      city: "Reykjavik",
      country: "Iceland",
      coordinates: { lat: 64.1466, lng: -21.9426 }
    },
    travelDates: {
      startDate: "2026-09-10",
      endDate: "2026-09-20"
    },
    type: "public",
    category: "adventure",
    maxMembers: 8,
    language: "en",
    members: [],
    memberCount: 4,
    upcomingMeetups: [],
    stats: { totalMessages: 300, activeMembers: 4 },
    verified: true
  },
  {
    groupId: "grp_rome_food",
    name: "Taste of Rome 🍝",
    description: "Pizza, pasta, and gelato! A culinary walking tour through the eternal city's best eateries.",
    destination: {
      city: "Rome",
      country: "Italy",
      coordinates: { lat: 41.9028, lng: 12.4964 }
    },
    travelDates: {
      startDate: "2026-05-15",
      endDate: "2026-05-20"
    },
    type: "public",
    category: "food",
    maxMembers: 25,
    language: "en",
    members: [],
    memberCount: 18,
    upcomingMeetups: [],
    stats: { totalMessages: 110, activeMembers: 12 },
    verified: true
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: "notif_1",
    type: "GROUP_INVITE",
    message: "Sarah invited you to join Art Lovers in Paris",
    timestamp: Date.now() - 3600000,
    read: false,
    data: { groupId: "grp_paris_art" }
  },
  {
    id: "notif_2",
    type: "MEETUP_REMINDER",
    message: "Reminder: Louvre Museum Tour starts in 1 hour",
    timestamp: Date.now() - 7200000,
    read: true,
    data: { meetupId: "meet_louvre" }
  },
  {
    id: "notif_3",
    type: "NEW_MESSAGE",
    message: "5 new messages in Art Lovers in Paris",
    timestamp: Date.now() - 86400000,
    read: true,
    data: { groupId: "grp_paris_art" }
  }
];

export const MOCK_MESSAGES = {
  "grp_paris_art": [
    {
      messageId: "msg_1",
      userId: "user_1",
      username: "sarah_travels",
      userAvatar: "https://i.pravatar.cc/150?u=sarah",
      text: "Hey everyone! Who's excited for the Louvre meetup tomorrow?",
      timestamp: Date.now() - 86400000,
      type: "text",
      reactions: { "👍": ["user_2", "user_3"] }
    },
    {
      messageId: "msg_2",
      userId: "user_2",
      username: "marco_explorer",
      userAvatar: "https://i.pravatar.cc/150?u=marco",
      text: "Can't wait! I've been dying to see the Mona Lisa 🖼️",
      timestamp: Date.now() - 86000000,
      type: "text",
      reactions: { "🔥": ["user_1"] }
    },
    {
      messageId: "msg_3",
      userId: "user_1",
      username: "sarah_travels",
      userAvatar: "https://i.pravatar.cc/150?u=sarah",
      type: "location",
      location: {
        latitude: 48.8606,
        longitude: 2.3376,
        name: "Louvre Pyramid Entrance"
      },
      timestamp: Date.now() - 85000000,
    }
  ]
};

export const MOCK_MEETUPS = [
  {
    meetupId: "meet_louvre",
    groupId: "grp_paris_art",
    title: "Louvre Museum Tour",
    description: "Let's explore the Louvre together! We'll meet at the pyramid entrance and spend 2-3 hours inside.",
    dateTime: "2026-03-16T10:00:00Z",
    duration: 180,
    location: {
      name: "Louvre Museum",
      address: "Rue de Rivoli, 75001 Paris",
      coordinates: { lat: 48.8606, lng: 2.3376 }
    },
    attendees: [
      { userId: "user_1", username: "sarah_travels", status: "going", userAvatar: "https://i.pravatar.cc/150?u=sarah" },
      { userId: "user_2", username: "marco_explorer", status: "going", userAvatar: "https://i.pravatar.cc/150?u=marco" },
      { userId: "user_3", username: "jenny_w", status: "maybe", userAvatar: "https://i.pravatar.cc/150?u=jenny" }
    ],
    maxAttendees: 10,
    meetupType: "activity",
    costPerPerson: 17,
    status: "upcoming",
    createdBy: { userId: "user_1", username: "sarah_travels" },
    publicMeetup: true
  }
];

export const CURRENT_USER = {
  userId: "user_current",
  username: "traveler_joe",
  displayName: "Joe Traveler",
  avatar: "https://i.pravatar.cc/150?u=joe",
  safelyScore: 9.5
};
