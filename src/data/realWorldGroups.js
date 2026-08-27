export const REAL_WORLD_GROUPS = [
    // --- PARIS GROUPS (From Screenshots) ---
    {
        groupId: "real_paris_polyglot",
        name: "Denfert Café Polyglottes 🌍",
        description: "Practice languages in a friendly atmosphere! We meet every week to exchange in English, French, Spanish, and more. Open to all levels.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8338, lng: 2.3324 } },
        travelDates: { startDate: "2026-02-01", endDate: "2026-12-31" },
        type: "public",
        category: "Language Exchange",
        maxMembers: 500,
        memberCount: 219,
        image: "https://source.unsplash.com/800x600/?people,talking,cafe",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u1", avatar: "https://i.pravatar.cc/150?u=1" }, { userId: "u2", avatar: "https://i.pravatar.cc/150?u=2" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_sre",
        name: "SREday Paris – Site Reliability & DevOps",
        description: "A community for Site Reliability Engineers and DevOps professionals in Paris. Join us for tech talks, networking, and industry insights.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-03-10", endDate: "2026-03-10" },
        type: "public",
        category: "Technology",
        maxMembers: 100,
        memberCount: 14,
        image: "https://source.unsplash.com/800x600/?coding,server,tech",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u3", avatar: "https://i.pravatar.cc/150?u=3" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_stunning_tour",
        name: "Stunning Tour in Paris",
        description: "Walking tours through the most beautiful parts of Paris. Le Marais, Montmartre, and Latin Quarter. Discover the city's hidden gems.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-04-01", endDate: "2026-04-30" },
        type: "public",
        category: "Adventure",
        maxMembers: 50,
        memberCount: 36,
        image: "https://source.unsplash.com/800x600/?paris,walking,tour",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u4", avatar: "https://i.pravatar.cc/150?u=4" }, { userId: "u5", avatar: "https://i.pravatar.cc/150?u=5" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_outdoor_hikers",
        name: "Paris Outdoor Hikers 🥾",
        description: "We love hiking in nature! Join us for weekend hikes in Fontainebleau, Chevreuse, and other beautiful forests near Paris.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-02-15", endDate: "2026-11-30" },
        type: "public",
        category: "Hiking",
        maxMembers: 1000,
        memberCount: 377,
        image: "https://source.unsplash.com/800x600/?hiking,forest,nature",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u6", avatar: "https://i.pravatar.cc/150?u=6" }, { userId: "u7", avatar: "https://i.pravatar.cc/150?u=7" }, { userId: "u8", avatar: "https://i.pravatar.cc/150?u=8" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_decouvertes",
        name: "Paris découvertes",
        description: "Exploration urbaine et culturelle de Paris. Visites de musées, expos, et quartiers historiques.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-02-01", endDate: "2026-12-31" },
        type: "public",
        category: "Art & Culture",
        maxMembers: 100,
        memberCount: 53,
        image: "https://source.unsplash.com/800x600/?paris,museum,art",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u9", avatar: "https://i.pravatar.cc/150?u=9" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_expat_brit_amer",
        name: "Paris Expat British American Group",
        description: "Connecting British and American expats living in Paris. Social drinks, brunch, and networking.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 100,
        memberCount: 16,
        image: "https://source.unsplash.com/800x600/?friends,drinks,bar",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u10", avatar: "https://i.pravatar.cc/150?u=10" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_brunch",
        name: "Paris Brunch Experience 🥐",
        description: "For lovers of good food and coffee! We explore a new brunch spot in Paris every Sunday.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-02-01", endDate: "2026-12-31" },
        type: "public",
        category: "Food & Drink",
        maxMembers: 50,
        memberCount: 28,
        image: "https://source.unsplash.com/800x600/?brunch,croissant,coffee",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u11", avatar: "https://i.pravatar.cc/150?u=11" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_finance4tech",
        name: "Finance4Tech",
        description: "Bridging the gap between Finance and Technology. Meetups for fintech enthusiasts and professionals.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-03-15", endDate: "2026-03-15" },
        type: "public",
        category: "Business",
        maxMembers: 200,
        memberCount: 45,
        image: "https://source.unsplash.com/800x600/?finance,tech,meeting",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u12", avatar: "https://i.pravatar.cc/150?u=12" }, { userId: "u13", avatar: "https://i.pravatar.cc/150?u=13" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_photo",
        name: "Ateliers Photographies thématiques",
        description: "Thematic photography workshops in Paris and surroundings. Improve your skills and capture the city.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-04-05", endDate: "2026-04-05" },
        type: "public",
        category: "Photography",
        maxMembers: 30,
        memberCount: 89,
        image: "https://source.unsplash.com/800x600/?camera,paris,photo",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u14", avatar: "https://i.pravatar.cc/150?u=14" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_triathlon",
        name: "Paris Sport Club Triathlon 🏊🚴🏃",
        description: "Organisation des entrainements du Paris Sport Club Triathlon. Swimming, cycling, and running training.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 500,
        memberCount: 319,
        image: "https://source.unsplash.com/800x600/?triathlon,running,cycling",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u15", avatar: "https://i.pravatar.cc/150?u=15" }, { userId: "u16", avatar: "https://i.pravatar.cc/150?u=16" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_afterwork",
        name: "Afterwork Paris 🍸",
        description: "Bonjour à tous! Vous aimez les afterwork, nous aussi. Join us for drinks and networking after work hours.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Nightlife",
        maxMembers: 50000,
        memberCount: 30463,
        image: "https://source.unsplash.com/800x600/?cocktail,bar,party",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u17", avatar: "https://i.pravatar.cc/150?u=17" }, { userId: "u18", avatar: "https://i.pravatar.cc/150?u=18" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_fiesta",
        name: "Fiesta en Paris 💃",
        description: "Este grupo es para todos los latinos e hispanoparlantes que se encuentran en Paris. Salsa, Reggaeton, and good vibes!",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Dancing",
        maxMembers: 20000,
        memberCount: 15518,
        image: "https://source.unsplash.com/800x600/?dancing,party,music",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u19", avatar: "https://i.pravatar.cc/150?u=19" }, { userId: "u20", avatar: "https://i.pravatar.cc/150?u=20" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_boardgames",
        name: "Au Bonheur Des Jeux de Société 🎲",
        description: "Envie de rencontrer de nouvelles personnes ? Vous aimez jouer? Rencontrons-nous autour des jeux de société!",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Games",
        maxMembers: 15000,
        memberCount: 12684,
        image: "https://source.unsplash.com/800x600/?boardgames,friends,fun",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u21", avatar: "https://i.pravatar.cc/150?u=21" }, { userId: "u22", avatar: "https://i.pravatar.cc/150?u=22" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_hiking_power",
        name: "Power Hiking Paris",
        description: "Welcome to Power Hiking Paris, a registered non-profit hiking organization under French law. Serious hiking for fit people.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 15000,
        memberCount: 14258,
        image: "https://source.unsplash.com/800x600/?hiking,mountain,trail",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u23", avatar: "https://i.pravatar.cc/150?u=23" }, { userId: "u24", avatar: "https://i.pravatar.cc/150?u=24" }],
        upcomingMeetups: []
    },
     {
        groupId: "real_paris_intrepid",
        name: "Intrepid Hikers",
        description: "We are a fun and friendly international community of hikers that share an enjoyment for outdoors and adventurous activities.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 10000,
        memberCount: 6372,
        image: "https://source.unsplash.com/800x600/?adventure,forest,group",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u25", avatar: "https://i.pravatar.cc/150?u=25" }, { userId: "u26", avatar: "https://i.pravatar.cc/150?u=26" }],
        upcomingMeetups: []
    },
     {
        groupId: "real_paris_events_pec",
        name: "PEC (Paris Events Community) 🎉",
        description: "Join our WhatsApp Group for weekly event updates and live locations. We organize the best social parties in Paris.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 10000,
        memberCount: 6904,
        image: "https://source.unsplash.com/800x600/?party,eiffel,social",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u27", avatar: "https://i.pravatar.cc/150?u=27" }, { userId: "u28", avatar: "https://i.pravatar.cc/150?u=28" }],
        upcomingMeetups: []
    },
    // --- NEW ADDITIONS (Sports, Books, Culture) ---
    {
        groupId: "real_paris_pingpong",
        name: "Paris Ping-Pong & Culture Exchange 🏓",
        description: "This private membership club is for you to meet people who share the same passion for Ping-pong and Foreign cultures.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 100,
        memberCount: 25,
        image: "https://source.unsplash.com/800x600/?pingpong,tabletennis,sport",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u29", avatar: "https://i.pravatar.cc/150?u=29" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_urbanature",
        name: "Paris Travel Meetup - Urbanature Travel",
        description: "Welcome my fellow Urbanature travellers from Paris! We are looking to provide you with options to travel to amazing places.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-02-01", endDate: "2026-12-31" },
        type: "public",
        category: "Travel & Outdoor",
        maxMembers: 500,
        memberCount: 221,
        image: "https://source.unsplash.com/800x600/?travel,nature,group",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u30", avatar: "https://i.pravatar.cc/150?u=30" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_happy_walkers",
        name: "The Happy Walkers (Les Joyeux Marcheurs) 🚶",
        description: "We propose regular hikes in Île-de-France or elsewhere according to desires. The idea is to (re)discover our region.",
        destination: { city: "Ivry-sur-Seine", country: "France", coordinates: { lat: 48.8156, lng: 2.3848 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 5000,
        memberCount: 2551,
        image: "https://source.unsplash.com/800x600/?hiking,happy,group",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u31", avatar: "https://i.pravatar.cc/150?u=31" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_book_good_stories",
        name: "The Secret Society of Good Stories 📚",
        description: "Hello! This is an in-person social book club for women English speakers in Paris. As expats in Paris, our main goal is to meet.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Book Club",
        maxMembers: 2000,
        memberCount: 1377,
        image: "https://source.unsplash.com/800x600/?reading,books,cafe",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u32", avatar: "https://i.pravatar.cc/150?u=32" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_read_share",
        name: "Reading Club - Read & Share (Lire et Partager)",
        description: "Bonjour! I'm calling my project to create a reading club of French and foreign literature.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Book Club",
        maxMembers: 1000,
        memberCount: 444,
        image: "https://source.unsplash.com/800x600/?book,discussion,library",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u33", avatar: "https://i.pravatar.cc/150?u=33" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_french_films",
        name: "French Films / English Subtitles 🎬",
        description: "Lost in Frenchlation breaks the language barrier and brings the best of French cinema to the international community in Paris.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Art & Culture",
        maxMembers: 15000,
        memberCount: 9448,
        image: "https://source.unsplash.com/800x600/?cinema,movie,theater",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u34", avatar: "https://i.pravatar.cc/150?u=34" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_fantasy_books",
        name: "Fantasy & Reveries Book Club",
        description: "Welcome! Fantasy & Rêveries is a book club for fantasy, fantastic and science fiction books.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Book Club",
        maxMembers: 500,
        memberCount: 221,
        image: "https://source.unsplash.com/800x600/?fantasy,book,magic",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u35", avatar: "https://i.pravatar.cc/150?u=35" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_football_5",
        name: "Paris Five-a-side Football ⚽",
        description: "For anyone who wants a friendly five-a-side game. We play Friday nights. The game is open to all levels.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 2000,
        memberCount: 1298,
        image: "https://source.unsplash.com/800x600/?football,soccer,stadium",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u36", avatar: "https://i.pravatar.cc/150?u=36" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_intl_football",
        name: "International Football League - Paris",
        description: "Casual football games organized on synthetic pitches on Sunday mornings/afternoons in Paris.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 5000,
        memberCount: 2577,
        image: "https://source.unsplash.com/800x600/?soccer,team,match",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u37", avatar: "https://i.pravatar.cc/150?u=37" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_rugby",
        name: "Paris Tag Rugby Meetup 🏉",
        description: "Tag Rugby, also called Rugby Foulard, is a version of non-contact rugby. The game is played 7 vs 7 in teams.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 2000,
        memberCount: 1200,
        image: "https://source.unsplash.com/800x600/?rugby,sport,field",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u38", avatar: "https://i.pravatar.cc/150?u=38" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_cycling_pantin",
        name: "Pantin Cycling Sport (Cyclo Sport Pantin) 🚴",
        description: "Le CSP vous propose de pratiquer un sport dans une ambiance conviviale. Cycling group based in Pantin.",
        destination: { city: "Pantin", country: "France", coordinates: { lat: 48.8932, lng: 2.4042 } },
        travelDates: { startDate: "2026-03-01", endDate: "2026-10-31" },
        type: "public",
        category: "Sports",
        maxMembers: 500,
        memberCount: 254,
        image: "https://source.unsplash.com/800x600/?cycling,bicycle,race",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u39", avatar: "https://i.pravatar.cc/150?u=39" }],
        upcomingMeetups: []
    },
    // --- NEW ADDITIONS BATCH 2 (Sports, Yoga, Social) ---
    {
        groupId: "real_paris_up_sport",
        name: "Up Sport! United for Sport",
        description: "Association de sport solidaire, sans frontière et pour tous. Sport as a springboard for integration.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 200,
        memberCount: 59,
        image: "https://source.unsplash.com/800x600/?community,sport,group",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u40", avatar: "https://i.pravatar.cc/150?u=40" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_annecy_water",
        name: "Annecy Open Water (Eau Libre) 🏊",
        description: "Les personnes n'étant pas membres d'Annecy Eau Libre ne sont pas couvertes par l'assurance. Open water swimming enthusiasts.",
        destination: { city: "Annecy", country: "France", coordinates: { lat: 45.8992, lng: 6.1294 } },
        travelDates: { startDate: "2026-05-01", endDate: "2026-09-30" },
        type: "public",
        category: "Sports",
        maxMembers: 200,
        memberCount: 74,
        image: "https://source.unsplash.com/800x600/?swimming,lake,water",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u41", avatar: "https://i.pravatar.cc/150?u=41" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_english_spoken",
        name: "English Spoken Paris",
        description: "We will talk in English and have a good time together. Open to all levels.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Language Exchange",
        maxMembers: 5000,
        memberCount: 1111,
        image: "https://source.unsplash.com/800x600/?picnic,park,friends",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u42", avatar: "https://i.pravatar.cc/150?u=42" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_montreuil_rugby",
        name: "Montreuil Touch Rugby 🏉",
        description: "Le Touch Rugby, ou rugby touché, est une version sans plaquage. Il se pratique à 5 contre 5.",
        destination: { city: "Montreuil", country: "France", coordinates: { lat: 48.8638, lng: 2.4484 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 100,
        memberCount: 38,
        image: "https://source.unsplash.com/800x600/?rugby,field,grass",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u43", avatar: "https://i.pravatar.cc/150?u=43" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_bobigny_badminton",
        name: "Badminton - Le Prisme",
        description: "C'est un groupe qui se réunit pour jouer dans la salle multisports le Prisme à Bobigny. Tous niveaux.",
        destination: { city: "Bobigny", country: "France", coordinates: { lat: 48.9086, lng: 2.4397 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 50,
        memberCount: 18,
        image: "https://source.unsplash.com/800x600/?badminton,racket,court",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u44", avatar: "https://i.pravatar.cc/150?u=44" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_foot_5v5",
        name: "Paris 5v5 Football",
        description: "Un groupe pour tous ceux qui veulent jouer au foot en mode 5 contre 5 dans une ambiance conviviale.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 100,
        memberCount: 40,
        image: "https://source.unsplash.com/800x600/?football,night,turf",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u45", avatar: "https://i.pravatar.cc/150?u=45" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_yoga_animals",
        name: "Charity Yoga for Animals 🧘🐾",
        description: "Viens nous rejoindre pour prendre soin de toi et des animaux en même temps ! Yoga caritatif.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Wellness",
        maxMembers: 50,
        memberCount: 2,
        image: "https://source.unsplash.com/800x600/?yoga,cat,mat",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u46", avatar: "https://i.pravatar.cc/150?u=46" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_mixed_foot",
        name: "Mixed Football Club (Les Sportif.ve.s)",
        description: "Tu cherches à intégrer une équipe de foot pour jouer régulièrement sans pression et dans un cadre bienveillant ?",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 5000,
        memberCount: 1519,
        image: "https://source.unsplash.com/800x600/?football,team,mixed",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u47", avatar: "https://i.pravatar.cc/150?u=47" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_pilates",
        name: "Pilates in Paris",
        description: "Bonjour! Moi c'est Tami. Brésilienne installée en France depuis presque 4 ans, je suis professeure de Pilates.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Wellness",
        maxMembers: 500,
        memberCount: 150,
        image: "https://source.unsplash.com/800x600/?pilates,exercise,studio",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u48", avatar: "https://i.pravatar.cc/150?u=48" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_softball",
        name: "Softball Group Paris 🥎",
        description: "Venez jouer au Softball en indoor (gymnase des pyrénées). Découverte ou joueur-se-s initié-e-s bienvenue.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 200,
        memberCount: 89,
        image: "https://source.unsplash.com/800x600/?softball,baseball,glove",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u49", avatar: "https://i.pravatar.cc/150?u=49" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_rendez_do",
        name: "Rendez-Do: Singles Activities 🎨🍷",
        description: "Bienvenue aux célibataires parisiens qui ne croient plus aux applications de rencontres ! Activities for singles.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 5000,
        memberCount: 1611,
        image: "https://source.unsplash.com/800x600/?wine,painting,social",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u50", avatar: "https://i.pravatar.cc/150?u=50" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_practice_french",
        name: "Practice French with Native Speakers (TripMeeters)",
        description: "Découvrez le calendrier complet des sessions de groupe. Best way to practice French in a social setting.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Language Exchange",
        maxMembers: 10000,
        memberCount: 7107,
        image: "https://source.unsplash.com/800x600/?conversation,cafe,group",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u51", avatar: "https://i.pravatar.cc/150?u=51" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_dissident",
        name: "The Dissident Club",
        description: "The DISSIDENT club is an intellectual bar/cafe, where dissidents of the world meet. Run by Taha Siddiqui.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 2000,
        memberCount: 1095,
        image: "https://source.unsplash.com/800x600/?bar,cafe,discussion",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u52", avatar: "https://i.pravatar.cc/150?u=52" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_pub_quiz",
        name: "Pub Quiz in Paris ❓",
        description: "Looking for a Sunday, Monday, or Tuesday night activity? Paris Quiz Mistress at your service! Pop culture, music, general knowledge.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Nightlife",
        maxMembers: 10000,
        memberCount: 5880,
        image: "https://source.unsplash.com/800x600/?quiz,pub,night",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u53", avatar: "https://i.pravatar.cc/150?u=53" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_cozy_circle",
        name: "The Cozy Circle – Games, Connection & Chill",
        description: "A relaxed group for board games, meaningful connection, and chilling. No pressure, just good vibes.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 1000,
        memberCount: 500, // Estimated
        image: "https://source.unsplash.com/800x600/?friends,sofa,chill",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u54", avatar: "https://i.pravatar.cc/150?u=54" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_meet_connect",
        name: "Meet & Connect (Rencontrer & Connecter) 🌏",
        description: "Meet new people, make friends, and connect with locals and expats in Paris.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 2000,
        memberCount: 900, // Estimated
        image: "https://source.unsplash.com/800x600/?handshake,group,circle",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u55", avatar: "https://i.pravatar.cc/150?u=55" }],
        upcomingMeetups: []
    },
    // --- NEW ADDITIONS BATCH 3 (Speed Friending, Offline Club, Culture) ---
    {
        groupId: "real_paris_speed_friending",
        name: "SPEED FRIENDING FACTORY ✨",
        description: "Personnes totalement sympas ayant pour but de rencontrer du monde. A fun way to make new friends fast!",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 10000,
        memberCount: 4304,
        image: "https://source.unsplash.com/800x600/?handshake,friends,speed",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u56", avatar: "https://i.pravatar.cc/150?u=56" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_foreal_25_35",
        name: "Group Activities for 25-35s (foReal) 🎯",
        description: "Je veux rencontrer du monde, mais pas des gens bizarres. Littéralement tout le monde, avant de venir chez FoReal.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 1000,
        memberCount: 364,
        image: "https://source.unsplash.com/800x600/?group,young,fun",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u57", avatar: "https://i.pravatar.cc/150?u=57" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_wediscover",
        name: "WeDiscover - Internationals & Locals - Travel & Meetups",
        description: "We are a community of international people who love to have fun and go to the BEST PLACES in PARIS at the BEST PRICES.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Travel & Outdoor",
        maxMembers: 20000,
        memberCount: 15220,
        image: "https://source.unsplash.com/800x600/?party,nightclub,crowd",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u58", avatar: "https://i.pravatar.cc/150?u=58" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_budhiam",
        name: "Budhiam Community",
        description: "Budhiam - Plus qu'un simple groupe, une communauté discrète et engagée. Startup qui a misé sur l'humain.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Business",
        maxMembers: 200,
        memberCount: 66,
        image: "https://source.unsplash.com/800x600/?team,startup,group",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u59", avatar: "https://i.pravatar.cc/150?u=59" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_les_amis",
        name: "The Friends Paris | Women Community (Les Amis)",
        description: "Les Amis is a friendly women-only community in Paris. We organize multiple activities that let you meet friendly souls.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 5000,
        memberCount: 1903,
        image: "https://source.unsplash.com/800x600/?women,friends,smile",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u60", avatar: "https://i.pravatar.cc/150?u=60" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_offline_club",
        name: "The Offline Club Paris 📵",
        description: "Offline community hangouts & events to swap screen time for real time. Unplug, relax and connect with like-minded people.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Wellness",
        maxMembers: 500,
        memberCount: 209,
        image: "https://source.unsplash.com/800x600/?reading,coffee,relax",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u61", avatar: "https://i.pravatar.cc/150?u=61" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_hash_house",
        name: "Paris Hash House Harriers (Running) 🏃‍♂️🍺",
        description: "Do you like beer? Do you like running? Then Hashing is for you!!! What is Hashing? It's a running club with a drinking problem.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 5000,
        memberCount: 2242,
        image: "https://source.unsplash.com/800x600/?running,beer,fun",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u62", avatar: "https://i.pravatar.cc/150?u=62" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_art_more",
        name: "* ART & MORE * Paris",
        description: "If you like arts, if you enjoy good food and if you like to discover new things with new friends: this group is for you!",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Art & Culture",
        maxMembers: 5000,
        memberCount: 3055,
        image: "https://source.unsplash.com/800x600/?art,gallery,museum",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u63", avatar: "https://i.pravatar.cc/150?u=63" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_quedadas",
        name: "Meetups in Spanish and English (Quedadas) 🇪🇸🇬🇧",
        description: "We will be speaking in English or Spanish, depends the date, just have a look or feel free to ask me.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Language Exchange",
        maxMembers: 1000,
        memberCount: 645,
        image: "https://source.unsplash.com/800x600/?flags,conversation,group",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u64", avatar: "https://i.pravatar.cc/150?u=64" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_bubble_tea_mahjong",
        name: "Bubble Tea, Mahjong and Culture 🀄🧋",
        description: "Rejoignez-nous pour une après-midi conviviale autour du bubble tea et du Mahjong ! Friendly afternoon.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Games",
        maxMembers: 200,
        memberCount: 94,
        image: "https://source.unsplash.com/800x600/?mahjong,bubbletea,game",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u65", avatar: "https://i.pravatar.cc/150?u=65" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_girls_2030",
        name: "Girls. Girls. Girls, 20s-30s",
        description: "Quand on recommence sa vie ailleurs, ou qu'on a un emploi du temps surchargé, c'est compliqué de se faire de nouvelles copines.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 100,
        memberCount: 20,
        image: "https://source.unsplash.com/800x600/?girls,nightout,fun",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u66", avatar: "https://i.pravatar.cc/150?u=66" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_deutsch_sprechen",
        name: "Speak German / We speak French (Deutsch Sprechen) 🇩🇪🇫🇷",
        description: "La dernière soirée était encore une fois super sympa ! Venez discuter et s'amuser en français et/ou allemand.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Language Exchange",
        maxMembers: 2000,
        memberCount: 1497,
        image: "https://source.unsplash.com/800x600/?germany,france,flag",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u67", avatar: "https://i.pravatar.cc/150?u=67" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_curiosity",
        name: "Curiosity Connection Club 💡",
        description: "We are a bunch of open-minded and insatiably curious humans who love bringing people together in fun and meaningful ways.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 100,
        memberCount: 56,
        image: "https://source.unsplash.com/800x600/?curiosity,idea,bulb",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u68", avatar: "https://i.pravatar.cc/150?u=68" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_british_tea",
        name: "Paris British Tea and Tattle Society 🫖",
        description: "Are you passionate about British culture, history, cuisine, tea, and engaging in lively conversations? Look no further.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Food & Drink",
        maxMembers: 100,
        memberCount: 27,
        image: "https://source.unsplash.com/800x600/?tea,british,cup",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u69", avatar: "https://i.pravatar.cc/150?u=69" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_paris_croissant_connexions",
        name: "The Croissant Connexions 🥐",
        description: "Hello tout le monde! *(English below)* The Croissant Connexions est un groupe organisant des événements de networking.",
        destination: { city: "Paris", country: "France", coordinates: { lat: 48.8566, lng: 2.3522 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Business",
        maxMembers: 100,
        memberCount: 58,
        image: "https://source.unsplash.com/800x600/?croissant,meeting,coffee",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u70", avatar: "https://i.pravatar.cc/150?u=70" }],
        upcomingMeetups: []
    },
    // --- LONDON GROUPS (Activity/Paid Focus) ---
    {
        groupId: "real_london_walk_kew",
        name: "WALK: River Thames - KEW to PUTNEY 🍂",
        description: "Join us for a scenic 5-mile walk along the River Thames. We'll start at Kew Bridge and finish at Putney with a well-earned drink. Cost: £5.00 for organizers.",
        destination: { city: "London", country: "United Kingdom", coordinates: { lat: 51.4844, lng: -0.2952 } },
        travelDates: { startDate: "2026-02-15", endDate: "2026-02-15" },
        type: "public",
        category: "Hiking",
        maxMembers: 60,
        memberCount: 26,
        image: "https://source.unsplash.com/800x600/?river,thames,nature",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u11", avatar: "https://i.pravatar.cc/150?u=11" }, { userId: "u12", avatar: "https://i.pravatar.cc/150?u=12" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_london_badminton",
        name: "Badminton in EC1 Intermediate + (£12)",
        description: "Intermediate to Advanced Badminton session. Feather shuttles provided. 2 hours of competitive fun! £12 per session.",
        destination: { city: "London", country: "United Kingdom", coordinates: { lat: 51.5235, lng: -0.0967 } },
        travelDates: { startDate: "2026-01-28", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 24,
        memberCount: 21,
        image: "https://source.unsplash.com/800x600/?badminton,court,sports",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u13", avatar: "https://i.pravatar.cc/150?u=13" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_london_karaoke",
        name: "Music Trivia & Karaoke Mixer 🎤",
        description: "Sing your heart out and test your music knowledge! Great vibes, cocktails, and new friends. Free entry, drinks separate.",
        destination: { city: "London", country: "United Kingdom", coordinates: { lat: 51.5115, lng: -0.1198 } },
        travelDates: { startDate: "2026-01-28", endDate: "2026-12-31" },
        type: "public",
        category: "Party",
        maxMembers: 100,
        memberCount: 56,
        image: "https://source.unsplash.com/800x600/?karaoke,party,singing",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u14", avatar: "https://i.pravatar.cc/150?u=14" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_london_pub_walk",
        name: "London Society WALK & PUB",
        description: "A relaxed evening stroll from Embankment to Cannon Street, ending at a historic pub. Perfect for meeting new people.",
        destination: { city: "London", country: "United Kingdom", coordinates: { lat: 51.5079, lng: -0.1235 } },
        travelDates: { startDate: "2026-01-30", endDate: "2026-01-30" },
        type: "public",
        category: "Social",
        maxMembers: 100,
        memberCount: 11,
        image: "https://source.unsplash.com/800x600/?london,pub,night",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u15", avatar: "https://i.pravatar.cc/150?u=15" }],
        upcomingMeetups: []
    },

    // --- BERLIN GROUPS (Real Data from Screenshots) ---
    {
        groupId: "real_berlin_bellydance",
        name: "Berlin Bellydance/ Oriental Dance Group 💃",
        description: "Our group is a relaxed space where you can shape a beautiful physique, dance with confidence, and make new friends. Open to all levels. Great for fitness and fun!",
        destination: { city: "Berlin", country: "Germany", coordinates: { lat: 52.5200, lng: 13.4050 } },
        travelDates: { startDate: "2026-02-05", endDate: "2026-12-31" },
        type: "public",
        category: "Arts & Culture",
        maxMembers: 50,
        memberCount: 15,
        image: "https://source.unsplash.com/800x600/?bellydance,dance,studio",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_b1", avatar: "https://i.pravatar.cc/150?u=b1" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_berlin_sip_happens",
        name: "Sip Happens! Berlin 🍻",
        description: "Hello there! New to Berlin? Passing through? Join us for the best clubbing and bar crawl experiences. We explore hidden bars and techno clubs.",
        destination: { city: "Berlin", country: "Germany", coordinates: { lat: 52.5074, lng: 13.4397 } },
        travelDates: { startDate: "2026-01-30", endDate: "2026-12-31" },
        type: "public",
        category: "Party",
        maxMembers: 15000,
        memberCount: 12703,
        image: "https://source.unsplash.com/800x600/?party,club,drinks",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_b2", avatar: "https://i.pravatar.cc/150?u=b2" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_berlin_comedy",
        name: "East-West Comedy Berlin 🎭",
        description: "Hottest English comedy shows for chilly Berlin nights! A community dedicated to providing a warm and fun space for expats and international vibes.",
        destination: { city: "Berlin", country: "Germany", coordinates: { lat: 52.5200, lng: 13.4050 } },
        travelDates: { startDate: "2026-02-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 3000,
        memberCount: 2322,
        image: "https://source.unsplash.com/800x600/?comedy,stage,microphone",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_b3", avatar: "https://i.pravatar.cc/150?u=b3" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_berlin_hiking_playful",
        name: "Playful Berlin: Hikes & Activities 🥾",
        description: "We love bringing people together in fun and meaningful ways. Hiking trips to Grunewald, lakes, and urban nature walks. Perfect for outdoor lovers.",
        destination: { city: "Berlin", country: "Germany", coordinates: { lat: 52.5200, lng: 13.4050 } },
        travelDates: { startDate: "2026-03-15", endDate: "2026-11-30" },
        type: "public",
        category: "Hiking",
        maxMembers: 3000,
        memberCount: 2227,
        image: "https://source.unsplash.com/800x600/?hiking,forest,berlin",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_b4", avatar: "https://i.pravatar.cc/150?u=b4" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_berlin_lgbt",
        name: "Berlin LGBT Social Club 🏳️‍🌈",
        description: "An opportunity for LGBTQ+ folks to get together for drinks, clubbing, and social events in a safe and friendly environment.",
        destination: { city: "Berlin", country: "Germany", coordinates: { lat: 52.4938, lng: 13.4465 } },
        travelDates: { startDate: "2026-02-14", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 10000,
        memberCount: 9032,
        image: "https://source.unsplash.com/800x600/?lgbt,flag,pride",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_b5", avatar: "https://i.pravatar.cc/150?u=b5" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_berlin_vegan",
        name: "Berlin Vegan Social 🌱",
        description: "Welcome to the Vegan Berlin Meetup Group! Whether you are a dedicated vegan, plant-based eater, or just curious. We host dinners and potlucks.",
        destination: { city: "Berlin", country: "Germany", coordinates: { lat: 52.5200, lng: 13.4050 } },
        travelDates: { startDate: "2026-02-10", endDate: "2026-12-31" },
        type: "public",
        category: "Food & Drink",
        maxMembers: 5000,
        memberCount: 4661,
        image: "https://source.unsplash.com/800x600/?vegan,food,dinner",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_b6", avatar: "https://i.pravatar.cc/150?u=b6" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_berlin_salsa",
        name: "Learn Salsa - Save Lives 💃",
        description: "We exchange Salsa for donations for safe drinking water in Malawi. All profits go to charity! Join us for a fun class.",
        destination: { city: "Berlin", country: "Germany", coordinates: { lat: 52.5200, lng: 13.4050 } },
        travelDates: { startDate: "2026-02-05", endDate: "2026-12-31" },
        type: "public",
        category: "Dancing",
        maxMembers: 3000,
        memberCount: 2720,
        image: "https://source.unsplash.com/800x600/?salsa,dancing,couple",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_berlin_badminton",
        name: "Berlin Badminton Group 🏸",
        description: "Let's get a big group together. Every Badmintoner is welcome to join. Fun is always the keynote in this group!",
        destination: { city: "Berlin", country: "Germany", coordinates: { lat: 52.5200, lng: 13.4050 } },
        travelDates: { startDate: "2026-01-29", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 7000,
        memberCount: 6279,
        image: "https://source.unsplash.com/800x600/?badminton,court,indoor",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_berlin_football",
        name: "Mixed Lazy and Lousy Football ⚽",
        description: "We are a mixed and diverse group of all genders, dozens of nationalities. Purely for fun - no pros allowed!",
        destination: { city: "Berlin", country: "Germany", coordinates: { lat: 52.5200, lng: 13.4050 } },
        travelDates: { startDate: "2026-02-02", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 600,
        memberCount: 543,
        image: "https://source.unsplash.com/800x600/?football,soccer,field",
        verified: false,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_berlin_les_amis",
        name: "Les Amis Berlin | Women Community 🌸",
        description: "Friendly women-only community in Berlin. We organize multiple activities that let you meet friendly souls while exploring the city.",
        destination: { city: "Berlin", country: "Germany", coordinates: { lat: 52.5200, lng: 13.4050 } },
        travelDates: { startDate: "2026-02-14", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 2000,
        memberCount: 1791,
        image: "https://source.unsplash.com/800x600/?women,friends,coffee",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_berlin_think_veg",
        name: "Think Veg Berlin 🥗",
        description: "When health is absent, wisdom cannot reveal itself. Join us for vegan potlucks, recipe swaps, and healthy living discussions.",
        destination: { city: "Berlin", country: "Germany", coordinates: { lat: 52.5200, lng: 13.4050 } },
        travelDates: { startDate: "2026-02-20", endDate: "2026-12-31" },
        type: "public",
        category: "Food & Drink",
        maxMembers: 300,
        memberCount: 260,
        image: "https://source.unsplash.com/800x600/?vegetables,healthy,cooking",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },

    // --- AMSTERDAM GROUPS (Real Data from Screenshots) ---
    {
        groupId: "real_amsterdam_kooch",
        name: "Kooch | Skip small talk ☕",
        description: "At Kooch (meaning *migration*), it's all about connection. Meeting new people, sharing stories, and feeling more at home. No small talk allowed!",
        destination: { city: "Amsterdam", country: "Netherlands", coordinates: { lat: 52.3676, lng: 4.9041 } },
        travelDates: { startDate: "2026-03-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 3000,
        memberCount: 2443,
        image: "https://source.unsplash.com/800x600/?coffee,talk,friends",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_a1", avatar: "https://i.pravatar.cc/150?u=a1" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_amsterdam_coffee_club",
        name: "Amsterdam Coffee Club 🍰",
        description: "Welcome to Amsterdam Coffee Club! This group is for anyone in their 20s, 30s, and 40s who wants to build real friendships over great coffee.",
        destination: { city: "Amsterdam", country: "Netherlands", coordinates: { lat: 52.3676, lng: 4.9041 } },
        travelDates: { startDate: "2026-02-15", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 500,
        memberCount: 312,
        image: "https://source.unsplash.com/800x600/?cafe,coffee,latte",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_a2", avatar: "https://i.pravatar.cc/150?u=a2" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_amsterdam_art_food",
        name: "Art, Food, and Fun 🎨",
        description: "Are you passionate about discovering the beauty in everyday experiences? Do you love exploring new places, savoring delicious food, and art?",
        destination: { city: "Amsterdam", country: "Netherlands", coordinates: { lat: 52.3676, lng: 4.9041 } },
        travelDates: { startDate: "2026-03-10", endDate: "2026-12-31" },
        type: "public",
        category: "Art & Culture",
        maxMembers: 3000,
        memberCount: 2290,
        image: "https://source.unsplash.com/800x600/?art,food,museum",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_a3", avatar: "https://i.pravatar.cc/150?u=a3" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_amsterdam_hike_pics",
        name: "Hike & Pictures NL 📸",
        description: "Hike & Pictures is a community for humans and their furry companions who love nature, photography, and meaningful connections.",
        destination: { city: "Amsterdam", country: "Netherlands", coordinates: { lat: 52.3676, lng: 4.9041 } },
        travelDates: { startDate: "2026-04-01", endDate: "2026-11-30" },
        type: "public",
        category: "Hiking",
        maxMembers: 4000,
        memberCount: 3108,
        image: "https://source.unsplash.com/800x600/?hiking,nature,camera",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_a4", avatar: "https://i.pravatar.cc/150?u=a4" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_amsterdam_parties",
        name: "Amsterdam Parties 🎉",
        description: "Amsterdam Parties is a social meetup group for people who enjoy good conversations, relaxed after-work drinks, and meeting new people.",
        destination: { city: "Amsterdam", country: "Netherlands", coordinates: { lat: 52.3676, lng: 4.9041 } },
        travelDates: { startDate: "2026-02-01", endDate: "2026-12-31" },
        type: "public",
        category: "Party",
        maxMembers: 6000,
        memberCount: 5054,
        image: "https://source.unsplash.com/800x600/?party,drinks,nightlife",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_a5", avatar: "https://i.pravatar.cc/150?u=a5" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_amsterdam_expats_adventure",
        name: "International Expats Adventure Guild",
        description: "Join us for a fun and interactive Game Nights. Amsterdam International EXPAT Guild with events like: Glow in the Dark Pub Golf.",
        destination: { city: "Amsterdam", country: "Netherlands", coordinates: { lat: 52.3676, lng: 4.9041 } },
        travelDates: { startDate: "2026-03-15", endDate: "2026-12-31" },
        type: "public",
        category: "Adventure",
        maxMembers: 4000,
        memberCount: 3235,
        image: "https://source.unsplash.com/800x600/?adventure,games,friends",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_a6", avatar: "https://i.pravatar.cc/150?u=a6" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_amsterdam_walking_tour",
        name: "Free Walking Tour Amsterdam 🚶",
        description: "You are very welcome, but you can only book online on our website. Explore the canals, history, and hidden gems of the city.",
        destination: { city: "Amsterdam", country: "Netherlands", coordinates: { lat: 52.3676, lng: 4.9041 } },
        travelDates: { startDate: "2026-02-10", endDate: "2026-12-31" },
        type: "public",
        category: "Tours",
        maxMembers: 3000,
        memberCount: 2129,
        image: "https://source.unsplash.com/800x600/?amsterdam,canals,tour",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_a7", avatar: "https://i.pravatar.cc/150?u=a7" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_amsterdam_bouldering",
        name: "Amsterdam Bouldering Meetup Group 🧗",
        description: "Ready to conquer new heights? Join us for an exhilarating bouldering experience! Whether you're a seasoned climber or a complete beginner.",
        destination: { city: "Amsterdam", country: "Netherlands", coordinates: { lat: 52.3676, lng: 4.9041 } },
        travelDates: { startDate: "2026-02-05", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 1500,
        memberCount: 1122,
        image: "https://source.unsplash.com/800x600/?bouldering,climbing,gym",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_amsterdam_geografiets",
        name: "Geografiets | Social Bike Tours 🚲",
        description: "Discover the hidden sides of Amsterdam: one wind-direction at a time. Social bike tours for everyone who loves cycling and exploring.",
        destination: { city: "Amsterdam", country: "Netherlands", coordinates: { lat: 52.3676, lng: 4.9041 } },
        travelDates: { startDate: "2026-03-20", endDate: "2026-11-15" },
        type: "public",
        category: "Adventure",
        maxMembers: 1000,
        memberCount: 899,
        image: "https://source.unsplash.com/800x600/?bicycle,amsterdam,tour",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_amsterdam_hiking_meetup",
        name: "Netherlands Hiking Meetup 🥾",
        description: "Hiking is a great relaxed way to meet new people, learn about your city and the surroundings, network, get fit and have fun.",
        destination: { city: "Amsterdam", country: "Netherlands", coordinates: { lat: 52.3676, lng: 4.9041 } },
        travelDates: { startDate: "2026-02-15", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 5000,
        memberCount: 4185,
        image: "https://source.unsplash.com/800x600/?hiking,netherlands,nature",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_amsterdam_surfers",
        name: "The Amsterdam Surfers 🏄",
        description: "Welcome to The Amsterdam Surfers! This is the perfect place if you're looking to chat and learn about Surfing. If you're a city surfer, join us!",
        destination: { city: "Amsterdam", country: "Netherlands", coordinates: { lat: 52.3676, lng: 4.9041 } },
        travelDates: { startDate: "2026-04-10", endDate: "2026-10-31" },
        type: "public",
        category: "Sports",
        maxMembers: 1500,
        memberCount: 1169,
        image: "https://source.unsplash.com/800x600/?surfing,beach,waves",
        verified: false,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_amsterdam_campfires",
        name: "CampFires 🔥",
        description: "Hey everyone! We are very happy to see you around our campfire! Connect with nature and new friends around a warm fire.",
        destination: { city: "Amsterdam", country: "Netherlands", coordinates: { lat: 52.3676, lng: 4.9041 } },
        travelDates: { startDate: "2026-03-01", endDate: "2026-11-30" },
        type: "public",
        category: "Outdoor",
        maxMembers: 4000,
        memberCount: 3898,
        image: "https://source.unsplash.com/800x600/?campfire,camping,night",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_amsterdam_expat_society",
        name: "Amsterdam Expat Society 🌍",
        description: "As expats we often find ourselves lost in a big city. Trapped between two worlds. We're a home away from home for internationals.",
        destination: { city: "Amsterdam", country: "Netherlands", coordinates: { lat: 52.3676, lng: 4.9041 } },
        travelDates: { startDate: "2026-02-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 5000,
        memberCount: 4475,
        image: "https://source.unsplash.com/800x600/?expats,social,party",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_amsterdam_dip_sip",
        name: "Forest Dip & Sip 🌲",
        description: "Welcome to Forest Dip & Sip! This is for anyone who fancies a quick, refreshing jump into the Het Nieuwe Meer Lake followed by a warm drink.",
        destination: { city: "Amsterdam", country: "Netherlands", coordinates: { lat: 52.3676, lng: 4.9041 } },
        travelDates: { startDate: "2026-03-15", endDate: "2026-10-15" },
        type: "public",
        category: "Wellness",
        maxMembers: 100,
        memberCount: 27,
        image: "https://source.unsplash.com/800x600/?lake,swimming,nature",
        verified: false,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },

    // --- BARCELONA GROUPS (Paid/Activity) ---
    {
        groupId: "real_bcn_paella",
        name: "Paella Cooking Class & Dinner 🥘",
        description: "Learn to cook authentic Seafood Paella with a local chef. Includes market tour, cooking class, and unlimited Sangria! €55.",
        destination: { city: "Barcelona", country: "Spain", coordinates: { lat: 41.3851, lng: 2.1734 } },
        travelDates: { startDate: "2026-02-10", endDate: "2026-12-31" },
        type: "public",
        category: "Food & Drink",
        maxMembers: 12,
        memberCount: 12,
        image: "https://source.unsplash.com/800x600/?paella,cooking,chef",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_bcn_volleyball",
        name: "Beach Volleyball & Sunset Drinks",
        description: "Join us at Bogatell Beach for 2 hours of volleyball followed by mojitos at the chiringuito. €5 equipment fee.",
        destination: { city: "Barcelona", country: "Spain", coordinates: { lat: 41.3938, lng: 2.2069 } },
        travelDates: { startDate: "2026-03-01", endDate: "2026-11-30" },
        type: "public",
        category: "Sports",
        maxMembers: 40,
        memberCount: 29,
        image: "https://source.unsplash.com/800x600/?volleyball,beach,summer",
        verified: false,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_bcn_gastronomic",
        name: "BCN Gastronomic Society 🍷",
        description: "Eat, drink, chat. Repeat. BCN Gastronomic Society is for food lovers who want to explore local cuisine and hidden gems in good company.",
        destination: { city: "Barcelona", country: "Spain", coordinates: { lat: 41.3851, lng: 2.1734 } },
        travelDates: { startDate: "2026-02-05", endDate: "2026-12-31" },
        type: "public",
        category: "Food & Drink",
        maxMembers: 15000,
        memberCount: 14189,
        image: "https://source.unsplash.com/800x600/?tapas,wine,dinner",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_bcn_boardgames",
        name: "Board Games Barcelona (KLEFF) 🎲",
        description: "Welcome to KLEFF! Do you like board games? Are you an expat or a local? Join us for game nights and meet new friends!",
        destination: { city: "Barcelona", country: "Spain", coordinates: { lat: 41.3851, lng: 2.1734 } },
        travelDates: { startDate: "2026-02-01", endDate: "2026-12-31" },
        type: "public",
        category: "Games",
        maxMembers: 13000,
        memberCount: 12728,
        image: "https://source.unsplash.com/800x600/?boardgames,play,fun",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_bcn_indie_tribe",
        name: "Barcelona Indie Tribe 🎸",
        description: "A meetup for people who like music, socializing, and practicing their language of choice. We'll be at bars, concerts, and night clubs.",
        destination: { city: "Barcelona", country: "Spain", coordinates: { lat: 41.3851, lng: 2.1734 } },
        travelDates: { startDate: "2026-02-15", endDate: "2026-12-31" },
        type: "public",
        category: "Music",
        maxMembers: 1500,
        memberCount: 1332,
        image: "https://source.unsplash.com/800x600/?concert,band,music",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_bcn_social_mode",
        name: "Social Mode Barcelona 🤝",
        description: "Professional introvert? Extrovert without a cause? Or simply human in airplane mode? Connect, Play, Discover.",
        destination: { city: "Barcelona", country: "Spain", coordinates: { lat: 41.3851, lng: 2.1734 } },
        travelDates: { startDate: "2026-02-20", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 700,
        memberCount: 654,
        image: "https://source.unsplash.com/800x600/?friends,gathering,talk",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_bcn_speed_dating",
        name: "Speed Dating Barcelona ⏱️",
        description: "Welcome! Bedazzling Barcelona hosts speed dating and affinity dinner events. A fun way to meet singles in the city.",
        destination: { city: "Barcelona", country: "Spain", coordinates: { lat: 41.3851, lng: 2.1734 } },
        travelDates: { startDate: "2026-02-14", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 8500,
        memberCount: 8489,
        image: "https://source.unsplash.com/800x600/?dating,couple,dinner",
        verified: false,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_bcn_beautiful",
        name: "Beautiful Barcelona 🌟",
        description: "Welcome to Beautiful Barcelona! Where you can make friends, socialize, dance and practice other languages together. Multi-cultural vibes.",
        destination: { city: "Barcelona", country: "Spain", coordinates: { lat: 41.3851, lng: 2.1734 } },
        travelDates: { startDate: "2026-02-10", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 10000,
        memberCount: 9750,
        image: "https://source.unsplash.com/800x600/?barcelona,party,friends",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_bcn_rainbow",
        name: "The Rainbow Table (La Mesa Arcoíris) 🏳️‍🌈",
        description: "A group for gay men who enjoy the simple things: good food, good chat, and making new friends. Social dinners and events.",
        destination: { city: "Barcelona", country: "Spain", coordinates: { lat: 41.3851, lng: 2.1734 } },
        travelDates: { startDate: "2026-02-18", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 150,
        memberCount: 109,
        image: "https://source.unsplash.com/800x600/?dinner,friends,gay",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },

    // --- ROME GROUPS (Real Data from Screenshots) ---
    {
        groupId: "real_rome_music_movement",
        name: "Roma Music and Movement 🎵",
        description: "Welcome to the Roma Music and Movement Meetup! This group is for anyone who is passionate about music, dance, and creative expression.",
        destination: { city: "Rome", country: "Italy", coordinates: { lat: 41.8902, lng: 12.4922 } },
        travelDates: { startDate: "2026-02-10", endDate: "2026-12-31" },
        type: "public",
        category: "Music",
        maxMembers: 100,
        memberCount: 6,
        image: "https://source.unsplash.com/800x600/?music,dance,rome",
        verified: false,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_rome_english_speakers",
        name: "Single English Speakers in Rome 🇬🇧",
        description: "Are you a single, English speaker longing for conversation with those who grasp the nuance of your native language? Join us!",
        destination: { city: "Rome", country: "Italy", coordinates: { lat: 41.8902, lng: 12.4922 } },
        travelDates: { startDate: "2026-02-05", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 6000,
        memberCount: 5583,
        image: "https://source.unsplash.com/800x600/?friends,talk,rome",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_r1", avatar: "https://i.pravatar.cc/150?u=r1" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_rome_hiking",
        name: "International Hiking Community Rome 🥾",
        description: "Hello outdoor lovers! Discover the wild side of Lazio 🍝 and explore the best trails, mountains, forests, and valleys.",
        destination: { city: "Rome", country: "Italy", coordinates: { lat: 41.8902, lng: 12.4922 } },
        travelDates: { startDate: "2026-02-15", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 500,
        memberCount: 245,
        image: "https://source.unsplash.com/800x600/?hiking,lazio,nature",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_rome_mindtrek",
        name: "Mindtrek Rome - Hiking and Meditation 🧘‍♂️",
        description: "Mindtrek is a method of walking that gradually removes the layers of stress. Combine hiking with mindfulness in nature.",
        destination: { city: "Rome", country: "Italy", coordinates: { lat: 41.8902, lng: 12.4922 } },
        travelDates: { startDate: "2026-03-01", endDate: "2026-11-30" },
        type: "public",
        category: "Wellness",
        maxMembers: 1000,
        memberCount: 564,
        image: "https://source.unsplash.com/800x600/?meditation,hiking,peace",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_rome_free_walking",
        name: "Free walking tour Rome with a guide 🏛️",
        description: "A group of guides in Rome. We work with free walking Tours. If you want to discover the city's history, contact us!",
        destination: { city: "Rome", country: "Italy", coordinates: { lat: 41.8902, lng: 12.4922 } },
        travelDates: { startDate: "2026-02-01", endDate: "2026-12-31" },
        type: "public",
        category: "Tours",
        maxMembers: 300,
        memberCount: 160,
        image: "https://source.unsplash.com/800x600/?rome,tour,colosseum",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_rome_travelers",
        name: "The Rome Travelers Club ✈️",
        description: "Want to go on adventure and explore the world but not sure where to start or who to go with? This is your community.",
        destination: { city: "Rome", country: "Italy", coordinates: { lat: 41.8902, lng: 12.4922 } },
        travelDates: { startDate: "2026-02-20", endDate: "2026-12-31" },
        type: "public",
        category: "Travel",
        maxMembers: 3000,
        memberCount: 2042,
        image: "https://source.unsplash.com/800x600/?travel,globe,adventure",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_rome_astrology",
        name: "Astrology - Rome, Italy ✨",
        description: "Welcome to the Astrology Collective! Now is the time to unite the Soul and the World. See the sunlight in a new way.",
        destination: { city: "Rome", country: "Italy", coordinates: { lat: 41.8902, lng: 12.4922 } },
        travelDates: { startDate: "2026-02-28", endDate: "2026-12-31" },
        type: "public",
        category: "Spiritual",
        maxMembers: 50,
        memberCount: 8,
        image: "https://source.unsplash.com/800x600/?astrology,stars,sky",
        verified: false,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_rome_arts",
        name: "ROMA Arts & Lifestyle Events 🎭",
        description: "Arts & lifestyle in ROMA. Locals and travelers connecting through culture, exhibitions, and creative events.",
        destination: { city: "Rome", country: "Italy", coordinates: { lat: 41.8902, lng: 12.4922 } },
        travelDates: { startDate: "2026-02-15", endDate: "2026-12-31" },
        type: "public",
        category: "Art & Culture",
        maxMembers: 100,
        memberCount: 23,
        image: "https://source.unsplash.com/800x600/?art,museum,rome",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_rome_only_friends",
        name: "Only Friends 😸 Rome",
        description: "Check our vibe! This group is for making genuine friends in Rome. No pressure, just good people and good times.",
        destination: { city: "Rome", country: "Italy", coordinates: { lat: 41.8902, lng: 12.4922 } },
        travelDates: { startDate: "2026-02-10", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 5000,
        memberCount: 4081,
        image: "https://source.unsplash.com/800x600/?friends,rome,happy",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_rome_hangout_night",
        name: "International Hangout Night In Rome 🍹",
        description: "Welcome to International Hangout Night! You can make many good friends here while enjoying the Roman nightlife.",
        destination: { city: "Rome", country: "Italy", coordinates: { lat: 41.8902, lng: 12.4922 } },
        travelDates: { startDate: "2026-02-05", endDate: "2026-12-31" },
        type: "public",
        category: "Party",
        maxMembers: 2000,
        memberCount: 1780,
        image: "https://source.unsplash.com/800x600/?nightlife,drinks,bar",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_rome_airplane_mode",
        name: "Airplane Mode ✈️ (Digital Detox)",
        description: "Ever felt like life happens somewhere between notifications? Airplane Mode is about putting everyday noise in the background and connecting IRL.",
        destination: { city: "Rome", country: "Italy", coordinates: { lat: 41.8902, lng: 12.4922 } },
        travelDates: { startDate: "2026-03-01", endDate: "2026-12-31" },
        type: "public",
        category: "Wellness",
        maxMembers: 200,
        memberCount: 116,
        image: "https://source.unsplash.com/800x600/?nature,offline,chat",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_rome_women_in_rome",
        name: "Women in Rome • New Friends & Experiences 🌸",
        description: "Hi! I recently moved to Rome. I created this group for women in their 20s-30s who are new to the city or looking for girlfriends.",
        destination: { city: "Rome", country: "Italy", coordinates: { lat: 41.8902, lng: 12.4922 } },
        travelDates: { startDate: "2026-02-15", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 100,
        memberCount: 7,
        image: "https://source.unsplash.com/800x600/?women,friends,coffee",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_rome_lets_meet",
        name: "Let's Meet in Rome! | Freelance & Nomad Community 💻",
        description: "Let's Meet in Rome is an international community that facilitates connections between freelancers, remote workers, and digital nomads.",
        destination: { city: "Rome", country: "Italy", coordinates: { lat: 41.8902, lng: 12.4922 } },
        travelDates: { startDate: "2026-02-01", endDate: "2026-12-31" },
        type: "public",
        category: "Business",
        maxMembers: 3000,
        memberCount: 2042,
        image: "https://source.unsplash.com/800x600/?coworking,laptop,cafe",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_rome_dating",
        name: "Rome Dating ❤️",
        description: "Welcome to Rome Dating, the perfect place to meet new people, make connections, and maybe even find your perfect match.",
        destination: { city: "Rome", country: "Italy", coordinates: { lat: 41.8902, lng: 12.4922 } },
        travelDates: { startDate: "2026-02-14", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 500,
        memberCount: 170,
        image: "https://source.unsplash.com/800x600/?couple,dating,romance",
        verified: false,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_rome_volleyball",
        name: "Roma Pallavolo Amatoriale 🏐",
        description: "Ciao a tutti! When I moved to Rome I couldn't find people to play volleyball with. So I created this group for amateur players!",
        destination: { city: "Rome", country: "Italy", coordinates: { lat: 41.8902, lng: 12.4922 } },
        travelDates: { startDate: "2026-03-10", endDate: "2026-11-30" },
        type: "public",
        category: "Sports",
        maxMembers: 100,
        memberCount: 51,
        image: "https://source.unsplash.com/800x600/?volleyball,sport,team",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },

    // --- LISBON GROUPS (Real Data from Screenshots) ---
    {
        groupId: "real_lisbon_hiking",
        name: "Lisbon Hiking Meetup 🥾",
        description: "Day hikes around five hours long, with a picnic break for lunch. Explore Sintra, Cascais, and the beautiful coast with us.",
        destination: { city: "Lisbon", country: "Portugal", coordinates: { lat: 38.7223, lng: -9.1393 } },
        travelDates: { startDate: "2026-02-10", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 10000,
        memberCount: 8136,
        image: "https://source.unsplash.com/800x600/?hiking,portugal,coast",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_l1", avatar: "https://i.pravatar.cc/150?u=l1" }],
        upcomingMeetups: []
    },
    {
        groupId: "real_lisbon_surf",
        name: "Linha Surf Club (Lisbon) 🏄",
        description: "Linha Surf Club is an open surf community based in Lisbon. We welcome locals, expats, and travelers of all levels—from first timers to pros.",
        destination: { city: "Lisbon", country: "Portugal", coordinates: { lat: 38.6436, lng: -9.2307 } },
        travelDates: { startDate: "2026-03-01", endDate: "2026-11-30" },
        type: "public",
        category: "Sports",
        maxMembers: 50,
        memberCount: 23,
        image: "https://source.unsplash.com/800x600/?surfing,ocean,waves",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_lisbon_expats",
        name: "EXPATS LISBON CONNECTION 🌍",
        description: "Welcome to Our Lisbon Community! Whether you're a newcomer or a long-time resident, this group is designed to connect meaningful friendships.",
        destination: { city: "Lisbon", country: "Portugal", coordinates: { lat: 38.7223, lng: -9.1393 } },
        travelDates: { startDate: "2026-02-05", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 12000,
        memberCount: 11393,
        image: "https://source.unsplash.com/800x600/?expats,social,tram",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_lisbon_comedy",
        name: "Lisbon Comedy: Standup in English 🎤",
        description: "This group includes events for standup comedy in English all over Lisbon. Join us for a world of laughs!",
        destination: { city: "Lisbon", country: "Portugal", coordinates: { lat: 38.7223, lng: -9.1393 } },
        travelDates: { startDate: "2026-02-15", endDate: "2026-12-31" },
        type: "public",
        category: "Entertainment",
        maxMembers: 11000,
        memberCount: 10896,
        image: "https://source.unsplash.com/800x600/?comedy,stage,microphone",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_lisbon_bloom",
        name: "Bloom Social - Food, Coffee & Good Company ☕",
        description: "Bloom is a space open to everyone – people, ideas and even well-behaved pets. We create moments of connection over coffee.",
        destination: { city: "Lisbon", country: "Portugal", coordinates: { lat: 38.7223, lng: -9.1393 } },
        travelDates: { startDate: "2026-02-01", endDate: "2026-12-31" },
        type: "public",
        category: "Food & Drink",
        maxMembers: 50,
        memberCount: 2,
        image: "https://source.unsplash.com/800x600/?coffee,cafe,social",
        verified: false,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_lisbon_explorers",
        name: "Lisbon City Explorers 🗺️",
        description: "A work in progress group. Join us for informative explorations, walks, & hikes in and around the city.",
        destination: { city: "Lisbon", country: "Portugal", coordinates: { lat: 38.7223, lng: -9.1393 } },
        travelDates: { startDate: "2026-03-10", endDate: "2026-11-30" },
        type: "public",
        category: "Tours",
        maxMembers: 200,
        memberCount: 131,
        image: "https://source.unsplash.com/800x600/?lisbon,city,view",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_lisbon_tech",
        name: "Lisbon PHP Meetup 🐘",
        description: "This is a group for anyone interested in PHP, web development, and tech. All skill levels are welcome. Let's code and chat!",
        destination: { city: "Lisbon", country: "Portugal", coordinates: { lat: 38.7223, lng: -9.1393 } },
        travelDates: { startDate: "2026-02-20", endDate: "2026-12-31" },
        type: "public",
        category: "Technology",
        maxMembers: 500,
        memberCount: 221,
        image: "https://source.unsplash.com/800x600/?code,programming,laptop",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_lisbon_friends",
        name: "International Friends Lisbon 🥂",
        description: "This is a group where everyone is welcome. Our mission is to create a safe place for people to meet other people and build friendships.",
        destination: { city: "Lisbon", country: "Portugal", coordinates: { lat: 38.7223, lng: -9.1393 } },
        travelDates: { startDate: "2026-02-14", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 8000,
        memberCount: 7860,
        image: "https://source.unsplash.com/800x600/?party,friends,cheers",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_lisbon_digital_nomads",
        name: "Lisbon Digital Nomads 💻",
        description: "This group is for digital nomads and people who are interested in the digital nomad lifestyle. If you are location independent, join us!",
        destination: { city: "Lisbon", country: "Portugal", coordinates: { lat: 38.7223, lng: -9.1393 } },
        travelDates: { startDate: "2026-02-10", endDate: "2026-12-31" },
        type: "public",
        category: "Business",
        maxMembers: 30000,
        memberCount: 26090,
        image: "https://source.unsplash.com/800x600/?laptop,work,travel",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_lisbon_connect_fun",
        name: "Lisbon Connect and Fun 🎉",
        description: "Welcome to Lisbon Connect and Fun Meetup! This group is dedicated to bringing together locals and newcomers to Lisbon.",
        destination: { city: "Lisbon", country: "Portugal", coordinates: { lat: 38.7223, lng: -9.1393 } },
        travelDates: { startDate: "2026-02-15", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 500,
        memberCount: 401,
        image: "https://source.unsplash.com/800x600/?party,fun,people",
        verified: false,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_lisbon_ladies_blunch",
        name: "Ladies Who Blunch (Brunch+Lunch) 🥂",
        description: "Hello everyone! We're Karmal and Sofia, and we're so excited to welcome you to our new Brunch & Lunch group dedicated to women.",
        destination: { city: "Lisbon", country: "Portugal", coordinates: { lat: 38.7223, lng: -9.1393 } },
        travelDates: { startDate: "2026-02-28", endDate: "2026-12-31" },
        type: "public",
        category: "Food & Drink",
        maxMembers: 700,
        memberCount: 655,
        image: "https://source.unsplash.com/800x600/?brunch,food,friends",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_lisbon_monsanto",
        name: "Monsanto Morning Walks 🌳",
        description: "Looking for a refreshing way to start your day? Join us once a week for a morning walk in Monsanto park to enjoy some fresh air.",
        destination: { city: "Lisbon", country: "Portugal", coordinates: { lat: 38.7223, lng: -9.1393 } },
        travelDates: { startDate: "2026-03-01", endDate: "2026-11-30" },
        type: "public",
        category: "wellness",
        maxMembers: 2000,
        memberCount: 1508,
        image: "https://source.unsplash.com/800x600/?forest,walk,morning",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_lisbon_pingpong",
        name: "Lisbon PingPong Meetup Group 🏓",
        description: "Welcome to the PingPong Lisbon Meetup Group! Join fellow pingPong enthusiasts for fun, inclusive social events.",
        destination: { city: "Lisbon", country: "Portugal", coordinates: { lat: 38.7223, lng: -9.1393 } },
        travelDates: { startDate: "2026-02-12", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 1500,
        memberCount: 1453,
        image: "https://source.unsplash.com/800x600/?pingpong,tabletennis,sport",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_lisbon_tea_ceremony",
        name: "Chinese and Japanese Tea Ceremony 🍵",
        description: "Hey there, I'm Lilly. After spending over a decade diving deep into the world of tea, I've made Lisbon my home base.",
        destination: { city: "Lisbon", country: "Portugal", coordinates: { lat: 38.7223, lng: -9.1393 } },
        travelDates: { startDate: "2026-03-05", endDate: "2026-12-31" },
        type: "public",
        category: "Culture",
        maxMembers: 300,
        memberCount: 207,
        image: "https://source.unsplash.com/800x600/?tea,ceremony,calm",
        verified: false,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_lisbon_pickup_football",
        name: "Pickup Football Lisbon ⚽",
        description: "Looking for a fun way to play football in Lisbon and meet new people? We organise regular 5v5 pickup games at different pitches.",
        destination: { city: "Lisbon", country: "Portugal", coordinates: { lat: 38.7223, lng: -9.1393 } },
        travelDates: { startDate: "2026-02-20", endDate: "2026-11-30" },
        type: "public",
        category: "Sports",
        maxMembers: 300,
        memberCount: 208,
        image: "https://source.unsplash.com/800x600/?soccer,football,game",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    {
        groupId: "real_lisbon_cascais_friends",
        name: "Lisbon Cascais Expats Friends 🤝",
        description: "Join our community! Expats & Locals community - A creation of Anju. We are a bunch of open-minded humans who love meeting new people.",
        destination: { city: "Lisbon", country: "Portugal", coordinates: { lat: 38.7223, lng: -9.1393 } },
        travelDates: { startDate: "2026-02-18", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 11000,
        memberCount: 10582,
        image: "https://source.unsplash.com/800x600/?friends,group,happy",
        verified: true,
        source: "meetup_scrape",
        members: [],
        upcomingMeetups: []
    },
    // --- BANGKOK GROUPS (From User Screenshots) ---
    {
        groupId: "real_bkk_walking",
        name: "Burmazo Walking Squad 🚶‍♂️",
        description: "We walk around Bangkok on our own budget. We explore interesting places around Bangkok on feet, bike, or train. Join us for casual city treks.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-02-01", endDate: "2026-12-31" },
        type: "public",
        category: "Walking",
        maxMembers: 100,
        memberCount: 30,
        image: "https://source.unsplash.com/800x600/?walking,city,travel",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_1", avatar: "https://i.pravatar.cc/150?u=bkk1" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_walk_1",
                title: "Old Town & Canal Walk",
                dateTime: "2026-03-10T09:00:00Z",
                location: { name: "Giant Swing", address: "Sao Chingcha, Bangkok" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_walk_1",
                user: "Nwat T.",
                text: "Does anyone know if the canal boat is running this Sunday?",
                timestamp: "2h ago"
            }
        ]
    },
    {
        groupId: "real_bkk_events_big",
        name: "Bangkokevents biggest community 🎉",
        description: "I'm organizing events for all restaurants, bars, fine dining, and cafes in Bangkok. Start new community events to explore the city.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 20000,
        memberCount: 10499,
        image: "https://source.unsplash.com/800x600/?party,restaurant,crowd",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_2", avatar: "https://i.pravatar.cc/150?u=bkk2" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_event_1",
                title: "Grand Networking Dinner @ Silom",
                dateTime: "2026-03-12T19:00:00Z",
                location: { name: "Scarlett Wine Bar", address: "Silom Road, Bangkok" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_event_1",
                user: "Sarah J.",
                text: "Is there a dress code for the networking dinner?",
                timestamp: "5h ago"
            }
        ]
    },
    {
        groupId: "real_bkk_nomads",
        name: "Bangkok Digital Nomads 💻",
        description: "Welcome, fellow nomads! This is our huge weekly Meetup for socializing, making new friends, learning from each other, and coworking.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Technology",
        maxMembers: 10000,
        memberCount: 6916,
        image: "https://source.unsplash.com/800x600/?laptop,coffee,coworking",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_3", avatar: "https://i.pravatar.cc/150?u=bkk3" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_nomad_1",
                title: "Weekly Coworking Friday",
                dateTime: "2026-03-14T10:00:00Z",
                location: { name: "The Hive Thonglor", address: "Sukhumvit 49, Bangkok" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_nomad_1",
                user: "Mike R.",
                text: "Best cafes with reliable fast WiFi in Ari? Need to take calls.",
                timestamp: "1d ago"
            }
        ]
    },
    {
        groupId: "real_bkk_boring",
        name: "Boring Club 😑",
        description: "Hiya Boringers! Are you bored and looking for things to do? Get out of your room and meet new friends in your community.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 10000,
        memberCount: 8410,
        image: "https://source.unsplash.com/800x600/?bored,friends,hangout",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_4", avatar: "https://i.pravatar.cc/150?u=bkk4" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_boring_1",
                title: "Anti-Boredom Board Game Night",
                dateTime: "2026-03-15T18:00:00Z",
                location: { name: "Dice Cup", address: "Suan Luang, Bangkok" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_boring_1",
                user: "Ploy S.",
                text: "Anyone up for karaoke this weekend? Seriously bored!",
                timestamp: "3h ago"
            }
        ]
    },
    {
        groupId: "real_bkk_global_social",
        name: "Global Socializing in Bangkok 🌏",
        description: "We bring together young adults in their 20s and 30s who love culture, language, and open conversation. Whether you're a local or traveler.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 5000,
        memberCount: 1672,
        image: "https://source.unsplash.com/800x600/?cheers,drinks,friends",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_5", avatar: "https://i.pravatar.cc/150?u=bkk5" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_social_1",
                title: "International Mingle @ Rooftop",
                dateTime: "2026-03-13T20:00:00Z",
                location: { name: "Octave Rooftop", address: "Sukhumvit 57, Bangkok" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_social_1",
                user: "Alex D.",
                text: "Just arrived in BKK! Looking forward to meeting everyone on Friday.",
                timestamp: "6h ago"
            }
        ]
    },
    {
        groupId: "real_bkk_get_lost",
        name: "Get Lost in BKK & Beyond 🗺️",
        description: "Hello, I started making the events since 2013 on Couchsurfing and now I am planning to expand my group on Meetup. Explorations & hidden gems.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Adventure",
        maxMembers: 10000,
        memberCount: 6226,
        image: "https://source.unsplash.com/800x600/?street,market,adventure",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_6", avatar: "https://i.pravatar.cc/150?u=bkk6" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_lost_1",
                title: "Hidden Chinatown Alleys Tour",
                dateTime: "2026-03-20T16:00:00Z",
                location: { name: "Yaowarat Road", address: "Samphanthawong, Bangkok" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_lost_1",
                user: "Tan W.",
                text: "Found an amazing abandoned building near the river, anyone want to explore?",
                timestamp: "2d ago"
            }
        ]
    },
    {
        groupId: "real_bkk_comedy",
        name: "Bangkok Standup Comedy: Leaf Laugh Love 🎤",
        description: "Leaf, Laugh, Love is a comedy collective based in Bangkok, Thailand. We host many standup comedy shows all around the city.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Entertainment",
        maxMembers: 1000,
        memberCount: 660,
        image: "https://source.unsplash.com/800x600/?comedy,microphone,club",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_7", avatar: "https://i.pravatar.cc/150?u=bkk7" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_comedy_1",
                title: "Open Mic Night @ Comedy Club",
                dateTime: "2026-03-18T20:30:00Z",
                location: { name: "The Comedy Club Bangkok", address: "Sukhumvit 33/1, Bangkok" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_comedy_1",
                user: "Joke Master",
                text: "Looking for 3 more slots for the open mic! Message me.",
                timestamp: "12h ago"
            }
        ]
    },
    {
        groupId: "real_bkk_ffb",
        name: "Friends Fun Bangkok (FFB) 🍻",
        description: "Welcome to our Meetup group. Friends Fun Bangkok's core value is to be a group of friends/family in a city that is our choice.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 15000,
        memberCount: 10970,
        image: "https://source.unsplash.com/800x600/?fun,party,celebration",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_8", avatar: "https://i.pravatar.cc/150?u=bkk8" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_ffb_1",
                title: "Friday Night Live Music & Drinks",
                dateTime: "2026-03-17T19:00:00Z",
                location: { name: "Saxophone Pub", address: "Victory Monument, Bangkok" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_ffb_1",
                user: "Jenny Thai",
                text: "Any recommendations for a good salsa club for after the meetup?",
                timestamp: "1d ago"
            }
        ]
    },
    {
        groupId: "real_bkk_expat_adv",
        name: "Bangkok Expat Adventure Club 🌴",
        description: "Bangkok Expat Adventure Club is a casual, social group for expats and locals who want to get out of the condo, explore the city.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Adventure",
        maxMembers: 200,
        memberCount: 55,
        image: "https://source.unsplash.com/800x600/?temple,river,boat",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_9", avatar: "https://i.pravatar.cc/150?u=bkk9" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_adv_1",
                title: "Weekend Trip to Ayutthaya",
                dateTime: "2026-03-25T08:00:00Z",
                location: { name: "Hua Lamphong Station", address: "Bangkok" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_adv_1",
                user: "Tom H.",
                text: "Is anyone driving to Ayutthaya? Can I share gas?",
                timestamp: "4h ago"
            }
        ]
    },
    {
        groupId: "real_bkk_seniors",
        name: "Bangkok Golden Years Seniors 👴👵",
        description: "We are a support group for Seniors (in general people over 60 years of age), primarily composed of Expats but also with Thai members.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Support",
        maxMembers: 500,
        memberCount: 303,
        image: "https://source.unsplash.com/800x600/?seniors,tea,garden",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_10", avatar: "https://i.pravatar.cc/150?u=bkk10" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_seniors_1",
                title: "Morning Coffee & Chat",
                dateTime: "2026-03-11T10:00:00Z",
                location: { name: "Lumpini Park", address: "Rama IV Rd, Bangkok" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_seniors_1",
                user: "Martha S.",
                text: "Looking for recommendations for an English-speaking cardiologist.",
                timestamp: "2d ago"
            }
        ]
    },
     {
        groupId: "real_bkk_make_friends",
        name: "Make New Friends Bangkok 🤝",
        description: "Welcome to Make New Friends Bangkok! Our group is all about making new connections with people from around the world.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 500,
        memberCount: 126,
        image: "https://source.unsplash.com/800x600/?friends,smile,hug",
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_11", avatar: "https://i.pravatar.cc/150?u=bkk11" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_friends_1",
                title: "Picnic in Benjakitti Park",
                dateTime: "2026-03-21T16:00:00Z",
                location: { name: "Benjakitti Forest Park", address: "Asok, Bangkok" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_friends_1",
                user: "Kenji Y.",
                text: "I'm new in town, anyone want to grab lunch today?",
                timestamp: "1h ago"
            }
        ]
    },
    {
        groupId: "real_bkk_food_tour",
        name: "Go with the Food กินตามเพื่อน 🍜",
        description: "(ภาษาไทยด้านล่างจ้า) What we do: Food tour, eating out, or small trips for food but mostly we eat the common dishes that Thai people love.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Food",
        maxMembers: 5000,
        memberCount: 2153,
        image: "https://source.unsplash.com/800x600/?streetfood,noodles,spicy",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_12", avatar: "https://i.pravatar.cc/150?u=bkk12" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_food_1",
                title: "Best Boat Noodles Contest",
                dateTime: "2026-03-19T11:00:00Z",
                location: { name: "Victory Monument Boat Noodles Alley", address: "Bangkok" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_food_1",
                user: "Nui P.",
                text: "Has anyone tried the new Pad Thai place near Khaosan?",
                timestamp: "8h ago"
            }
        ]
    },
    {
        groupId: "real_bkk_urban_hiking",
        name: "Bangkok Urban Hiking Meetup 🏙️",
        description: "This is a group for anyone interested in hiking, climbing, adventuring, but can't get away every weekend to hit the mountains.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 10000,
        memberCount: 4961,
        image: "https://source.unsplash.com/800x600/?bridge,citywalk,stairs",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_13", avatar: "https://i.pravatar.cc/150?u=bkk13" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_urban_1",
                title: "Green Lung (Bang Krachao) Cycle & Hike",
                dateTime: "2026-03-22T08:30:00Z",
                location: { name: "Bang Krachao Pier", address: "Phra Pradaeng" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_urban_1",
                user: "David B.",
                text: "Don't forget mosquito repellent for this Sunday!",
                timestamp: "10m ago"
            }
        ]
    },
    {
        groupId: "real_bkk_hiking_outdoor",
        name: "Bangkok Hiking and Outdoor 🌲",
        description: "This is a group for anyone interested in hiking, camping, and getting outdoors. We organize trips outside Bangkok regularly.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 20000,
        memberCount: 14926,
        image: "https://source.unsplash.com/800x600/?mountain,forest,trail",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_14", avatar: "https://i.pravatar.cc/150?u=bkk14" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_outdoor_1",
                title: "Kaeng Krachan Camping Trip",
                dateTime: "2026-04-05T06:00:00Z",
                location: { name: "Kaeng Krachan National Park", address: "Phetchaburi" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_outdoor_1",
                user: "Camping Joe",
                text: "I have 2 extra tents if anyone needs to borrow one.",
                timestamp: "1w ago"
            }
        ]
    },
    // --- BANGKOK GROUPS BATCH 2 (From User Screenshots) ---
    {
        groupId: "real_bkk_friends_travel",
        name: "Bangkok International Friend Travel 🌏",
        description: "We want to create a community where international people come together to travel and explore Thailand in a relaxing and fun way.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-02-01", endDate: "2026-12-31" },
        type: "public",
        category: "Travel",
        maxMembers: 500,
        memberCount: 119,
        image: "https://source.unsplash.com/800x600/?thailand,travel,backpack&sig=201",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?friends,travel&sig=201a", caption: "Group Trip", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?thailand,temple&sig=201b", caption: "Temple Visit", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?bangkok,street&sig=201c", caption: "Street Food", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_15", avatar: "https://i.pravatar.cc/150?u=bkk15" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_travel_2",
                title: "Day Trip to Kanchanaburi",
                dateTime: "2026-03-28T07:00:00Z",
                location: { name: "River Kwai Bridge", address: "Kanchanaburi" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_travel_2",
                user: "Lisa M.",
                text: "Does the train to Kanchanaburi have AC?",
                timestamp: "2d ago"
            }
        ]
    },
    {
        groupId: "real_bkk_dive_crew",
        name: "BK Dive Crew 🤿",
        description: "Bangkok's only active dive club. The BK Dive Crew is a tight-knit group of friends that hang out here in Bangkok and go on dive trips.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 1000,
        memberCount: 436,
        image: "https://source.unsplash.com/800x600/?scuba,diving,ocean&sig=202",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?underwater,fish&sig=202a", caption: "Deep Blue", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?dive,boat&sig=202b", caption: "On The Boat", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?ocean,reef&sig=202c", caption: "Reef Life", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_16", avatar: "https://i.pravatar.cc/150?u=bkk16" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_dive_1",
                title: "Pool Refresher Session",
                dateTime: "2026-03-14T10:00:00Z",
                location: { name: "Planet Scuba", address: "Sukhumvit" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_dive_1",
                user: "Diver Dan",
                text: "Planning a trip to Koh Tao next month, anyone in?",
                timestamp: "5h ago"
            }
        ]
    },
    {
        groupId: "real_bkk_explorer_birding",
        name: "Bangkok Explorer's Club and Birding 🦜",
        description: "We speak Thai and English :) Welcome to the Bangkok Explorer's Club! This is a group all about exploring Bangkok and bird watching.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Nature",
        maxMembers: 500,
        memberCount: 325,
        image: "https://source.unsplash.com/800x600/?bird,nature,park&sig=203",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?kingfisher,bird&sig=203a", caption: "Kingfisher", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?park,green&sig=203b", caption: "Morning Walk", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?binoculars,nature&sig=203c", caption: "Spotting", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_17", avatar: "https://i.pravatar.cc/150?u=bkk17" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_bird_1",
                title: "Early Morning Bird Walk @ Lumpini",
                dateTime: "2026-03-12T06:00:00Z",
                location: { name: "Lumpini Park", address: "Bangkok" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_bird_1",
                user: "Ornithology Pro",
                text: "Spotted a Kingfisher near the lake yesterday!",
                timestamp: "1d ago"
            }
        ]
    },
    {
        groupId: "real_bkk_badminton_club",
        name: "Badminton Club Bangkok 🏸",
        description: "Welcome to our Funminton Club! This is a group for anyone interested in Badminton in Bangkok. We play at different courts.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 5000,
        memberCount: 2288,
        image: "https://source.unsplash.com/800x600/?badminton,court,game&sig=204",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?shuttlecock,racket&sig=204a", caption: "Game On", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?sport,gym&sig=204b", caption: "The Court", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?friends,sport&sig=204c", caption: "Team", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_18", avatar: "https://i.pravatar.cc/150?u=bkk18" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_badminton_1",
                title: "Tuesday Night Smash",
                dateTime: "2026-03-11T19:00:00Z",
                location: { name: "71 Sports Club", address: "Phra Khanong" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_badminton_1",
                user: "Racket Man",
                text: "Do we need to bring our own shuttles?",
                timestamp: "3h ago"
            }
        ]
    },
    {
        groupId: "real_bkk_running_sanam",
        name: "Sanam Luang Running Meetup Group 🏃",
        description: "Welcome to Sanam Luang Running Meetup Group! First things first: We don't really run. Despite the name, you won't find us sprinting.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 2000,
        memberCount: 1854,
        image: "https://source.unsplash.com/800x600/?running,jogging,park&sig=205",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?runner,morning&sig=205a", caption: "Early Run", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?park,path&sig=205b", caption: "Path", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?bangkok,morning&sig=205c", caption: "Sunrise", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_19", avatar: "https://i.pravatar.cc/150?u=bkk19" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_run_1",
                title: "Slow Jog & Breakfast",
                dateTime: "2026-03-13T06:30:00Z",
                location: { name: "Sanam Luang", address: "Phra Nakhon" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_run_1",
                user: "Jogger Jen",
                text: "Is it okay for beginners to join?",
                timestamp: "10h ago"
            }
        ]
    },
    {
        groupId: "real_bkk_football_soccer",
        name: "Bangkok Football / Soccer ⚽",
        description: "Welcome to this Pick-Up Football focused Meetup Group. CHOOSE THE GAME YOU LIKE UNDER 'EVENTS' BELOW.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 1000,
        memberCount: 454,
        image: "https://source.unsplash.com/800x600/?soccer,football,match&sig=206",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?stadium,grass&sig=206a", caption: "Pitch", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?soccer,goal&sig=206b", caption: "Goal", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?team,sport&sig=206c", caption: "Team", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_20", avatar: "https://i.pravatar.cc/150?u=bkk20" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_ff_soccer_1",
                title: "7-a-side @ Arena 10",
                dateTime: "2026-03-15T16:00:00Z",
                location: { name: "Arena 10", address: "Thonglor" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_ff_soccer_1",
                user: "Goalie One",
                text: "We need 2 more players for Sunday!",
                timestamp: "20m ago"
            }
        ]
    },
    {
        groupId: "real_bkk_football_meetup",
        name: "Bangkok Football Meetup ⚽",
        description: "We started the group in 2019 as an easy way for anyone to get involved in playing regular football. We welcome everyone.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 5000,
        memberCount: 2659,
        image: "https://source.unsplash.com/800x600/?ball,grass,kick&sig=207",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?match,soccer&sig=207a", caption: "Action", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?boots,soccer&sig=207b", caption: "Gear", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?friends,sport&sig=207c", caption: "Squad", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_21", avatar: "https://i.pravatar.cc/150?u=bkk21" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_fb_meet_1",
                title: "Wednesday Night League",
                dateTime: "2026-03-16T19:30:00Z",
                location: { name: "Polo Football Park", address: "Wireless Rd" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_fb_meet_1",
                user: "Referee Rob",
                text: "Don't forget shin guards!",
                timestamp: "2d ago"
            }
        ]
    },
    {
        groupId: "real_bkk_whatever_badminton",
        name: "Whatever Bangkok Badminton 🏸",
        description: "Hey Bird Hitter! We are just a group of people who play badminton regularly on weekends. We have a regular meetup anywhere.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 3000,
        memberCount: 2177,
        image: "https://source.unsplash.com/800x600/?shuttlecock,badminton&sig=208",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?court,gym&sig=208a", caption: "Court", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?match,play&sig=208b", caption: "Match Point", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?racket,sport&sig=208c", caption: "Ready", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_22", avatar: "https://i.pravatar.cc/150?u=bkk22" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_whatever_1",
                title: "Saturday Smash Session",
                dateTime: "2026-03-18T14:00:00Z",
                location: { name: "Winner Sports Avenue", address: "Bang Kapi" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_whatever_1",
                user: "Smash Master",
                text: "Is this court air conditioned?",
                timestamp: "5m ago"
            }
        ]
    },
    {
        groupId: "real_bkk_halal_riders",
        name: "Halal Riders Club 🏍️",
        description: "Welcome to the Halal Riders Club! This group is for anyone who loves motorcycles and follows a halal diet.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 50,
        memberCount: 6,
        image: "https://source.unsplash.com/800x600/?motorcycle,ride,helmet&sig=209",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?bike,road&sig=209a", caption: "On The Road", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?food,halal&sig=209b", caption: "Food Stop", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?motorcycle,group&sig=209c", caption: "The Crew", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_23", avatar: "https://i.pravatar.cc/150?u=bkk23" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_halal_1",
                title: "Ride to Halal Food Market",
                dateTime: "2026-03-20T10:00:00Z",
                location: { name: "Nong Chok Market", address: "Bangkok" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_halal_1",
                user: "Rider Ali",
                text: "Looking for a mechanic who knows vintage bikes.",
                timestamp: "4d ago"
            }
        ]
    },
    {
        groupId: "real_bkk_horseriding",
        name: "Bangkok horseriding Meetup 🐎",
        description: "This is a group for anyone who is interested in Horse riding in Bangkok. If lessons, treks, competitions and camps sound fun.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 300,
        memberCount: 186,
        image: "https://source.unsplash.com/800x600/?horse,riding,equestrian&sig=210",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?stable,horse&sig=210a", caption: "Stables", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?riding,field&sig=210b", caption: "Field", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?horse,jump&sig=210c", caption: "Jumping", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_24", avatar: "https://i.pravatar.cc/150?u=bkk24" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_horse_1",
                title: "Introduction to Polo",
                dateTime: "2026-03-22T09:00:00Z",
                location: { name: "Polo Club", address: "Bangkok" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_horse_1",
                user: "Equestrian E.",
                text: "Do I need my own helmet?",
                timestamp: "1w ago"
            }
        ]
    },
    {
        groupId: "real_bkk_wakeboarding",
        name: "Bangkok Wakeboarding Meetup 🏄",
        description: "Everyone would like to join together? Welcome all levels to wake with us!!",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 400,
        memberCount: 205,
        image: "https://source.unsplash.com/800x600/?wakeboard,lake,splash&sig=211",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?water,sport&sig=211a", caption: "Action", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?wakeboard,jump&sig=211b", caption: "Air Time", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?lake,friends&sig=211c", caption: "Chilling", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_25", avatar: "https://i.pravatar.cc/150?u=bkk25" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_wake_1",
                title: "Sunday Wake Session at Taco Lake",
                dateTime: "2026-03-29T13:00:00Z",
                location: { name: "Taco Lake", address: "Bang Na" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_wake_1",
                user: "Wake Boarder",
                text: "Is Taco Lake better or Thai Wake Park?",
                timestamp: "3d ago"
            }
        ]
    },
    {
        groupId: "real_bkk_fit_fun",
        name: "Fit & Fun 🏋️‍♀️",
        description: "Welcome to our Fit & Fun Meetup group! Are you interested in staying active, meeting new friends, and trying new activities.",
        destination: { city: "Bangkok", country: "Thailand", coordinates: { lat: 13.7563, lng: 100.5018 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Wellness",
        maxMembers: 1000,
        memberCount: 637,
        image: "https://source.unsplash.com/800x600/?gym,fitness,group&sig=212",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?workout,outdoor&sig=212a", caption: "Park Workout", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?yoga,stretch&sig=212b", caption: "Stretch", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?friends,smile&sig=212c", caption: "After Party", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_bkk_26", avatar: "https://i.pravatar.cc/150?u=bkk26" }],
        upcomingMeetups: [
            {
                meetupId: "m_bkk_fit_1",
                title: "Bootcamp in the Park",
                dateTime: "2026-03-21T07:30:00Z",
                location: { name: "Benjasiri Park", address: "Sukhumvit" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_bkk_fit_1",
                user: "Coach Carter",
                text: "Bring a towel and water bottle!",
                timestamp: "2h ago"
            }
        ]
    },
    // --- CAPE TOWN GROUPS (From User Screenshots) ---
    {
        groupId: "real_ct_founders",
        name: "MOIZOR FOUNDERS 🚀",
        description: "This is a private community for entrepreneurs, founders, and builders who question reality, reject mediocrity, and pursue excellence.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "private",
        category: "Business",
        maxMembers: 100,
        memberCount: 2,
        image: "https://source.unsplash.com/800x600/?startup,office,cape-town&sig=301",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?meeting,work&sig=301a", caption: "Brainstorming", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?office,modern&sig=301b", caption: "Workspace", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?people,talking&sig=301c", caption: "Networking", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_1", avatar: "https://i.pravatar.cc/150?u=ct1" }],
        upcomingMeetups: [
            {
                meetupId: "m_ct_founder_1",
                title: "Founders Coffee Morning",
                dateTime: "2026-03-10T08:00:00Z",
                location: { name: "Truth Coffee Roasting", address: "Buitenkant St" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_ct_friends",
        name: "Cape Town Friends 🤝",
        description: "This group is a safe space to make friends. If you want to talk to people, please come to events, do not direct message without consent.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 5000,
        memberCount: 2555,
        image: "https://source.unsplash.com/800x600/?friends,beach,capetown&sig=302",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?beach,sunset&sig=302a", caption: "Beach Day", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?friends,picnic&sig=302b", caption: "Gathering", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?laughing,group&sig=302c", caption: "Fun Times", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_2", avatar: "https://i.pravatar.cc/150?u=ct2" }],
        upcomingMeetups: [
            {
                meetupId: "m_ct_friends_1",
                title: "Sunset Picnic at Signal Hill",
                dateTime: "2026-03-14T17:30:00Z",
                location: { name: "Signal Hill", address: "Cape Town" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_ct_friends_1",
                user: "Sarah K.",
                text: "I'm new to CT, looking for hiking buddies!",
                timestamp: "2d ago"
            }
        ]
    },
    {
        groupId: "real_ct_singles_conscious",
        name: "Singles Done Swiping | Secure Attachment ❤️",
        description: "Welcome to Conscious Connections! We are not a dating app. We are not speed dating. We are here to help you get off the apps.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 3000,
        memberCount: 2510,
        image: "https://source.unsplash.com/800x600/?connection,talk,coffee&sig=303",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?cafe,conversation&sig=303a", caption: "Talks", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?people,smiling&sig=303b", caption: "Meetup", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?handshake,welcome&sig=303c", caption: "Welcome", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_3", avatar: "https://i.pravatar.cc/150?u=ct3" }],
        upcomingMeetups: [
            {
                meetupId: "m_ct_singles_1",
                title: "Authentic Relating Workshop",
                dateTime: "2026-03-20T18:00:00Z",
                location: { name: "The Sanctuary", address: "Gardens" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_ct_beyond_bar",
        name: "Beyond the Bar | Online Speed Connection",
        description: "Welcome To Beyond the Bar Online speed connection events for adults across South Africa. Beyond the Bar creates authentic spaces.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 200,
        memberCount: 60,
        image: "https://source.unsplash.com/800x600/?video,chat,screen&sig=304",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?laptop,coffee&sig=304a", caption: "Remote", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?smile,webcam&sig=304b", caption: "Online", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?group,zoom&sig=304c", caption: "Virtual", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_4", avatar: "https://i.pravatar.cc/150?u=ct4" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_social_circle",
        name: "The Cape Town Social Circle ☕",
        description: "This group was founded in 2014. Initially, it was only about meeting for tea and coffee. These days, we tend to do more.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 1000,
        memberCount: 867,
        image: "https://source.unsplash.com/800x600/?coffee,tea,biscuit&sig=305",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?cafe,table&sig=305a", caption: "Coffee Table", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?cappuccino,art&sig=305b", caption: "Brew", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?chat,friends&sig=305c", caption: "Social", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_5", avatar: "https://i.pravatar.cc/150?u=ct5" }],
        upcomingMeetups: [
            {
                meetupId: "m_ct_coffee_1",
                title: "Monthly Coffee Meetup",
                dateTime: "2026-03-07T10:00:00Z",
                location: { name: "Bootlegger", address: "Sea Point" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_ct_osisi",
        name: "OSISI Social 👩‍🦱",
        description: "For Women Only OSISI Social brings women together to enjoy events, outings, adventures- with friends or even solo.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "private",
        category: "Social",
        maxMembers: 300,
        memberCount: 146,
        image: "https://source.unsplash.com/800x600/?women,friends,laugh&sig=306",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?group,women&sig=306a", caption: "Together", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?happy,smile&sig=306b", caption: "Joy", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?tea,party&sig=306c", caption: "Tea Time", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_6", avatar: "https://i.pravatar.cc/150?u=ct6" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_females",
        name: "Females in Cape Town 🌸",
        description: "!WOMEN ONLY! A warm and inspiring space for women who want to connect, grow, and have fun together. We're all about community.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "private",
        category: "Social",
        maxMembers: 200,
        memberCount: 100,
        image: "https://source.unsplash.com/800x600/?flowers,garden,tea&sig=307",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?picnic,park&sig=307a", caption: "Garden", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?book,read&sig=307b", caption: "Book Club", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?women,talk&sig=307c", caption: "Sharing", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_7", avatar: "https://i.pravatar.cc/150?u=ct7" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_single_women",
        name: "Cape Town /// Single women meet",
        description: "WELCOME TO THE TABLE. Real friendships. Real depth. This is a Cape Town women's community for single women.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "private",
        category: "Social",
        maxMembers: 150,
        memberCount: 83,
        image: "https://source.unsplash.com/800x600/?dinner,table,wine&sig=308",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?food,restaurant&sig=308a", caption: "Dining", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?glass,cheers&sig=308b", caption: "Cheers", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?conversation,night&sig=308c", caption: "Evening", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_8", avatar: "https://i.pravatar.cc/150?u=ct8" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_coffee_rave",
        name: "Coffee Rave ☕💃",
        description: "We're flipping the script on networking and wellness events—no more awkward small talk and dry croissants. We're turning up.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 500,
        memberCount: 150, // estimated
        image: "https://source.unsplash.com/800x600/?dance,music,morning&sig=309",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?coffee,cup&sig=309a", caption: "Fuel", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?people,dancing&sig=309b", caption: "Rave", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?sunrise,energy&sig=309c", caption: "Energy", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_9", avatar: "https://i.pravatar.cc/150?u=ct9" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_comedy",
        name: "Comedy In Common 😂",
        description: "Comedy in Common is a premium comedy show that aims to bring you diverse lineups consisting of the funniest comics in SA.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Entertainment",
        maxMembers: 500,
        memberCount: 133,
        image: "https://source.unsplash.com/800x600/?comedy,stage,mic&sig=310",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?laughing,audience&sig=310a", caption: "Audience", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?microphone,stand&sig=310b", caption: "The Mic", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?club,night&sig=310c", caption: "Venue", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_10", avatar: "https://i.pravatar.cc/150?u=ct10" }],
        upcomingMeetups: [
            {
                meetupId: "m_ct_comedy_1",
                title: "Thursday Night Laughs",
                dateTime: "2026-03-12T20:00:00Z",
                location: { name: "The Armchair Theatre", address: "Observatory" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_ct_winos",
        name: "West Coast Winos 🍷",
        description: "We're a collective of wine-loving folks who get together from time to time in the Blouberg area to taste wines from South Africa.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Food & Drink",
        maxMembers: 1000,
        memberCount: 872,
        image: "https://source.unsplash.com/800x600/?wine,vineyard,grapes&sig=311",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?glass,redwine&sig=311a", caption: "Red", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?cheese,board&sig=311b", caption: "Pairing", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?capetown,winery&sig=311c", caption: "Estate", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_11", avatar: "https://i.pravatar.cc/150?u=ct11" }],
        upcomingMeetups: [
            {
                meetupId: "m_ct_wine_1",
                title: "Stellenbosch Tasting Day",
                dateTime: "2026-03-21T11:00:00Z",
                location: { name: "Meeting Point: Blouberg", address: "Bloubergstrand" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_ct_wine_1",
                user: "Dave R.",
                text: "Anyone want to carpool for the next tasting?",
                timestamp: "5d ago"
            }
        ]
    },
    {
        groupId: "real_ct_beach_picnic",
        name: "Cape Town Beach Picnic 🏖️",
        description: "Join a group of up to 10 people who meet to relax, connect and enjoy Cape Town's amazing beaches. It's all about good vibes.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 500,
        memberCount: 265,
        image: "https://source.unsplash.com/800x600/?campsbay,beach,picnic&sig=312",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?sand,sea&sig=312a", caption: "Shore", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?basket,food&sig=312b", caption: "Snacks", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?sunset,ocean&sig=312c", caption: "Sundown", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_12", avatar: "https://i.pravatar.cc/150?u=ct12" }],
        upcomingMeetups: [
            {
                meetupId: "m_ct_picnic_1",
                title: "Clifton 4th Sunset Picnic",
                dateTime: "2026-03-15T17:00:00Z",
                location: { name: "Clifton 4th Beach", address: "Cape Town" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_ct_new_in_town",
        name: "20's And 30's Cape Town New In Town",
        description: "Targeting, but not limited to, those who are new in town and mainly in their 20's or 30's, here is a group designed for getting connected.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 100,
        memberCount: 25,
        image: "https://source.unsplash.com/800x600/?party,friends,roof&sig=313",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?drinks,cheers&sig=313a", caption: "Drinks", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?city,night&sig=313b", caption: "City Lights", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?music,dance&sig=313c", caption: "Vibe", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_13", avatar: "https://i.pravatar.cc/150?u=ct13" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_connections",
        name: "Circle of Connections 💫",
        description: "The Circle of Connections fosters cultural interactions, enriching conversations, culinary experiences, and unique connections.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 1000,
        memberCount: 620,
        image: "https://source.unsplash.com/800x600/?circle,people,hands&sig=314",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?fire,camp&sig=314a", caption: "Bonfire", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?talk,listen&sig=314b", caption: "Sharing", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?nature,group&sig=314c", caption: "Outdoors", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_14", avatar: "https://i.pravatar.cc/150?u=ct14" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_dinner_club",
        name: "Cape Town Wednesday Dinner Club 🍽️",
        description: "Let's meet for dinner on Wednesdays at a nice restaurant! The purpose of this group is to make new friends and connections.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Food & Drink",
        maxMembers: 100,
        memberCount: 41,
        image: "https://source.unsplash.com/800x600/?restaurant,dinner,food&sig=315",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?chef,cooking&sig=315a", caption: "Chef", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?plate,meal&sig=315b", caption: "Dish", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?wine,glass&sig=315c", caption: "Wine", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_15", avatar: "https://i.pravatar.cc/150?u=ct15" }],
        upcomingMeetups: [
            {
                meetupId: "m_ct_dinner_1",
                title: "Dinner at Kloof Street House",
                dateTime: "2026-03-11T19:30:00Z",
                location: { name: "Kloof Street House", address: "Gardens" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_ct_after_five",
        name: "After Five: Cape Town 🍸",
        description: "This group is for people who are tired of the work-home-eat-sleep loop and want to gently bring more life into their week.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 200,
        memberCount: 63,
        image: "https://source.unsplash.com/800x600/?cocktail,bar,lounge&sig=316",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?drink,fancy&sig=316a", caption: "Signature", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?menu,bar&sig=316b", caption: "Menu", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?friends,night&sig=316c", caption: "Night out", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_16", avatar: "https://i.pravatar.cc/150?u=ct16" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_meridian_hikes",
        name: "Meridian Meetup Hikes 🥾",
        description: "A social club with a hiking problem... We are a group of hikers with a passion for the outdoors, hiking and socialising. Hiking.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 10000,
        memberCount: 7554,
        image: "https://source.unsplash.com/800x600/?hiking,mountain,trail",
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_17", avatar: "https://i.pravatar.cc/150?u=ct17" }],
        upcomingMeetups: [
            {
                meetupId: "m_ct_hike_1",
                title: "Table Mountain Platteklip Gorge",
                dateTime: "2026-03-22T07:00:00Z",
                location: { name: "Lower Cable Station", address: "Table Mountain" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: [
            {
                id: "d_ct_hike_1",
                user: "Hiker Joe",
                text: "Is this hike suitable for beginners?",
                timestamp: "1w ago"
            }
        ]
    },
    {
        groupId: "real_ct_boland",
        name: "Boland Adventures 🏞️",
        description: "Join Boland Adventures (based in Cape Town) for exciting adventures in the great outdoors!. Whether you enjoy hiking, biking.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Adventure",
        maxMembers: 2000,
        memberCount: 1084,
        image: "https://source.unsplash.com/800x600/?adventure,cliff,climb&sig=318",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?rope,climb&sig=318a", caption: "Climbing", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?river,kayak&sig=318b", caption: "River", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?forest,green&sig=318c", caption: "Forest", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_18", avatar: "https://i.pravatar.cc/150?u=ct18" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_soulful_walks",
        name: "Soulful Nature Walks Cape Town",
        description: "Soulful Nature Walks Cape Town, Awesome Adventures & Hiking This is an active group offering Sunday Soulful Nature walks.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 5000,
        memberCount: 2659,
        image: "https://source.unsplash.com/800x600/?forest,trees,light&sig=319",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?fern,leaf&sig=319a", caption: "Flora", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?stream,water&sig=319b", caption: "Stream", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?walk,path&sig=319c", caption: "Walk", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_19", avatar: "https://i.pravatar.cc/150?u=ct19" }],
        upcomingMeetups: [
            {
                meetupId: "m_ct_walk_1",
                title: "Newlands Forest Sunday Walk",
                dateTime: "2026-03-15T09:00:00Z",
                location: { name: "Newlands Forest", address: "Newlands" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_ct_outdoor_ct",
        name: "Outdoor Cape Town 🌿",
        description: "This group is for all the outdoor and nature lovers in and around our beautiful Cape Town. For those who love hiking, walking.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 10000,
        memberCount: 5158,
        image: "https://source.unsplash.com/800x600/?outdoor,sky,sun&sig=320",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?grass,field&sig=320a", caption: "Fields", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?cloud,blue&sig=320b", caption: "Sky", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?group,hike&sig=320c", caption: "Group", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_20", avatar: "https://i.pravatar.cc/150?u=ct20" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_adriano_hikes",
        name: "Adriano hikes Meetup Group",
        description: "Welcome to Adriano Hikes, where we come together to explore new trails and enjoy the great outdoors. Whether you're a beginner.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 500,
        memberCount: 143,
        image: "https://source.unsplash.com/800x600/?hiking,path,scenery&sig=321",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?trail,sun&sig=321a", caption: "Sunlight", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?mountain,view&sig=321b", caption: "Vista", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?boots,hike&sig=321c", caption: "Trekking", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_21", avatar: "https://i.pravatar.cc/150?u=ct21" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_longboarders",
        name: "Cape Town Longboarders Meetup Group 🛹",
        description: "Calling all longboard enthusiasts in Cape Town! Whether you're a seasoned veteran or just starting out, this group is for you.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 500,
        memberCount: 176,
        image: "https://source.unsplash.com/800x600/?longboard,skating,road&sig=322",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?skater,board&sig=322a", caption: "Cruising", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?promenade,sea&sig=322b", caption: "Sea Point", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?group,skate&sig=322c", caption: "Crew", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_22", avatar: "https://i.pravatar.cc/150?u=ct22" }],
        upcomingMeetups: [
            {
                meetupId: "m_ct_skate_1",
                title: "Sea Point Promenade Cruise",
                dateTime: "2026-03-28T16:00:00Z",
                location: { name: "Sea Point Promenade", address: "Cape Town" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_ct_trail_fit",
        name: "Trail Fit South Africa 🏃‍♀️",
        description: "We started out with a vision to inspire people to take action in creating a more active lifestyle, now we offer lots of guided trails.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 5000,
        memberCount: 2148,
        image: "https://source.unsplash.com/800x600/?trailrun,fitness,mountain&sig=323",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?running,trail&sig=323a", caption: "Run", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?forest,run&sig=323b", caption: "Forest Run", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?active,fit&sig=323c", caption: "Fitness", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_23", avatar: "https://i.pravatar.cc/150?u=ct23" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_sweat_lodges",
        name: "Sweat Lodges with Annika",
        description: "Hello, My name is Annika. I am a Native American Ceremonial Practitioner. On a regular basis I offer Sweat Lodges, mainly in CT.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Wellness",
        maxMembers: 500,
        memberCount: 330,
        image: "https://source.unsplash.com/800x600/?fire,tipi,night&sig=324",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?ceremony,fire&sig=324a", caption: "Ritual", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?nature,spiritual&sig=324b", caption: "Nature", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?circle,gathering&sig=324c", caption: "Circle", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_24", avatar: "https://i.pravatar.cc/150?u=ct24" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_sunset_club",
        name: "Cape Town Sunset Club 🌅",
        description: "Every week we get together to watch the sunset, share stories, and connect with open-minded people. Whether you're back packing or local.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 500,
        memberCount: 303,
        image: "https://source.unsplash.com/800x600/?sunset,silhouette,ocean&sig=325",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?sun,sea&sig=325a", caption: "Golden Hour", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?group,watching&sig=325b", caption: "Watching", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?lionhead,sunset&sig=325c", caption: "Lions Head", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_25", avatar: "https://i.pravatar.cc/150?u=ct25" }],
        upcomingMeetups: [
            {
                meetupId: "m_ct_sunset_1",
                title: "Lions Head Sunset Hike",
                dateTime: "2026-03-10T18:00:00Z",
                location: { name: "Lions Head Parking", address: "Signal Hill Rd" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    // --- CAPE TOWN GROUPS BATCH 2 (From User Screenshots) ---
    {
        groupId: "real_ct_connecting_travelers",
        name: "Connecting Travelers with Locals: Cape Town 🌍",
        description: "We are driven by lifestyle travel. We want to know what it is like to live somewhere and what can we learn and experience.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Travel",
        maxMembers: 3000,
        memberCount: 1927,
        image: "https://source.unsplash.com/800x600/?map,travel,compass&sig=326",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?friends,travel&sig=326a", caption: "Explorers", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?passport,bag&sig=326b", caption: "Ready", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?capetown,city&sig=326c", caption: "The City", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_26", avatar: "https://i.pravatar.cc/150?u=ct26" }],
        upcomingMeetups: [
            {
                meetupId: "m_ct_connect_1",
                title: "Local Food Market Tour",
                dateTime: "2026-03-21T10:00:00Z",
                location: { name: "Oranjezicht City Farm Market", address: "V&A Waterfront" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_ct_trail_guides",
        name: "Cape Town Trail Guides 🏔️",
        description: "Welcome to the Cape Town Trail Guides Meetup Group! This group serves as a central hub where registered, vetted, and professional guides meet.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "private",
        category: "Hiking",
        maxMembers: 1000,
        memberCount: 474,
        image: "https://source.unsplash.com/800x600/?guide,map,compass&sig=327",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?mountain,path&sig=327a", caption: "The Way", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?group,leader&sig=327b", caption: "Leading", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?nature,sign&sig=327c", caption: "Trail", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_27", avatar: "https://i.pravatar.cc/150?u=ct27" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_scramblers",
        name: "Cape Town Scramblers 🧗",
        description: "is an outdoor adventure group dedicated to experienced hikers and scramblers who thrive on high-exposure, challenging routes.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "private",
        category: "Adventure",
        maxMembers: 50,
        memberCount: 12,
        image: "https://source.unsplash.com/800x600/?climbing,rock,height&sig=328",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?view,cliff&sig=328a", caption: "Exposure", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?helmet,rope&sig=328b", caption: "Safety", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?hands,chalk&sig=328c", caption: "Grip", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_28", avatar: "https://i.pravatar.cc/150?u=ct28" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_hikers_meet",
        name: "Hikers People Meet 🥾",
        description: "Welcome to our Hikers People Meet Meetup group! We are a community of like-minded individuals who share a love for the outdoors.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 200,
        memberCount: 37,
        image: "https://source.unsplash.com/800x600/?boots,grass,path&sig=329",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?hiker,solo&sig=329a", caption: "Walking", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?nature,green&sig=329b", caption: "Greenery", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?mountain,sky&sig=329c", caption: "Blue Sky", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_29", avatar: "https://i.pravatar.cc/150?u=ct29" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_remote_work",
        name: "Live and Work remotely in Cape Town 💻",
        description: "***Check out Digital Nomads in Cape Town for now we are running combined for now. Hi Everybody. Many of us love to travel.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Technology",
        maxMembers: 1000,
        memberCount: 200,
        image: "https://source.unsplash.com/800x600/?laptop,cafe,working&sig=330",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?coffee,notebook&sig=330a", caption: "Planning", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?coworking,space&sig=330b", caption: "Space", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?digital,nomad&sig=330c", caption: "Nomad Life", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_30", avatar: "https://i.pravatar.cc/150?u=ct30" }],
        upcomingMeetups: [
            {
                meetupId: "m_ct_remote_1",
                title: "Tuesday Coworking @ Workshop17",
                dateTime: "2026-03-17T09:00:00Z",
                location: { name: "Workshop17 Watershed", address: "V&A Waterfront" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_ct_nature_nuts",
        name: "Nature Nuts 🌰",
        description: "Nature Nuts arranges trips and outings allowing participants to experience and share the thrill and excitement of the outdoors.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Nature",
        maxMembers: 1000,
        memberCount: 560,
        image: "https://source.unsplash.com/800x600/?flowers,wild,forest&sig=331",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?bird,tree&sig=331a", caption: "Birdlife", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?leaf,macro&sig=331b", caption: "Detail", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?stream,forest&sig=331c", caption: "Peace", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_31", avatar: "https://i.pravatar.cc/150?u=ct31" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_gluten_path",
        name: "Off the Gluten Path Sea Point Walking Group",
        description: "Looking for a fun, relaxed way to get outside, meet new people, and enjoy the fresh air? We invite you to join our vibrant crew.",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Health",
        maxMembers: 300,
        memberCount: 101,
        image: "https://source.unsplash.com/800x600/?walking,promenade,sea&sig=332",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?friends,walk&sig=332a", caption: "Stroll", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?ocean,view&sig=332b", caption: "View", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?healthy,active&sig=332c", caption: "Healthy", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_32", avatar: "https://i.pravatar.cc/150?u=ct32" }],
        upcomingMeetups: [
            {
                meetupId: "m_ct_gluten_1",
                title: "Sea Point Promenade Power Walk",
                dateTime: "2026-03-14T08:00:00Z",
                location: { name: "Mojo Market", address: "Sea Point" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_ct_watersports",
        name: "Cape Town Watersports 🌊",
        description: "Welcome to all sea lovers. Convivial group to share a moment in the water, watch sea fauna, and have fun. Activities are o...",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 500,
        memberCount: 255,
        image: "https://source.unsplash.com/800x600/?surfboard,ocean,waves&sig=333",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?wetsuit,swim&sig=333a", caption: "Swimming", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?kayak,paddle&sig=333b", caption: "Paddling", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?beach,sand&sig=333c", caption: "Beach", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_33", avatar: "https://i.pravatar.cc/150?u=ct33" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_road_trip",
        name: "Road Trip Strategy and Planning 🚗",
        description: "This is a group for Tickets n Tours and our travel group to meet and discuss our plans to road trip up to Mozambique. We a...",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Travel",
        maxMembers: 500,
        memberCount: 206,
        image: "https://source.unsplash.com/800x600/?roadtrip,car,adventure&sig=334",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?map,dashboard&sig=334a", caption: "Route", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?highway,view&sig=334b", caption: "The Road", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?friends,car&sig=334c", caption: "Trip", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_34", avatar: "https://i.pravatar.cc/150?u=ct34" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_dodgeball_mammoths",
        name: "Milnerton Mammoths Social Dodgeball Club 🤾",
        description: "Love the thrill of dodging, dipping, ducking, and diving? Join us at the Milnerton Mammoths Dodgeball Club! Whether you...",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 500,
        memberCount: 215,
        image: "https://source.unsplash.com/800x600/?dodgeball,court,sport&sig=335",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?team,game&sig=335a", caption: "Team", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?ball,throw&sig=335b", caption: "Throw", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?gym,hall&sig=335c", caption: "Venue", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_35", avatar: "https://i.pravatar.cc/150?u=ct35" }],
        upcomingMeetups: [
            {
                meetupId: "m_ct_mammoth_1",
                title: "Thursday Night Dodgeball",
                dateTime: "2026-03-19T19:00:00Z",
                location: { name: "Milnerton High School Gym", address: "Milnerton" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_ct_dodgeball_phoenix",
        name: "Phoenix Dodgeball Club 🔥",
        description: "Love the thrill of dodging, dipping, ducking, and diving? Join us at the Phoenix Dodgeball Club! Whether you're a seasone...",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 50,
        memberCount: 3,
        image: "https://source.unsplash.com/800x600/?sport,fire,team&sig=336",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?ball,hand&sig=336a", caption: "Ball", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?court,lines&sig=336b", caption: "Court", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?jersey,red&sig=336c", caption: "Kit", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_36", avatar: "https://i.pravatar.cc/150?u=ct36" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_soccer_pickup",
        name: "Cape Town Pick-Up Soccer Meetup Group ⚽",
        description: "Cape Town Play5 is a friendly, social 5-a-side football community for travellers, expats, and locals who want to enjoy the...",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 200,
        memberCount: 45,
        image: "https://source.unsplash.com/800x600/?soccer,futsal,field&sig=337",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?goal,net&sig=337a", caption: "Goal", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?boots,turf&sig=337b", caption: "Turf", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?floodlights,night&sig=337c", caption: "Night Game", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_37", avatar: "https://i.pravatar.cc/150?u=ct37" }],
        upcomingMeetups: [
            {
                meetupId: "m_ct_soccer_2",
                title: "Sunday 5-a-side",
                dateTime: "2026-03-22T10:00:00Z",
                location: { name: "Fives Futbol", address: "Grand Central" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_ct_century_run",
        name: "Century City Running Group 🏃‍♂️",
        description: "Running group for beginner runners in Century City. 5km mor...",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.8900, lng: 18.5100 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 100,
        memberCount: 50,
        image: "https://source.unsplash.com/800x600/?running,bridge,water&sig=338",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?shoes,run&sig=338a", caption: "Laces", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?watch,time&sig=338b", caption: "Timing", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?group,jog&sig=338c", caption: "Jog", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_38", avatar: "https://i.pravatar.cc/150?u=ct38" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_soft_art",
        name: "Soft Art Session 🎨",
        description: "Welcome to Soft Art Sessions, a creative club for people who make things with their hands and hearts. Whether you're int...",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Art",
        maxMembers: 200,
        memberCount: 91,
        image: "https://source.unsplash.com/800x600/?painting,easel,brush&sig=339",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?canvas,color&sig=339a", caption: "Canvas", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?artist,hands&sig=339b", caption: "Creating", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?gallery,art&sig=339c", caption: "Display", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_39", avatar: "https://i.pravatar.cc/150?u=ct39" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_ct_nerds",
        name: "Cape Town Nerds Meetup Group 🤓",
        description: "Our goal is to create a welcoming space for nerds and geeks of all kinds to connect over shared passions, from fantasy an...",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 500,
        memberCount: 182,
        image: "https://source.unsplash.com/800x600/?boardgame,dice,fun&sig=340",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?cards,play&sig=340a", caption: "Cards", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?strategy,game&sig=340b", caption: "Strategy", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?friends,laugh&sig=340c", caption: "Fun", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_40", avatar: "https://i.pravatar.cc/150?u=ct40" }],
        upcomingMeetups: [
            {
                meetupId: "m_ct_nerd_1",
                title: "Board Game Night @ The Eye",
                dateTime: "2026-03-20T18:30:00Z",
                location: { name: "The Eye", address: "Loop St" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_ct_anime_gaming",
        name: "Cape Town Anime and gaming Meetup Group 🎮",
        description: "Welcome to the Cape Town Anime & Gaming Meetup Group! Whether you're a fan of anime, love console gaming, or are in...",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 200,
        memberCount: 63,
        image: "https://source.unsplash.com/800x600/?gaming,controller,screen&sig=341",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?cosplay,event&sig=341a", caption: "Cosplay", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?action,figure&sig=341b", caption: "Collectible", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?lan,party&sig=341c", caption: "LAN", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_41", avatar: "https://i.pravatar.cc/150?u=ct41" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_st_sunshine_trails",
        name: "Sunshine Trails Meetup Group ☀️",
        description: "Our group is for individuals who want to hike our beautiful trails, meet like minded people and experience nature. We do n...",
        destination: { city: "Cape Town", country: "South Africa", coordinates: { lat: -33.9249, lng: 18.4241 } }, // Using CT coords for searchability, though based in Strand
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 500,
        memberCount: 100,
        image: "https://source.unsplash.com/800x600/?sunshine,trail,happy&sig=342",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?flower,sun&sig=342a", caption: "Bright", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?group,walk&sig=342b", caption: "Walking", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?ocean,blue&sig=342c", caption: "The Deep", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_ct_42", avatar: "https://i.pravatar.cc/150?u=ct42" }],
        upcomingMeetups: [],
        discussions: []
    },
    // --- SYDNEY GROUPS (From User Screenshots) ---
    {
        groupId: "real_syd_link",
        name: "L.I.N.K 🔗",
        description: "L.I.N.K exists for people who enjoy shared meals, small hosted events, and relaxed social connection with others who value depth.",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "private",
        category: "Social",
        maxMembers: 100,
        memberCount: 13,
        image: "https://source.unsplash.com/800x600/?dinner,fireplace,cozy&sig=401",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?candle,light&sig=401a", caption: "Atmosphere", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?people,talking&sig=401b", caption: "Deep Talk", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?wine,glass&sig=401c", caption: "Wine", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_1", avatar: "https://i.pravatar.cc/150?u=syd1" }],
        upcomingMeetups: [
            {
                meetupId: "m_syd_link_1",
                title: "Intimate Dinner Party",
                dateTime: "2026-03-14T19:00:00Z",
                location: { name: "Host's Home", address: "Surry Hills" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_syd_outdoors_meetup",
        name: "Sydney Outdoors Meetup Group ⛺",
        description: "Outdoor adventure group, based in Sydney and venturing far beyond! We love hiking, camping, and exploring the wilderness.",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 20000,
        memberCount: 15143,
        image: "https://source.unsplash.com/800x600/?bluemountains,hiking,australia&sig=402",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?canyon,view&sig=402a", caption: "Canyon", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?gumtree,forest&sig=402b", caption: "Bushland", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?backpack,hike&sig=402c", caption: "Adventure", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_2", avatar: "https://i.pravatar.cc/150?u=syd2" }],
        upcomingMeetups: [
            {
                meetupId: "m_syd_outdoors_1",
                title: "Blue Mountains Canyon Walk",
                dateTime: "2026-03-21T08:00:00Z",
                location: { name: "Katoomba Station", address: "Blue Mountains" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_syd_hike_bar",
        name: "WE HIKE. WE WALK... to the BAR. 🍺",
        description: "Howdy. MJ here. I'm a Chicago fella now +22yrs in Sydneytown living in the CBD. We hike, we walk, and we reward ourselves.",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 6000,
        memberCount: 5342,
        image: "https://source.unsplash.com/800x600/?pub,beer,sydney&sig=403",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?beer,tap&sig=403a", caption: "On Tap", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?rooftop,bar&sig=403b", caption: "Rooftop", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?cheers,group&sig=403c", caption: "Cheers", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_3", avatar: "https://i.pravatar.cc/150?u=syd3" }],
        upcomingMeetups: [
            {
                meetupId: "m_syd_bar_1",
                title: "Coastal Walk + Rooftop Beers",
                dateTime: "2026-03-13T16:00:00Z",
                location: { name: "Coogee Pavilion", address: "Coogee" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_syd_wanders_40plus",
        name: "Sydney - Wanders Walks Weekends 40+ 🌿",
        description: "Life is too short to spend the weekend on the lounge. Come outside, make some friends and see Sydney's best spots. Carpe Diem!",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 1000,
        memberCount: 727,
        image: "https://source.unsplash.com/800x600/?group,seniors,nature&sig=404",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?walking,stick&sig=404a", caption: "Walking", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?picnic,rug&sig=404b", caption: "Rest", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?laughing,friends&sig=404c", caption: "Friends", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_4", avatar: "https://i.pravatar.cc/150?u=syd4" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_beach_events",
        name: "Beach Events 🏖️🍹 Food & Drinks",
        description: "Welcome to Sydney Beach Events, Food & Drinks meetup group. Have you added us on Instagram? We love sun, sand, and socials.",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 5000,
        memberCount: 3894,
        image: "https://source.unsplash.com/800x600/?bondi,beach,summer&sig=405",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?sand,surf&sig=405a", caption: "surf", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?cocktail,beach&sig=405b", caption: "Refresh", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?volleyball,net&sig=405c", caption: "Volleyball", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_5", avatar: "https://i.pravatar.cc/150?u=syd5" }],
        upcomingMeetups: [
            {
                meetupId: "m_syd_beach_1",
                title: "Bondi Beach BBQ",
                dateTime: "2026-03-15T12:00:00Z",
                location: { name: "Bondi Park", address: "Bondi Beach" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_syd_oz_outdoors",
        name: "OZ Outdoors 🌄",
        description: "Craving fresh air and epic adventures? You're in the right place. From hidden city gems to wild mountain trails, day hikes to trips.",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 5000,
        memberCount: 3117,
        image: "https://source.unsplash.com/800x600/?waterfall,forest,fern&sig=406",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?creek,water&sig=406a", caption: "Creek", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?rock,hike&sig=406b", caption: "Rock", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?nature,australia&sig=406c", caption: "Wild", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_6", avatar: "https://i.pravatar.cc/150?u=syd6" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_easy_pace",
        name: "Easy Pace Adventures 🚶‍♂️",
        description: "Welcome Happy Walkers!!! This group is for those looking to get together outdoors and improve their health and fitness gently.",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 5000,
        memberCount: 4287,
        image: "https://source.unsplash.com/800x600/?lighthouse,ocean,walk&sig=407",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?coast,cliff&sig=407a", caption: "Coast", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?path,walking&sig=407b", caption: "Path", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?view,sea&sig=407c", caption: "Ocean View", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_7", avatar: "https://i.pravatar.cc/150?u=syd7" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_evening_walks",
        name: "Evening Walks Club by OZ Outdoors 🌙",
        description: "Welcome to the Evening Walks Club – a sister group of OZ Outdoors, created for those who love mid-week evening walks.",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 200,
        memberCount: 67,
        image: "https://source.unsplash.com/800x600/?city,night,harbour&sig=408",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?lights,bridge&sig=408a", caption: "Lights", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?opera,house,night&sig=408b", caption: "Icon", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?walk,street&sig=408c", caption: "City Walk", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_8", avatar: "https://i.pravatar.cc/150?u=syd8" }],
        upcomingMeetups: [
            {
                meetupId: "m_syd_eve_walk_1",
                title: "Vivid Sydney Light Walk",
                dateTime: "2026-05-28T18:00:00Z",
                location: { name: "Circular Quay", address: "Sydney" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_syd_sailboat_crew",
        name: "Sydney Sailboat Crew Meetup ⛵",
        description: "AS I'M LOOKING FOR PEOPLE WHO ONCE TAUGHT WILL JOIN MY CREW. The requirements are max weight 75kg... (Just kidding?)",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 100,
        memberCount: 26,
        image: "https://source.unsplash.com/800x600/?sailboat,yacht,ocean&sig=409",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?sail,wind&sig=409a", caption: "Sailing", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?deck,boat&sig=409b", caption: "On Deck", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?harbour,view&sig=409c", caption: "Harbour", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_9", avatar: "https://i.pravatar.cc/150?u=syd9" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_social_walks",
        name: "Sydney Social Walks. Networking & Friends. 👟",
        description: "Sydney Social Walks does short and long walks to great places around Sydney. Always followed by food and drinks as a group.",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 20000,
        memberCount: 15293,
        image: "https://source.unsplash.com/800x600/?sydney,opera,walk&sig=410",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?bridge,climb&sig=410a", caption: "The Bridge", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?circular,quay&sig=410b", caption: "Quay", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?group,tourist&sig=410c", caption: "Touring", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_10", avatar: "https://i.pravatar.cc/150?u=syd10" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_adventurers_mix",
        name: "Sydney Adventurers 20s-40s 🧗‍♀️",
        description: "OZ Adventurers provides a platform for young adventurers to explore Australia and the world, and to make more friends.",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Adventure",
        maxMembers: 20000,
        memberCount: 17239,
        image: "https://source.unsplash.com/800x600/?cliff,adventure,ocean&sig=411",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?jump,water&sig=411a", caption: "Jump", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?hike,tough&sig=411b", caption: "Challenge", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?view,height&sig=411c", caption: "Height", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_11", avatar: "https://i.pravatar.cc/150?u=syd11" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_hiking_simple",
        name: "Sydney Hiking 🌲",
        description: "Get fit hiking around Sydney & surrounds (as well as occasionally anywhere around Australia & the world). In the past we have...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 2500,
        memberCount: 1898,
        image: "https://source.unsplash.com/800x600/?bushwalk,gumtrees,path&sig=412",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?fern,green&sig=412a", caption: "Ferns", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?trail,dirt&sig=412b", caption: "Dirt Track", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?australia,bush&sig=412c", caption: "The Bush", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_12", avatar: "https://i.pravatar.cc/150?u=syd12" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_ome_olife",
        name: "O Me! O Life! 🗣️",
        description: "Welcome to O Me! O Life! The main purpose of OME OLIFE is to improve your conversational skills, gain confidence and learn.",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 25000,
        memberCount: 20657,
        image: "https://source.unsplash.com/800x600/?conversation,people,bar&sig=413",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?listen,talk&sig=413a", caption: "Listening", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?group,circle&sig=413b", caption: "Circle", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?drink,social&sig=413c", caption: "Social", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_13", avatar: "https://i.pravatar.cc/150?u=syd13" }],
        upcomingMeetups: [
            {
                meetupId: "m_syd_talk_1",
                title: "Thursday Social Drinks",
                dateTime: "2026-03-12T18:00:00Z",
                location: { name: "The Pyrmont Bridge Hotel", address: "Pyrmont" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_syd_blue_snorkel",
        name: "Blue Connections Snorkelling 🤿",
        description: "We are a group of passionate snorkellers based in Sydney's Eastern Suburbs. We hope to inspire a movement of nature connection.",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Nature",
        maxMembers: 500,
        memberCount: 219,
        image: "https://source.unsplash.com/800x600/?snorkel,underwater,reef&sig=414",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?fish,colorful&sig=414a", caption: "Fish", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?ocean,clear&sig=414b", caption: "Clear Water", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?diver,mask&sig=414c", caption: "Diving", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_14", avatar: "https://i.pravatar.cc/150?u=syd14" }],
        upcomingMeetups: [
            {
                meetupId: "m_syd_snorkel_1",
                title: "Clovelly Bay Snorkel",
                dateTime: "2026-03-22T10:00:00Z",
                location: { name: "Clovelly Beach", address: "Clovelly" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_syd_mtb_riders",
        name: "East Coast Mountain Bike Riders 🚵",
        description: "This Meetup group is for anyone who enjoys cycling, from beginner to intermediate skills and fitness. We aim for a ride every...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 1500,
        memberCount: 986,
        image: "https://source.unsplash.com/800x600/?mtb,bike,trail&sig=415",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?cyclist,jump&sig=415a", caption: "Jump", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?mud,wheel&sig=415b", caption: "Muddy", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?forest,ride&sig=415c", caption: "Riding", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_15", avatar: "https://i.pravatar.cc/150?u=syd15" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_sailing_harbour",
        name: "Sailing on Sydney Harbour Meetup Group ⛵",
        description: "Welcome to the Sailing on Sydney Harbour Meetup Group! Whether you're an experienced sailor or just looking to learn the ropes.",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 100,
        memberCount: 80,
        image: "https://source.unsplash.com/800x600/?sydneyharbour,sail,bridge&sig=416",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?water,blue&sig=416a", caption: "Blue Water", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?boat,racing&sig=416b", caption: "Racing", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?sunset,sail&sig=416c", caption: "Sunset Sail", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_16", avatar: "https://i.pravatar.cc/150?u=syd16" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_switched_on",
        name: "Switched On Sydney Socials by Local Sauce 🥂",
        description: "This group is for anyone interested in eating, drinking and exploring more of Sydney, while making friends from all over the world.",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 2000,
        memberCount: 1785,
        image: "https://source.unsplash.com/800x600/?party,toast,celebrate&sig=417",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?food,platter&sig=417a", caption: "Food", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?friends,happy&sig=417b", caption: "Happy", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?bar,lights&sig=417c", caption: "Bar", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_17", avatar: "https://i.pravatar.cc/150?u=syd17" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_off_peaks",
        name: "Off Peaks Club ⛰️",
        description: "This club is for former and prospective Three Peaks Challenge participants – and their family and friends We have three styles.",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 500,
        memberCount: 426,
        image: "https://source.unsplash.com/800x600/?mountain,peak,view&sig=418",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?climb,top&sig=418a", caption: "Top", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?rock,scramble&sig=418b", caption: "Scramble", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?sky,high&sig=418c", caption: "High Up", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_18", avatar: "https://i.pravatar.cc/150?u=syd18" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_boat_cruises",
        name: "FREE Boat Cruises On Sydney Harbour! 🛥️",
        description: "Join us for adventure boat trips exploring Sydney Harbour - The World's Most Beautiful Harbour. Meet new friends, learn.",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 200,
        memberCount: 79,
        image: "https://source.unsplash.com/800x600/?boat,cruise,party&sig=419",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?water,wake&sig=419a", caption: "Wake", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?drink,deck&sig=419b", caption: "Drinks", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?harbour,day&sig=419c", caption: "Daytime", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_19", avatar: "https://i.pravatar.cc/150?u=syd19" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_snorkelling_meet",
        name: "Sydney Snorkelling Meetup Group 🐠",
        description: "Join a group of likeminded Snorkelling and freediving enthusiasts. Join us here and on Facebook where you can connect a...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Nature",
        maxMembers: 10000,
        memberCount: 7502,
        image: "https://source.unsplash.com/800x600/?underwater,coral,fish&sig=420",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?scuba,fins&sig=420a", caption: "Fins", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?gopro,selfie&sig=420b", caption: "Selfie", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?bubbles,water&sig=420c", caption: "Bubbles", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_20", avatar: "https://i.pravatar.cc/150?u=syd20" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_social_circle_young",
        name: "Sydney Social Circle [20s-30s] 🥂",
        description: "Welcome, we go to events as a group. Boat parties, bar crawls, nightclubs, festivals and private parties in Sydney 🥂",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 10000,
        memberCount: 6770,
        image: "https://source.unsplash.com/800x600/?club,dance,dj&sig=421",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?lights,laser&sig=421a", caption: "Lasers", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?music,loud&sig=421b", caption: "Music", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?hands,air&sig=421c", caption: "Party", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_21", avatar: "https://i.pravatar.cc/150?u=syd21" }],
        upcomingMeetups: [
            {
                meetupId: "m_syd_party_1",
                title: "Saturday Night Bar Crawl",
                dateTime: "2026-03-28T20:00:00Z",
                location: { name: "The Rocks", address: "Sydney" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_syd_unhurried",
        name: "Unhurried Conversations Sydney ☕",
        description: "We've been thinking about the quality of being unhurried. There's a lot of pressure to get a move on in life, but the best cr...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 5000,
        memberCount: 3547,
        image: "https://source.unsplash.com/800x600/?coffee,mug,hands&sig=422",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?latte,art&sig=422a", caption: "Latte", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?cafe,interior&sig=422b", caption: "Interior", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?peaceful,morning&sig=422c", caption: "Peace", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_22", avatar: "https://i.pravatar.cc/150?u=syd22" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_travel_50plus",
        name: "Our Time To Travel 50 plus Ladies Meetup ✈️",
        description: "Welcome to Our Time To Travel! If you are aged 50-70 years old, single or married (without a travelling partner), you have c...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "private",
        category: "Travel",
        maxMembers: 1000,
        memberCount: 605,
        image: "https://source.unsplash.com/800x600/?airport,luggage,travel&sig=423",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?plane,window&sig=423a", caption: "Window Seat", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?map,pin&sig=423b", caption: "Destination", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?women,group&sig=423c", caption: "Travelers", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_23", avatar: "https://i.pravatar.cc/150?u=syd23" }],
        upcomingMeetups: [],
        discussions: []
    },
    // --- SYDNEY GROUPS BATCH 2 (From User Screenshots) ---
    {
        groupId: "real_syd_coffee_tours",
        name: "Sydney Coffee Tours ☕",
        description: "Sydney Coffee Tours is all about exploring the world of specialty coffee. Your tour guide, Shu will guide you on coffee to...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Food & Drink",
        maxMembers: 1000,
        memberCount: 784,
        image: "https://source.unsplash.com/800x600/?barista,coffee,machine&sig=424",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?latte,pour&sig=424a", caption: "Pouring", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?cafe,window&sig=424b", caption: "Cafe Vibe", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?beans,roast&sig=424c", caption: "Roasting", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_24", avatar: "https://i.pravatar.cc/150?u=syd24" }],
        upcomingMeetups: [
            {
                meetupId: "m_syd_coffee_1",
                title: "Surry Hills Cafe Crawl",
                dateTime: "2026-03-21T10:00:00Z",
                location: { name: "Paramount Coffee Project", address: "Surry Hills" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_syd_active_singles_40s",
        name: "Social Active Singles Over 40's 💃",
        description: "Are you looking for opportunities to extend your social circle & get out & about in our gorgeous city? Are you single & ag...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 1000,
        memberCount: 434,
        image: "https://source.unsplash.com/800x600/?social,drinks,cocktail&sig=425",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?laugh,group&sig=425a", caption: "Laughing", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?bar,friends&sig=425b", caption: "Catchup", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?cheers,wine&sig=425c", caption: "Cheers", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_25", avatar: "https://i.pravatar.cc/150?u=syd25" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_meetup_main",
        name: "Sydney Meetup 🌉",
        description: "Want to meet someone or expand your social circle? New to Sydney? Born and raised your entire life? Or just visiting?...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 20000,
        memberCount: 13771,
        image: "https://source.unsplash.com/800x600/?sydney,harbour,bridge&sig=426",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?opera,house&sig=426a", caption: "Opera House", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?ferry,manly&sig=426b", caption: "Ferry", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?rocks,sydney&sig=426c", caption: "The Rocks", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_26", avatar: "https://i.pravatar.cc/150?u=syd26" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_northern_beaches_50s",
        name: "Northern Beaches Baby Boomers 50+ Meetup",
        description: "NBBB Meetup Memberships are open again to MANLY/WARRINGAH/PITTWATER residents wanting to meet new people in...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "private",
        category: "Social",
        maxMembers: 300,
        memberCount: 155,
        image: "https://source.unsplash.com/800x600/?beaches,seniors,relax&sig=427",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?walk,sand&sig=427a", caption: "Beach Walk", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?coffee,beach&sig=427b", caption: "Coffee", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?group,happy&sig=427c", caption: "Group", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_27", avatar: "https://i.pravatar.cc/150?u=syd27" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_bushwalks",
        name: "Sydney Bushwalks & Getaways 🌿",
        description: "ABOUT US. We are a fun loving and friendly group of people from all over the world, that has been set up primarily to orga...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 2000,
        memberCount: 1165,
        image: "https://source.unsplash.com/800x600/?bushwalk,nationalpark,trail&sig=428",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?eucalyptus,tree&sig=428a", caption: "Gum Trees", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?rock,formation&sig=428b", caption: "Rocks", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?lookout,view&sig=428c", caption: "Lookout", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_28", avatar: "https://i.pravatar.cc/150?u=syd28" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_surry_social_coffee",
        name: "Surry Hills Social Locals' Coffee Club ☕",
        description: "Our simple concept: gather with a group of locals on a regular basis to form friendships. Introducing the Social Surry Locals...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 3000,
        memberCount: 1886,
        image: "https://source.unsplash.com/800x600/?cafe,surryhills,coffee&sig=429",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?brunch,food&sig=429a", caption: "Brunch", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?coffee,friends&sig=429b", caption: "Friends", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?street,cafe&sig=429c", caption: "Street Side", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_29", avatar: "https://i.pravatar.cc/150?u=syd29" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_single_events",
        name: "Sydney Single Events 🥂",
        description: "We're a Sydney based events company bringing singles together in the real world — no apps, no swiping, just genuine con...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 500,
        memberCount: 393,
        image: "https://source.unsplash.com/800x600/?singles,party,night&sig=430",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?dance,floor&sig=430a", caption: "Dance", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?bar,drink&sig=430b", caption: "Drinks", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?chat,new&sig=430c", caption: "Talking", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_30", avatar: "https://i.pravatar.cc/150?u=syd30" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_meetup_wednesday",
        name: "Sydney Meetup – Weekly Wednesday Event!",
        description: "Venue: Mountbatten Hotel 701 George Street, Haymarket NSW Date & Time: Wednesday, 26 Nov 7:00 PM Start ...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 500,
        memberCount: 231,
        image: "https://source.unsplash.com/800x600/?pub,wednesday,friends&sig=431",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?beer,pub&sig=431a", caption: "Pub", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?burger,chips&sig=431b", caption: "Pub Food", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?group,table&sig=431c", caption: "Table", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_31", avatar: "https://i.pravatar.cc/150?u=syd31" }],
        upcomingMeetups: [
            {
                meetupId: "m_syd_wed_1",
                title: "Weekly Wednesday Drinks",
                dateTime: "2026-03-11T19:00:00Z",
                location: { name: "Mountbatten Hotel", address: "Haymarket" },
                attendees: [],
                status: "upcoming"
            }
        ],
        discussions: []
    },
    {
        groupId: "real_syd_paris_chic",
        name: "From Paris Chic to Sydney Style 50+ 👗",
        description: "This group is for WOMEN only, those seeking fun and new friendships and to explore everything that Sydney has to offer.",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "private",
        category: "Social",
        maxMembers: 200,
        memberCount: 114,
        image: "https://source.unsplash.com/800x600/?fashion,paris,style&sig=432",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?dress,chic&sig=432a", caption: "Chic", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?tea,high&sig=432b", caption: "High Tea", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?shopping,bag&sig=432c", caption: "Shopping", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_32", avatar: "https://i.pravatar.cc/150?u=syd32" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_kitchen_catchup",
        name: "Kitchen Catchup 🍰",
        description: "Calling all passionate foodies, from home cooks & bakers to professional chefs, to share tips and tricks relating to cooking...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Food & Drink",
        maxMembers: 2000,
        memberCount: 1003,
        image: "https://source.unsplash.com/800x600/?cooking,kitchen,bake&sig=433",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?cake,baking&sig=433a", caption: "Baking", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?chef,knife&sig=433b", caption: "Prep", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?dinner,party&sig=433c", caption: "Feast", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_33", avatar: "https://i.pravatar.cc/150?u=syd33" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_social_walks_20s30s",
        name: "Sydney Social Walks & Adventures 20s-30s",
        description: "Welcome! This is a social group for anyone in Sydney or surrounding areas who wants to meet new people, make new f...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Hiking",
        maxMembers: 3000,
        memberCount: 1726,
        image: "https://source.unsplash.com/800x600/?coastal,walk,bondi&sig=434",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?cliff,ocean&sig=434a", caption: "Cliffs", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?group,walking&sig=434b", caption: "Group", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?sun,hat&sig=434c", caption: "Sunny", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_34", avatar: "https://i.pravatar.cc/150?u=syd34" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_sociale",
        name: "Sydney Sociale Meetup Group 🥳",
        description: "Welcome to Sydney Sociale! We're all about bringing people together so no one feels alone in Sydney. Whether it's trying...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 300,
        memberCount: 179,
        image: "https://source.unsplash.com/800x600/?dinner,friends,restaurant&sig=435",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?wine,toast&sig=435a", caption: "Toast", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?food,italian&sig=435b", caption: "Italian", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?smile,laugh&sig=435c", caption: "Good Times", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_35", avatar: "https://i.pravatar.cc/150?u=syd35" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_cbd_coffee",
        name: "Sydney CBD Coffee Days & Party Nights Club",
        description: "Welcome to Sydney CBD Coffee Days & Party Nights Club! This group is for those who enjoy socializing, making new fri...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 200,
        memberCount: 128,
        image: "https://source.unsplash.com/800x600/?coffee,city,night&sig=436",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?espresso,martini&sig=436a", caption: "Cocktail", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?cafe,dark&sig=436b", caption: "Night Cafe", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?street,lights&sig=436c", caption: "Streets", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_36", avatar: "https://i.pravatar.cc/150?u=syd36" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_singles_secure",
        name: "Sydney Singles Done Swiping | Secure Attachment",
        description: "Global Conscious Connections We are not a dating app. We are not speed dating. We are here to help you get out th...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 300,
        memberCount: 185,
        image: "https://source.unsplash.com/800x600/?connection,authentic,people&sig=437",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?eyes,contact&sig=437a", caption: "Connection", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?group,workshop&sig=437b", caption: "Workshop", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?hug,friend&sig=437c", caption: "Hugs", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_37", avatar: "https://i.pravatar.cc/150?u=syd37" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_first_meetup",
        name: "First Meetup? Small Group Socials 🤝",
        description: "This group is for anyone who's new to Meetup, new to Sydney, or just wants a relaxed, small-group social experience. Ou...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Social",
        maxMembers: 150,
        memberCount: 78,
        image: "https://source.unsplash.com/800x600/?welcome,handshake,meetup&sig=438",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?name,tag&sig=438a", caption: "Hello", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?coffee,meet&sig=438b", caption: "First Meet", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?smile,wave&sig=438c", caption: "Friendly", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_38", avatar: "https://i.pravatar.cc/150?u=syd38" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_atomic_habits",
        name: "Atomic Habits - Crafting A Better Future 📚",
        description: "Welcome to Your Transformational 2026 A year that isn't just new — it's yours to design. 2026 has arrived, and it's aski...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Education",
        maxMembers: 100,
        memberCount: 22,
        image: "https://source.unsplash.com/800x600/?journal,pen,writing&sig=439",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?book,read&sig=439a", caption: "Study", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?notes,sticky&sig=439b", caption: "Planning", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?coffee,desk&sig=439c", caption: "Focus", user: "Unsplash" }
        ],
        verified: false,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_39", avatar: "https://i.pravatar.cc/150?u=syd39" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_ufc_boxing",
        name: "UFC / Boxing 🥊",
        description: "Join the Fight Night Crew! Are you a combat sports fanatic? Do you love the thrill of UFC and boxing events? The...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 500,
        memberCount: 313,
        image: "https://source.unsplash.com/800x600/?boxing,gym,training&sig=440",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?gloves,punch&sig=440a", caption: "Sparring", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?ring,corner&sig=440b", caption: "The Ring", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?sweat,towel&sig=440c", caption: "Workout", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_40", avatar: "https://i.pravatar.cc/150?u=syd40" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_pickleball_nsw",
        name: "Pickleball Association of NSW 🥒",
        description: "Group Etiquette The information contained within the Pickleball Association of NSW Meetup group is not to be copied or...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 15000,
        memberCount: 9396,
        image: "https://source.unsplash.com/800x600/?pickleball,net,game&sig=441",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?paddle,ball&sig=441a", caption: "Serve", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?court,outdoor&sig=441b", caption: "Court", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?friends,play&sig=441c", caption: "Match", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_41", avatar: "https://i.pravatar.cc/150?u=syd41" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_soccer_beginner",
        name: "Beginner Soccer ⚽",
        description: "Do you play Soccer already but not getting enough passes from the team? Or you lose the ball too easily? Or you never p...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 10000,
        memberCount: 8459,
        image: "https://source.unsplash.com/800x600/?soccer,training,cones&sig=442",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?ball,kick&sig=442a", caption: "Drills", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?coach,whistle&sig=442b", caption: "Coach", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?grass,green&sig=442c", caption: "Park", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_42", avatar: "https://i.pravatar.cc/150?u=syd42" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_soccer_friendly",
        name: "Sydney Friendly Soccer! 🥅",
        description: "Hey there! We are a mixed group of people who love to get out and play soccer! We are inclusive of people of all ages, all...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 10000,
        memberCount: 6984,
        image: "https://source.unsplash.com/800x600/?football,team,huddle&sig=443",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?goal,post&sig=443a", caption: "Posts", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?jersey,blue&sig=443b", caption: "Colors", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?fans,cheer&sig=443c", caption: "Fans", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_43", avatar: "https://i.pravatar.cc/150?u=syd43" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_badminton",
        name: "Sydney Badminton Regular Meetup 🏸",
        description: "We are a group of regular badminton players. This is the right place for those like a good workout with experienced baddi...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 5000,
        memberCount: 2331,
        image: "https://source.unsplash.com/800x600/?badminton,court,net&sig=444",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?shuttle,fly&sig=444a", caption: "Smash", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?racket,grip&sig=444b", caption: "Ready", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?hall,sport&sig=444c", caption: "Indoor", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_44", avatar: "https://i.pravatar.cc/150?u=syd44" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_domain_football",
        name: "Domain Football 🏉",
        description: "This is a private group designed for existing players in Domain Lunchtime football. New members can only join by invitation.",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "private",
        category: "Sports",
        maxMembers: 300,
        memberCount: 173,
        image: "https://source.unsplash.com/800x600/?rugby,football,park&sig=445",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?kick,ball&sig=445a", caption: "Kick", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?run,field&sig=445b", caption: "Run", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?lunch,break&sig=445c", caption: "Lunch Game", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_45", avatar: "https://i.pravatar.cc/150?u=syd45" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_fun_tennis",
        name: "Fun Tennis for Fitness 🎾",
        description: "First up, this isn't a normal social tennis hit. And here's where I'm coming from: I enjoy playing tennis not just because it is f...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 3000,
        memberCount: 1897,
        image: "https://source.unsplash.com/800x600/?tennis,outdoors,sun&sig=446",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?serve,ball&sig=446a", caption: "Service", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?court,clay&sig=446b", caption: "Clay", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?drink,break&sig=446c", caption: "Break", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_46", avatar: "https://i.pravatar.cc/150?u=syd46" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_topshot_badminton",
        name: "Topshot Badminton Meetup 🏸",
        description: "Are you a 'Baddict - Badminton addict?' We're all about playing badminton socially, keeping fit and having fun with like mi...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 5000,
        memberCount: 4583,
        image: "https://source.unsplash.com/800x600/?badminton,match,competitive&sig=447",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?score,board&sig=447a", caption: "Score", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?team,doubles&sig=447b", caption: "Doubles", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?win,celebrate&sig=447c", caption: "Winning", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_47", avatar: "https://i.pravatar.cc/150?u=syd47" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_marconi_pickleball",
        name: "Marconi Pickleball Tennis Squash Meetup Group",
        description: "At Marconi Tennis, Pickleball, and Squash, we believe in the power of community and competition. That's why we're thrille...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Sports",
        maxMembers: 500,
        memberCount: 416,
        image: "https://source.unsplash.com/800x600/?squash,racquet,wall&sig=448",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?ball,hit&sig=448a", caption: "Hit", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?court,indoor&sig=448b", caption: "Court", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?sweat,band&sig=448c", caption: "Intense", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_48", avatar: "https://i.pravatar.cc/150?u=syd48" }],
        upcomingMeetups: [],
        discussions: []
    },
    {
        groupId: "real_syd_ikigai",
        name: "Ikigai Sydney by Morgaia - Create a Life You Love ❤️",
        description: "Where purpose meets possibility, create a life you love! Ikigai Inner Circle Sydney is a welcoming space for reflection, conn...",
        destination: { city: "Sydney", country: "Australia", coordinates: { lat: -33.8688, lng: 151.2093 } },
        travelDates: { startDate: "2026-01-01", endDate: "2026-12-31" },
        type: "public",
        category: "Wellness",
        maxMembers: 1000,
        memberCount: 634,
        image: "https://source.unsplash.com/800x600/?meditate,zen,garden&sig=449",
        gallery: [
            { url: "https://source.unsplash.com/800x600/?lotus,flower&sig=449a", caption: "Lotus", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?book,life&sig=449b", caption: "Learning", user: "Unsplash" },
            { url: "https://source.unsplash.com/800x600/?candle,flame&sig=449c", caption: "Calm", user: "Unsplash" }
        ],
        verified: true,
        source: "meetup_scrape",
        members: [{ userId: "u_syd_49", avatar: "https://i.pravatar.cc/150?u=syd49" }],
        upcomingMeetups: [],
        discussions: []
    }
];

