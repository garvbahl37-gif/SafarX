
export const MOCK_GROUPS = [
  {
    groupId: "grp_demo_ladakh_winter",
    name: "Ladakh Winter Expedition",
    description: "Join our small-group winter expedition across frozen Ladakh. Chadar-season landscapes, monastery stays in Thiksey, and expert high-altitude guides with all gear provided.",
    destination: {
      city: "Leh",
      country: "India",
      coordinates: { lat: 34.1526, lng: 77.5771 }
    },
    travelDates: {
      startDate: "2027-01-15",
      endDate: "2027-01-24"
    },
    type: "public",
    category: "adventure",
    maxMembers: 15,
    language: "en",
    image: "https://images.unsplash.com/photo-1536295243470-d7cba4efab7b?w=800",
    members: [],
    memberCount: 12,
    upcomingMeetups: [],
    stats: { totalMessages: 450, activeMembers: 10 },
    verified: true
  },
  {
    groupId: "grp_demo_rajasthan_retreat",
    name: "Rajasthan Haveli & Food Retreat",
    description: "Experience royal Rajasthan slowly. Heritage haveli stays in Udaipur, laal maas cooking classes, miniature painting workshops, and sunset boat rides on Lake Pichola.",
    destination: {
      city: "Udaipur",
      country: "India",
      coordinates: { lat: 24.5854, lng: 73.7125 }
    },
    travelDates: {
      startDate: "2026-11-05",
      endDate: "2026-11-12"
    },
    type: "public",
    category: "food",
    maxMembers: 20,
    language: "en",
    image: "https://images.unsplash.com/photo-1561312514-1d71b2b7e495?w=800",
    members: [],
    memberCount: 18,
    upcomingMeetups: [],
    stats: { totalMessages: 320, activeMembers: 15 },
    verified: true
  },
  {
    groupId: "grp_demo_varanasi_dawn",
    name: "Varanasi Dawn Photography Tour",
    description: "Capture the ghats of Kashi at first light. Private dawn boat charters, evening Ganga aarti shoots, and portrait walks through the old city with a working photojournalist.",
    destination: {
      city: "Varanasi",
      country: "India",
      coordinates: { lat: 25.3176, lng: 82.9739 }
    },
    travelDates: {
      startDate: "2026-10-20",
      endDate: "2026-10-27"
    },
    type: "public",
    category: "photography",
    maxMembers: 12,
    language: "en",
    image: "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800",
    members: [],
    memberCount: 10,
    upcomingMeetups: [],
    stats: { totalMessages: 510, activeMembers: 9 },
    verified: true
  },
  {
    groupId: "grp_demo_thar_glamping",
    name: "Thar Desert Glamping Safari",
    description: "Luxury camping under Thar desert stars near Jaisalmer. Camel treks through the Sam dunes, Manganiyar folk music by the fire, and golden-hour views of the living fort.",
    destination: {
      city: "Jaisalmer",
      country: "India",
      coordinates: { lat: 26.9157, lng: 70.9083 }
    },
    travelDates: {
      startDate: "2026-12-10",
      endDate: "2026-12-17"
    },
    type: "public",
    category: "adventure",
    maxMembers: 25,
    language: "en",
    image: "https://images.unsplash.com/photo-1564509261027-29e141e2c598?w=800",
    members: [],
    memberCount: 22,
    upcomingMeetups: [],
    stats: { totalMessages: 280, activeMembers: 18 },
    verified: true
  },
  {
    groupId: "grp_demo_gulmarg_ski",
    name: "Gulmarg Powder Ski Week",
    description: "Ride the Gulmarg gondola to 3,900 metres and ski the Himalayan powder of the Apharwat bowls. For intermediate and advanced skiers; avalanche gear and guides included.",
    destination: {
      city: "Gulmarg",
      country: "India",
      coordinates: { lat: 34.0484, lng: 74.3805 }
    },
    travelDates: {
      startDate: "2027-01-20",
      endDate: "2027-01-27"
    },
    type: "public",
    category: "sports",
    maxMembers: 10,
    language: "en",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    members: [],
    memberCount: 8,
    upcomingMeetups: [],
    stats: { totalMessages: 190, activeMembers: 8 },
    verified: true
  },
  {
    groupId: "grp_demo_andaman_dive",
    name: "Andaman Reef Dive Crew",
    description: "Liveaboard diving out of Havelock. Manta cleaning stations, coral gardens at Dixon's Pinnacle, and PADI certification dives in some of India's clearest water.",
    destination: {
      city: "Havelock Island",
      country: "India",
      coordinates: { lat: 11.9762, lng: 92.9615 }
    },
    travelDates: {
      startDate: "2026-11-10",
      endDate: "2026-11-20"
    },
    type: "public",
    category: "adventure",
    maxMembers: 16,
    language: "en",
    image: "https://images.unsplash.com/photo-1542429296407-20c78e10f375?w=800",
    members: [],
    memberCount: 14,
    upcomingMeetups: [],
    stats: { totalMessages: 410, activeMembers: 12 },
    verified: true
  },
  {
    groupId: "grp_jaipur_heritage",
    name: "Jaipur Heritage Circle",
    description: "Exploring the Pink City's forts, stepwells and bazaars together. We plan to visit Amber Fort, Panna Meena ka Kund and the block-print workshops of Sanganer.",
    destination: {
      city: "Jaipur",
      country: "India",
      coordinates: { lat: 26.9124, lng: 75.7873 }
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
      { userId: "user_1", username: "priya_travels", avatar: "https://i.pravatar.cc/150?u=priya", role: "admin", verified: true, joinedAt: "2025-12-01", safetyScore: 9.8, status: "online" },
      { userId: "user_2", username: "arjun_explorer", avatar: "https://i.pravatar.cc/150?u=arjun", role: "moderator", verified: true, joinedAt: "2026-01-15", safetyScore: 9.2, status: "online" },
      { userId: "user_3", username: "meera_w", avatar: "https://i.pravatar.cc/150?u=meera", role: "member", verified: false, joinedAt: "2026-02-10", safetyScore: 6.5, status: "offline" },
      { userId: "user_4", username: "kabir_guide", avatar: "https://i.pravatar.cc/150?u=kabir", role: "member", verified: true, joinedAt: "2026-02-05", safetyScore: 8.9, status: "offline" },
      { userId: "user_7", username: "dev_hiker", avatar: "https://i.pravatar.cc/150?u=dev", role: "member", verified: true, joinedAt: "2026-02-20", safetyScore: 8.5, status: "online" },
      { userId: "user_8", username: "lakshmi_photo", avatar: "https://i.pravatar.cc/150?u=lakshmi", role: "member", verified: false, joinedAt: "2026-02-22", safetyScore: 5.5, status: "offline" },
      { userId: "user_9", username: "rohan_foodie", avatar: "https://i.pravatar.cc/150?u=rohan", role: "member", verified: true, joinedAt: "2026-02-25", safetyScore: 7.8, status: "offline" },
      { userId: "user_10", username: "ananya_art", avatar: "https://i.pravatar.cc/150?u=ananya", role: "member", verified: true, joinedAt: "2026-02-28", safetyScore: 9.0, status: "online" },
    ],
    memberCount: 16,
    upcomingMeetups: ["meet_amber", "meet_chai"],
    stats: { totalMessages: 347, activeMembers: 9 },
    verified: true
  },
  {
    groupId: "grp_delhi_food",
    name: "Old Delhi Foodie Adventure",
    description: "Paratha hunting in Chandni Chowk, kebabs at Jama Masjid, and daulat ki chaat before it sells out. Join us for a culinary journey through the walled city.",
    destination: {
      city: "Delhi",
      country: "India",
      coordinates: { lat: 28.6562, lng: 77.241 }
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
      { userId: "user_5", username: "chef_vikram", avatar: "https://i.pravatar.cc/150?u=vikram", role: "admin", verified: true },
      { userId: "user_6", username: "chaat_lover", avatar: "https://i.pravatar.cc/150?u=chaat", role: "member", verified: true }
    ],
    memberCount: 8,
    upcomingMeetups: [],
    stats: { totalMessages: 120, activeMembers: 5 },
    verified: false
  },
  {
    groupId: "grp_goa_digital_nomads",
    name: "Goa Digital Nomads",
    description: "Coworking, surfing, and networking in Anjuna and Assagao. Perfect for remote workers looking for community between deadlines and beach sunsets.",
    destination: {
      city: "Goa",
      country: "India",
      coordinates: { lat: 15.2993, lng: 74.124 }
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
    groupId: "grp_kolkata_history",
    name: "Kolkata Heritage Walkers",
    description: "Weekend walks through historic Calcutta. From Dalhousie Square's colonial facades to the potters of Kumartuli. Adda and kathi rolls included!",
    destination: {
      city: "Kolkata",
      country: "India",
      coordinates: { lat: 22.5726, lng: 88.3639 }
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
    groupId: "grp_mumbai_photography",
    name: "Mumbai Street Snappers",
    description: "Capture the energy of Mumbai. Sunrise at Sassoon Dock, the dabbawalas at Churchgate, and golden hour on Marine Drive.",
    destination: {
      city: "Mumbai",
      country: "India",
      coordinates: { lat: 19.076, lng: 72.8777 }
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
    name: "Goa Beach & Yoga",
    description: "Relaxing yoga sessions by the beach, sunset drum circles, and exploring North Goa's vibes.",
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
    name: "Manali Trekking Club",
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
    groupId: "grp_bodhgaya_zen",
    name: "Bodh Gaya Meditation Circle",
    description: "Peaceful days around the Mahabodhi Temple. Vipassana sittings, monastery visits, and quiet mornings under the Bodhi tree.",
    destination: {
      city: "Bodh Gaya",
      country: "India",
      coordinates: { lat: 24.6961, lng: 84.9871 }
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
    groupId: "grp_spiti_roadtrip",
    name: "Spiti Circuit Road Trip",
    description: "Epic road trip through the Spiti Valley chasing high passes, Key Monastery, and the world's highest post office at Hikkim.",
    destination: {
      city: "Kaza",
      country: "India",
      coordinates: { lat: 32.227, lng: 78.0715 }
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
    groupId: "grp_amritsar_food",
    name: "Taste of Amritsar",
    description: "Kulchas, lassi in clay glasses, and langar at the Golden Temple. A culinary walking tour through Punjab's holiest city.",
    destination: {
      city: "Amritsar",
      country: "India",
      coordinates: { lat: 31.62, lng: 74.8765 }
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
    message: "Priya invited you to join Jaipur Heritage Circle",
    timestamp: Date.now() - 3600000,
    read: false,
    data: { groupId: "grp_jaipur_heritage" }
  },
  {
    id: "notif_2",
    type: "MEETUP_REMINDER",
    message: "Reminder: Amber Fort Sunrise Walk starts in 1 hour",
    timestamp: Date.now() - 7200000,
    read: true,
    data: { meetupId: "meet_amber" }
  },
  {
    id: "notif_3",
    type: "NEW_MESSAGE",
    message: "5 new messages in Jaipur Heritage Circle",
    timestamp: Date.now() - 86400000,
    read: true,
    data: { groupId: "grp_jaipur_heritage" }
  }
];

export const MOCK_MESSAGES = {
  "grp_jaipur_heritage": [
    {
      messageId: "msg_1",
      userId: "user_1",
      username: "priya_travels",
      userAvatar: "https://i.pravatar.cc/150?u=priya",
      text: "Hey everyone! Who's excited for the Amber Fort walk tomorrow?",
      timestamp: Date.now() - 86400000,
      type: "text",
      reactions: { "👍": ["user_2", "user_3"] }
    },
    {
      messageId: "msg_2",
      userId: "user_2",
      username: "arjun_explorer",
      userAvatar: "https://i.pravatar.cc/150?u=arjun",
      text: "Can't wait! I've been dying to see the Sheesh Mahal",
      timestamp: Date.now() - 86000000,
      type: "text",
      reactions: { "🔥": ["user_1"] }
    },
    {
      messageId: "msg_3",
      userId: "user_1",
      username: "priya_travels",
      userAvatar: "https://i.pravatar.cc/150?u=priya",
      type: "location",
      location: {
        latitude: 26.9855,
        longitude: 75.8513,
        name: "Amber Fort Main Gate"
      },
      timestamp: Date.now() - 85000000,
    }
  ]
};

export const MOCK_MEETUPS = [
  {
    meetupId: "meet_amber",
    groupId: "grp_jaipur_heritage",
    title: "Amber Fort Sunrise Walk",
    description: "Let's explore Amber Fort together! We'll meet at the main gate before the crowds and spend 2-3 hours inside, ending at Panna Meena ka Kund.",
    dateTime: "2026-03-16T06:30:00Z",
    duration: 180,
    location: {
      name: "Amber Fort",
      address: "Devisinghpura, Amer, Jaipur, Rajasthan 302001",
      coordinates: { lat: 26.9855, lng: 75.8513 }
    },
    attendees: [
      { userId: "user_1", username: "priya_travels", status: "going", userAvatar: "https://i.pravatar.cc/150?u=priya" },
      { userId: "user_2", username: "arjun_explorer", status: "going", userAvatar: "https://i.pravatar.cc/150?u=arjun" },
      { userId: "user_3", username: "meera_w", status: "maybe", userAvatar: "https://i.pravatar.cc/150?u=meera" }
    ],
    maxAttendees: 10,
    meetupType: "activity",
    costPerPerson: 500,
    status: "upcoming",
    createdBy: { userId: "user_1", username: "priya_travels" },
    publicMeetup: true
  }
];

export const CURRENT_USER = {
  userId: "user_current",
  username: "safar_yatri",
  displayName: "Aarav Traveler",
  avatar: "https://i.pravatar.cc/150?u=aarav",
  safelyScore: 9.5
};
