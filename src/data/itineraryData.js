// =============================
// INDIAN STATES (28) + UNION TERRITORIES (8) = 36
// Format follows your example exactly
// =============================

export const indianStates = [
  { id: 1, name: 'Andhra Pradesh' },
  { id: 2, name: 'Arunachal Pradesh' },
  { id: 3, name: 'Assam' },
  { id: 4, name: 'Bihar' },
  { id: 5, name: 'Chhattisgarh' },
  { id: 6, name: 'Goa' },
  { id: 7, name: 'Gujarat' },
  { id: 8, name: 'Haryana' },
  { id: 9, name: 'Himachal Pradesh' },
  { id: 10, name: 'Jharkhand' },
  { id: 11, name: 'Karnataka' },
  { id: 12, name: 'Kerala' },
  { id: 13, name: 'Madhya Pradesh' },
  { id: 14, name: 'Maharashtra' },
  { id: 15, name: 'Manipur' },
  { id: 16, name: 'Meghalaya' },
  { id: 17, name: 'Mizoram' },
  { id: 18, name: 'Nagaland' },
  { id: 19, name: 'Odisha' },
  { id: 20, name: 'Punjab' },
  { id: 21, name: 'Rajasthan' },
  { id: 22, name: 'Sikkim' },
  { id: 23, name: 'Tamil Nadu' },
  { id: 24, name: 'Telangana' },
  { id: 25, name: 'Tripura' },
  { id: 26, name: 'Uttar Pradesh' },
  { id: 27, name: 'Uttarakhand' },
  { id: 28, name: 'West Bengal' },
  { id: 29, name: 'Andaman & Nicobar Islands' },
  { id: 30, name: 'Chandigarh' },
  { id: 31, name: 'Dadra & Nagar Haveli & Daman & Diu' },
  { id: 32, name: 'Delhi' },
  { id: 33, name: 'Jammu & Kashmir' },
  { id: 34, name: 'Ladakh' },
  { id: 35, name: 'Lakshadweep' },
  { id: 36, name: 'Puducherry' }
];


// ========================================================
// CULTURAL / HERITAGE SITES — 8 SITES PER STATE/UT
// IDs are GLOBAL and sequential (1..288) as in your sample style
// ========================================================
export const culturalSites = {
  'Andhra Pradesh': [
    { id: 1, name: 'Tirumala Venkateswara Temple', city: 'Tirupati', duration: 2, description: 'Major Vaishnavite pilgrimage', avgCostPerDay: 1500 },
    { id: 2, name: 'Undavalli Caves', city: 'Vijayawada', duration: 1, description: 'Rock-cut cave temple', avgCostPerDay: 900 },
    { id: 3, name: 'Belum Caves', city: 'Kurnool', duration: 1, description: 'Extensive limestone caves', avgCostPerDay: 1100 },
    { id: 4, name: 'Lepakshi Temple', city: 'Anantapur', duration: 1, description: 'Vijayanagara sculptures & hanging pillar', avgCostPerDay: 1000 },
    { id: 5, name: 'Borra Caves', city: 'Visakhapatnam', duration: 1, description: 'Limestone cave system in Eastern Ghats', avgCostPerDay: 1200 },
    { id: 6, name: 'Gandikota Fort', city: 'Kadapa', duration: 1, description: 'Cliff-top fort with gorge views', avgCostPerDay: 1200 },
    { id: 7, name: 'Amaravati Stupa', city: 'Amaravati', duration: 1, description: 'Buddhist relic site & museum', avgCostPerDay: 900 },
    { id: 8, name: 'Srisailam Mallikarjuna Temple', city: 'Srisailam', duration: 2, description: 'Jyotirlinga & Shaktipeeth', avgCostPerDay: 1400 }
  ],

  'Arunachal Pradesh': [
    { id: 9, name: 'Tawang Monastery', city: 'Tawang', duration: 2, description: 'Largest monastery in NE India', avgCostPerDay: 1700 },
    { id: 10, name: 'Ziro Valley', city: 'Ziro', duration: 2, description: 'Apatani culture & music festival', avgCostPerDay: 1500 },
    { id: 11, name: 'Bomdila Monastery', city: 'Bomdila', duration: 1, description: 'Scenic Buddhist monastery', avgCostPerDay: 1300 },
    { id: 12, name: 'Ita Fort', city: 'Itanagar', duration: 1, description: 'Historical brick fort ruins', avgCostPerDay: 1000 },
    { id: 13, name: 'Bhismaknagar Ruins', city: 'Roing', duration: 1, description: 'Ancient fort complex', avgCostPerDay: 1200 },
    { id: 14, name: 'Mechuka Cultural Village', city: 'Mechuka', duration: 1, description: 'Tribal culture & festivals', avgCostPerDay: 1500 },
    { id: 15, name: 'Gelling Village', city: 'Upper Siang', duration: 1, description: 'Traditional riverside village', avgCostPerDay: 1400 },
    { id: 16, name: 'Namsai Golden Pagoda', city: 'Namsai', duration: 1, description: 'Thai-style pagoda and monastery', avgCostPerDay: 1200 }
  ],

  'Assam': [
    { id: 17, name: 'Kamakhya Temple', city: 'Guwahati', duration: 1, description: 'Important Shaktipeeth', avgCostPerDay: 1100 },
    { id: 18, name: 'Kaziranga National Park', city: 'Kohora', duration: 2, description: 'UNESCO site - one-horned rhino', avgCostPerDay: 1600 },
    { id: 19, name: 'Majuli Island', city: 'Majuli', duration: 2, description: 'River island with satras', avgCostPerDay: 1400 },
    { id: 20, name: 'Sivasagar Ahom Monuments', city: 'Sivasagar', duration: 1, description: 'Ahom palaces & tanks', avgCostPerDay: 1000 },
    { id: 21, name: 'Manas National Park', city: 'Barpeta', duration: 2, description: 'Biosphere reserve with tribal culture', avgCostPerDay: 1600 },
    { id: 22, name: 'Rang Ghar', city: 'Sivasagar', duration: 1, description: 'Ancient amphitheatre', avgCostPerDay: 900 },
    { id: 23, name: 'Hajo Historic Sites', city: 'Hajo', duration: 1, description: 'Confluence of Hindu-Muslim-Buddhist shrines', avgCostPerDay: 900 },
    { id: 24, name: 'Umananda Temple', city: 'Guwahati', duration: 1, description: 'Small river-island temple', avgCostPerDay: 800 }
  ],

  'Bihar': [
    { id: 25, name: 'Mahabodhi Temple', city: 'Bodh Gaya', duration: 2, description: 'UNESCO Buddhist pilgrimage site', avgCostPerDay: 1500 },
    { id: 26, name: 'Nalanda Ruins', city: 'Nalanda', duration: 1, description: 'Ancient university complex', avgCostPerDay: 1200 },
    { id: 27, name: 'Vishnupad Temple', city: 'Gaya', duration: 1, description: 'Historic riverside temple', avgCostPerDay: 900 },
    { id: 28, name: 'Rajgir', city: 'Rajgir', duration: 1, description: 'Buddhist & Jain heritage site', avgCostPerDay: 1100 },
    { id: 29, name: 'Kesaria Stupa', city: 'Kesaria', duration: 1, description: 'Large ancient stupa', avgCostPerDay: 1000 },
    { id: 30, name: 'Sher Shah Suri Tomb', city: 'Sasaram', duration: 1, description: 'Impressive Indo-Islamic tomb', avgCostPerDay: 900 },
    { id: 31, name: 'Barabar Caves', city: 'Jehanabad', duration: 1, description: 'Ancient rock-cut caves', avgCostPerDay: 1000 },
    { id: 32, name: 'Patna Museum', city: 'Patna', duration: 1, description: 'Regional art & antiquities', avgCostPerDay: 800 }
  ],

  'Chhattisgarh': [
    { id: 33, name: 'Bhoramdeo Temple', city: 'Kawardha', duration: 1, description: "Khajuraho-of-Chhattisgarh", avgCostPerDay: 900 },
    { id: 34, name: 'Chitrakote Falls', city: 'Jagdalpur', duration: 1, description: 'Scenic waterfall - "Niagara of India"', avgCostPerDay: 1200 },
    { id: 35, name: 'Kanger Valley & Kutumsar Caves', city: 'Jagdalpur', duration: 2, description: 'Caves & tribal forests', avgCostPerDay: 1300 },
    { id: 36, name: 'Sirpur Archaeological Site', city: 'Mahasamund', duration: 1, description: 'Ancient temple ruins', avgCostPerDay: 1000 },
    { id: 37, name: 'Danteshwari Temple', city: 'Dantewada', duration: 1, description: 'Major Shaktipeeth', avgCostPerDay: 900 },
    { id: 38, name: 'Malhar Archaeological Site', city: 'Bilaspur', duration: 1, description: 'Ancient temple ruins', avgCostPerDay: 1000 },
    { id: 39, name: 'Rajim Temples', city: 'Rajim', duration: 1, description: 'Pilgrimage confluence area', avgCostPerDay: 900 },
    { id: 40, name: 'Barnawapara Wildlife & Tribal Sites', city: 'Mahasamund', duration: 1, description: 'Forest & tribal cultural experience', avgCostPerDay: 1100 }
  ],

  'Goa': [
    { id: 41, name: 'Basilica of Bom Jesus', city: 'Old Goa', duration: 1, description: 'UNESCO Baroque church', avgCostPerDay: 1200 },
    { id: 42, name: 'Se Cathedral', city: 'Old Goa', duration: 1, description: 'Large Portuguese cathedral', avgCostPerDay: 1100 },
    { id: 43, name: 'Aguada Fort', city: 'Candolim', duration: 1, description: '17th-century coastal fort', avgCostPerDay: 1000 },
    { id: 44, name: 'Chapora Fort', city: 'Bardez', duration: 1, description: 'Scenic viewpoint over beaches', avgCostPerDay: 900 },
    { id: 45, name: 'Fontainhas (Latin Quarter)', city: 'Panjim', duration: 1, description: 'Portuguese heritage neighbourhood', avgCostPerDay: 1100 },
    { id: 46, name: 'Reis Magos Fort', city: 'Reis Magos', duration: 1, description: 'Restored Portuguese fort', avgCostPerDay: 1000 },
    { id: 47, name: 'Tambdi Surla Temple', city: 'Ponda', duration: 1, description: '11th-century Kadamba temple', avgCostPerDay: 1000 },
    { id: 48, name: 'Arvalem Caves & Waterfall', city: 'Bicholim', duration: 1, description: 'Cave complex and falls', avgCostPerDay: 900 }
  ],

  'Gujarat': [
    { id: 49, name: 'Rani ki Vav', city: 'Patan', duration: 1, description: 'UNESCO stepwell', avgCostPerDay: 1200 },
    { id: 50, name: 'Somnath Temple', city: 'Somnath', duration: 1, description: 'Jyotirlinga & coastal shrine', avgCostPerDay: 1100 },
    { id: 51, name: 'Dwarka & Dwarkadhish Temple', city: 'Dwarka', duration: 1, description: 'Ancient pilgrimage city', avgCostPerDay: 1200 },
    { id: 52, name: 'Sun Temple, Modhera', city: 'Modhera', duration: 1, description: '12th-century sun temple', avgCostPerDay: 1000 },
    { id: 53, name: 'Champaner-Pavagadh', city: 'Pavagadh', duration: 1, description: 'UNESCO fortified town', avgCostPerDay: 1200 },
    { id: 54, name: 'Dholavira (Harappan site)', city: 'Kutch', duration: 2, description: 'Indus Valley archaeological site', avgCostPerDay: 1400 },
    { id: 55, name: 'Sabarmati Ashram', city: 'Ahmedabad', duration: 1, description: "Gandhi's residence & museum", avgCostPerDay: 900 },
    { id: 56, name: 'Gir National Park & Junagadh Sites', city: 'Junagadh', duration: 2, description: 'Asiatic lions & historical sites', avgCostPerDay: 1500 }
  ],

  'Haryana': [
    { id: 57, name: 'Kurukshetra (Brahma Sarovar & Jyotisar)', city: 'Kurukshetra', duration: 1, description: 'Mahabharata-era pilgrimage area', avgCostPerDay: 900 },
    { id: 58, name: 'Panipat Battlefields & Museum', city: 'Panipat', duration: 1, description: 'Historic battlefields', avgCostPerDay: 900 },
    { id: 59, name: 'Pinjore Gardens', city: 'Pinjore', duration: 1, description: 'Mughal-style terraced gardens', avgCostPerDay: 1000 },
    { id: 60, name: 'Firoz Shah Palace Remains', city: 'Hisar', duration: 1, description: 'Archaeological ruins', avgCostPerDay: 900 },
    { id: 61, name: 'Sheikh Chilli Tomb', city: 'Thanesar', duration: 1, description: 'Mughal-era tomb complex', avgCostPerDay: 800 },
    { id: 62, name: 'Nahar Singh Palace', city: 'Ballabgarh', duration: 1, description: 'Heritage palace', avgCostPerDay: 900 },
    { id: 63, name: 'Sultanpur Bird Sanctuary (heritage surroundings)', city: 'Gurugram', duration: 1, description: 'Wetland & cultural site', avgCostPerDay: 800 },
    { id: 64, name: 'Kurukshetra Archaeological Museum', city: 'Kurukshetra', duration: 1, description: 'Regional artefacts & displays', avgCostPerDay: 800 }
  ],

  'Himachal Pradesh': [
    { id: 65, name: 'Hidimba Devi Temple', city: 'Manali', duration: 1, description: 'Traditional wooden temple', avgCostPerDay: 1200 },
    { id: 66, name: 'Kangra Fort', city: 'Kangra', duration: 1, description: 'Historic hill fort & museum', avgCostPerDay: 1000 },
    { id: 67, name: 'Shimla Ridge & Christ Church', city: 'Shimla', duration: 1, description: 'Colonial-era landmarks', avgCostPerDay: 1200 },
    { id: 68, name: 'Tabo Monastery', city: 'Tabo (Spiti)', duration: 2, description: 'Ancient Himalayan monastery', avgCostPerDay: 1500 },
    { id: 69, name: 'Key Monastery', city: 'Spiti', duration: 2, description: 'High-altitude Tibetan monastery', avgCostPerDay: 1500 },
    { id: 70, name: 'Chail Palace', city: 'Chail', duration: 1, description: 'Former royal palace', avgCostPerDay: 1100 },
    { id: 71, name: 'Naggar Castle', city: 'Kullu', duration: 1, description: 'Heritage castle & art centre', avgCostPerDay: 1100 },
    { id: 72, name: 'Jwalamukhi Temple', city: 'Kangra', duration: 1, description: 'Temple of the flaming goddess', avgCostPerDay: 900 }
  ],

  'Jharkhand': [
    { id: 73, name: 'Baidyanath (Deoghar) Temple', city: 'Deoghar', duration: 1, description: 'Major Jyotirlinga pilgrimage', avgCostPerDay: 1000 },
    { id: 74, name: 'Jagannath Temple (Ranchi)', city: 'Ranchi', duration: 1, description: 'Regional pilgrimage site', avgCostPerDay: 900 },
    { id: 75, name: 'Netarhat Plateau', city: 'Latehar', duration: 1, description: 'Scenic plateau with colonial relics', avgCostPerDay: 1100 },
    { id: 76, name: 'Betla Fort (Palamu)', city: 'Palamu', duration: 1, description: 'Fort & tribal heritage', avgCostPerDay: 1000 },
    { id: 77, name: 'Parasnath Hill', city: 'Giridih', duration: 1, description: 'Jain pilgrimage hill', avgCostPerDay: 1200 },
    { id: 78, name: 'Jonha & Hundru Falls', city: 'Ranchi', duration: 1, description: 'Waterfalls & local culture', avgCostPerDay: 900 },
    { id: 79, name: 'Malhar Archaeological Site', city: 'Bilaspur', duration: 1, description: 'Ancient temple ruins', avgCostPerDay: 1000 },
    { id: 80, name: 'Maithon Dam & Temple Area', city: 'Dhanbad', duration: 1, description: 'Dam with cultural spots nearby', avgCostPerDay: 900 }
  ],

  'Karnataka': [
    { id: 81, name: 'Hampi (Group of Monuments)', city: 'Hampi', duration: 2, description: 'UNESCO Vijayanagara ruins', avgCostPerDay: 1400 },
    { id: 82, name: 'Mysore Palace', city: 'Mysore', duration: 1, description: 'Royal palace & durbar hall', avgCostPerDay: 1200 },
    { id: 83, name: 'Belur Chennakeshava Temple', city: 'Belur', duration: 1, description: 'Hoysala architecture', avgCostPerDay: 1100 },
    { id: 84, name: 'Halebidu Temples', city: 'Halebidu', duration: 1, description: 'Hoysala twin temples', avgCostPerDay: 1100 },
    { id: 85, name: 'Gol Gumbaz', city: 'Vijayapura', duration: 1, description: 'Monumental mausoleum', avgCostPerDay: 1000 },
    { id: 86, name: 'Badami Cave Temples', city: 'Badami', duration: 1, description: 'Ancient rock-cut temples', avgCostPerDay: 1000 },
    { id: 87, name: 'Shravanabelagola', city: 'Hassan', duration: 1, description: 'Gomateshwara monolith & Jain heritage', avgCostPerDay: 1100 },
    { id: 88, name: 'Vijayanagara Archaeological Museum', city: 'Hampi', duration: 1, description: 'Artifacts from Vijayanagara', avgCostPerDay: 900 }
  ],

  'Kerala': [
    { id: 89, name: 'Padmanabhaswamy Temple', city: 'Thiruvananthapuram', duration: 1, description: 'Historic Vaishnavite temple', avgCostPerDay: 1300 },
    { id: 90, name: 'Mattancherry Palace', city: 'Kochi', duration: 1, description: 'Portuguese-Dutch palace', avgCostPerDay: 1100 },
    { id: 91, name: 'Fort Kochi & Chinese Fishing Nets', city: 'Kochi', duration: 1, description: 'Colonial-era coastal zone', avgCostPerDay: 1000 },
    { id: 92, name: 'Kumarakom Backwater Heritage', city: 'Kumarakom', duration: 2, description: 'Traditional villages & backwaters', avgCostPerDay: 1400 },
    { id: 93, name: 'Bekal Fort', city: 'Bekal', duration: 1, description: 'Well-preserved coastal fort', avgCostPerDay: 1000 },
    { id: 94, name: 'Thrissur Pooram Grounds & Temple', city: 'Thrissur', duration: 1, description: 'Major temple festival & cultural events', avgCostPerDay: 1100 },
    { id: 95, name: 'Hill Palace Museum', city: 'Tripunithura', duration: 1, description: 'Royal family museum', avgCostPerDay: 900 },
    { id: 96, name: 'Athirapally Falls & Vazhachal', city: 'Thrissur', duration: 1, description: 'Waterfalls with tribal culture', avgCostPerDay: 1200 }
  ],

  'Madhya Pradesh': [
    { id: 97, name: 'Khajuraho Temples', city: 'Khajuraho', duration: 2, description: 'UNESCO erotic temple group', avgCostPerDay: 1400 },
    { id: 98, name: 'Sanchi Stupa', city: 'Sanchi', duration: 1, description: 'Ancient Buddhist stupa (UNESCO)', avgCostPerDay: 1200 },
    { id: 99, name: 'Bhimbetka Rock Shelters', city: 'Raisen', duration: 1, description: 'Prehistoric cave paintings (UNESCO)', avgCostPerDay: 1200 },
    { id: 100, name: 'Gwalior Fort', city: 'Gwalior', duration: 1, description: 'Hill fort & palaces', avgCostPerDay: 1100 },
    { id: 101, name: 'Orchha Fort Complex', city: 'Orchha', duration: 1, description: 'Raja-era palaces & cenotaphs', avgCostPerDay: 1100 },
    { id: 102, name: 'Ujjain Mahakaleshwar Temple', city: 'Ujjain', duration: 1, description: 'Major Shiva pilgrimage site', avgCostPerDay: 1000 },
    { id: 103, name: 'Mandu (Mandavgad) Ruins', city: 'Mandu', duration: 1, description: 'Malwa-era ruins & monuments', avgCostPerDay: 1100 },
    { id: 104, name: 'Panna & Ken Gharial Sanctuary (heritage)', city: 'Panna', duration: 2, description: 'Wildlife & tribal culture', avgCostPerDay: 1300 }
  ],

  'Maharashtra': [
    { id: 105, name: 'Ajanta Caves', city: 'Aurangabad', duration: 2, description: 'Buddhist cave paintings (UNESCO)', avgCostPerDay: 1500 },
    { id: 106, name: 'Ellora Caves', city: 'Aurangabad', duration: 2, description: 'Rock-cut temples & monasteries', avgCostPerDay: 1500 },
    { id: 107, name: 'Gateway of India', city: 'Mumbai', duration: 1, description: 'Iconic waterfront monument', avgCostPerDay: 1200 },
    { id: 108, name: 'Shaniwar Wada', city: 'Pune', duration: 1, description: 'Peshwa-era fortification', avgCostPerDay: 1000 },
    { id: 109, name: 'Aga Khan Palace', city: 'Pune', duration: 1, description: 'Freedom movement memorial', avgCostPerDay: 1000 },
    { id: 110, name: 'Raigad Fort', city: 'Raigad', duration: 2, description: "Shivaji's capital fort", avgCostPerDay: 1300 },
    { id: 111, name: 'Elephanta Caves', city: 'Mumbai (island)', duration: 1, description: 'Rock-cut cave temples', avgCostPerDay: 1300 },
    { id: 112, name: 'Kolhapur Mahalakshmi Temple', city: 'Kolhapur', duration: 1, description: 'Major Devi temple & heritage', avgCostPerDay: 1100 }
  ],

  'Manipur': [
    { id: 113, name: 'Kangla Fort', city: 'Imphal', duration: 1, description: 'Royal fort & cultural centre', avgCostPerDay: 1000 },
    { id: 114, name: 'Loktak Lake & Keibul Lamjao', city: 'Moirang', duration: 2, description: 'Floating islands & tribal life', avgCostPerDay: 1400 },
    { id: 115, name: 'Imphal War Cemetery', city: 'Imphal', duration: 1, description: 'WWII memorial', avgCostPerDay: 1200 },
    { id: 116, name: 'Shree Govindajee Temple', city: 'Imphal', duration: 1, description: 'Important Vaishnavite temple', avgCostPerDay: 900 },
    { id: 117, name: 'Andro Heritage Village', city: 'Imphal East', duration: 1, description: 'Living archaeological village', avgCostPerDay: 1100 },
    { id: 118, name: 'Khongjom War Memorial', city: 'Thoubal', duration: 1, description: 'Regional history & memorial', avgCostPerDay: 900 },
    { id: 119, name: 'Tharon Cave (local heritage)', city: 'Churachandpur', duration: 1, description: 'Traditional sites & folklore', avgCostPerDay: 1000 },
    { id: 120, name: 'Manipur State Museum', city: 'Imphal', duration: 1, description: 'Artifacts & tribal displays', avgCostPerDay: 800 }
  ],

  'Meghalaya': [
    { id: 121, name: 'Living Root Bridges', city: 'Cherrapunji', duration: 1, description: 'Bio-engineered living bridges', avgCostPerDay: 1300 },
    { id: 122, name: 'Mawphlang Sacred Grove', city: 'Mawphlang', duration: 1, description: 'Ancient preserved forest with rituals', avgCostPerDay: 1200 },
    { id: 123, name: 'Nartiang Monoliths', city: 'Jaintia Hills', duration: 1, description: 'Collection of monoliths & heritage', avgCostPerDay: 1200 },
    { id: 124, name: 'Shillong Cathedral & Colonial Sites', city: 'Shillong', duration: 1, description: 'Colonial-era architecture', avgCostPerDay: 1100 },
    { id: 125, name: 'Mawsmai Caves', city: 'Cherrapunji', duration: 1, description: 'Limestone cave system', avgCostPerDay: 1200 },
    { id: 126, name: 'Umiam Lake Cultural Spots', city: 'Umiam', duration: 1, description: 'Scenic lake with local culture', avgCostPerDay: 1100 },
    { id: 127, name: 'Double Decker Living Root Bridge', city: 'Umshiang', duration: 1, description: 'Rare double-layer root bridge', avgCostPerDay: 1400 },
    { id: 128, name: 'Kyllang Rock & Heritage', city: 'Mawphlang area', duration: 1, description: 'Sacred rock formations & folklore', avgCostPerDay: 1100 }
  ],

  'Mizoram': [
    { id: 129, name: 'Reiek Heritage Village', city: 'Aizawl', duration: 1, description: 'Traditional Mizo huts & dances', avgCostPerDay: 1200 },
    { id: 130, name: 'Tam Dil Lake', city: 'Aizawl', duration: 1, description: 'Cultural lake with folklore', avgCostPerDay: 1300 },
    { id: 131, name: 'Hmuifang Cultural Park', city: 'Aizawl', duration: 1, description: 'Hilltop cultural activities', avgCostPerDay: 1200 },
    { id: 132, name: 'Vantawng Falls area', city: 'Kolasib', duration: 1, description: 'Tall waterfall with tribal lore', avgCostPerDay: 1200 },
    { id: 133, name: 'Mizo Heritage Village (Aizawl)', city: 'Aizawl', duration: 1, description: 'Living museum of Mizo life', avgCostPerDay: 1100 },
    { id: 134, name: 'Dampa Tiger Reserve (cultural fringes)', city: 'Dampa', duration: 1, description: 'Wildlife & tribal experiences', avgCostPerDay: 1400 },
    { id: 135, name: 'Solomon Temple Ruins (local sites)', city: 'Lunglei region', duration: 1, description: 'Local historic spots', avgCostPerDay: 1100 },
    { id: 136, name: 'Lungsen Hill & War Memorials', city: 'Aizawl', duration: 1, description: 'Historical viewpoints & memorials', avgCostPerDay: 1100 }
  ],

  'Nagaland': [
    { id: 137, name: 'Kohima War Cemetery', city: 'Kohima', duration: 1, description: 'WWII memorial & museum', avgCostPerDay: 1200 },
    { id: 138, name: 'Dzukou Valley', city: 'Kohima/Phek', duration: 2, description: 'Scenic valley with tribal villages', avgCostPerDay: 1400 },
    { id: 139, name: 'Khonoma Heritage Village', city: 'Khonoma', duration: 1, description: 'First green village of India', avgCostPerDay: 1200 },
    { id: 140, name: 'Nagaland State Museum', city: 'Kohima', duration: 1, description: 'Tribal artifacts & shawls', avgCostPerDay: 900 },
    { id: 141, name: 'Tuophema Cultural Sites (Hornbill)', city: 'Kohima', duration: 1, description: 'Festival & living culture', avgCostPerDay: 1300 },
    { id: 142, name: 'Mokokchung Ao Heritage', city: 'Mokokchung', duration: 1, description: 'Ao Naga cultural centers', avgCostPerDay: 1200 },
    { id: 143, name: 'Phek Traditional Trails', city: 'Phek', duration: 1, description: 'Tribal hillscapes & craft', avgCostPerDay: 1200 },
    { id: 144, name: 'Wokha Traditional Villages', city: 'Wokha', duration: 1, description: 'Cultural villages & handicrafts', avgCostPerDay: 1100 }
  ],

  'Odisha': [
    { id: 145, name: 'Konark Sun Temple', city: 'Konark', duration: 1, description: 'UNESCO chariot-shaped sun temple', avgCostPerDay: 1200 },
    { id: 146, name: 'Jagannath Temple', city: 'Puri', duration: 1, description: 'Major pilgrimage & Rath Yatra', avgCostPerDay: 1200 },
    { id: 147, name: 'Lingaraj Temple', city: 'Bhubaneswar', duration: 1, description: 'Ancient Kalinga temple', avgCostPerDay: 1000 },
    { id: 148, name: 'Chilika Lake & Birds', city: 'Puri/Chilika', duration: 2, description: 'Brackish lagoon with migratory birds', avgCostPerDay: 1400 },
    { id: 149, name: 'Udayagiri & Khandagiri Caves', city: 'Bhubaneswar', duration: 1, description: 'Jain rock-cut shelters', avgCostPerDay: 1000 },
    { id: 150, name: 'Rajarani Temple', city: 'Bhubaneswar', duration: 1, description: 'Red sandstone temple with carvings', avgCostPerDay: 900 },
    { id: 151, name: 'Hirakud Dam & Heritage', city: 'Sambalpur', duration: 1, description: 'Major engineering landmark', avgCostPerDay: 1000 },
    { id: 152, name: 'Similipal Cultural & Wildlife', city: 'Mayurbhanj', duration: 2, description: 'Forest, tribal culture & waterfalls', avgCostPerDay: 1400 }
  ],

  'Punjab': [
    { id: 153, name: 'Golden Temple (Harmandir Sahib)', city: 'Amritsar', duration: 1, description: "Sikhism's holiest gurdwara", avgCostPerDay: 1200 },
    { id: 154, name: 'Jallianwala Bagh', city: 'Amritsar', duration: 1, description: 'Historic massacre memorial', avgCostPerDay: 900 },
    { id: 155, name: 'Wagah Border Ceremony', city: 'Attari', duration: 1, description: 'Daily ceremonial parade', avgCostPerDay: 800 },
    { id: 156, name: 'Qila Mubarak (Patiala)', city: 'Patiala', duration: 1, description: 'Royal fort & museums', avgCostPerDay: 900 },
    { id: 157, name: 'Sheesh Mahal (Patiala)', city: 'Patiala', duration: 1, description: 'Palace with mirror work', avgCostPerDay: 900 },
    { id: 158, name: 'Gobindgarh Fort', city: 'Amritsar', duration: 1, description: 'Refurbished historic fort', avgCostPerDay: 1000 },
    { id: 159, name: 'Khalsa College Heritage', city: 'Amritsar', duration: 1, description: 'Colonial-era campus architecture', avgCostPerDay: 800 },
    { id: 160, name: 'Anandpur Sahib', city: 'Anandpur Sahib', duration: 1, description: 'Important Sikh pilgrimage town', avgCostPerDay: 1000 }
  ],

  'Rajasthan': [
    { id: 161, name: 'Amber Fort', city: 'Jaipur', duration: 2, description: 'Hill fort with palaces', avgCostPerDay: 1300 },
    { id: 162, name: 'City Palace (Udaipur)', city: 'Udaipur', duration: 1, description: 'Lavish royal palace complex', avgCostPerDay: 1300 },
    { id: 163, name: 'Hawa Mahal', city: 'Jaipur', duration: 1, description: 'Palace of Winds', avgCostPerDay: 1000 },
    { id: 164, name: 'Mehrangarh Fort', city: 'Jodhpur', duration: 2, description: 'Massive hill fort & museum', avgCostPerDay: 1300 },
    { id: 165, name: 'Jaisalmer Fort', city: 'Jaisalmer', duration: 2, description: 'Living fort in the Thar', avgCostPerDay: 1400 },
    { id: 166, name: 'Kumbhalgarh Fort', city: 'Rajsamand', duration: 1, description: 'Fort with long defensive wall', avgCostPerDay: 1200 },
    { id: 167, name: 'Chittorgarh Fort', city: 'Chittorgarh', duration: 1, description: 'Historic Rajput stronghold', avgCostPerDay: 1200 },
    { id: 168, name: 'Jantar Mantar (Jaipur)', city: 'Jaipur', duration: 1, description: 'Astronomical observatory (UNESCO)', avgCostPerDay: 1000 }
  ],

  'Sikkim': [
    { id: 169, name: 'Rumtek Monastery', city: 'Gangtok', duration: 1, description: 'Important Kagyu monastery', avgCostPerDay: 1300 },
    { id: 170, name: 'Pemayangtse Monastery', city: 'Pelling', duration: 1, description: 'Ancient Buddhist monastery', avgCostPerDay: 1200 },
    { id: 171, name: 'Tsomgo Lake (Changu)', city: 'Gangtok', duration: 1, description: 'Glacial lake with rituals', avgCostPerDay: 1400 },
    { id: 172, name: 'Nathula Pass Heritage', city: 'Nathula', duration: 1, description: 'Historic trade route to Tibet', avgCostPerDay: 1500 },
    { id: 173, name: 'Enchey Monastery', city: 'Gangtok', duration: 1, description: 'Local religious centre', avgCostPerDay: 1100 },
    { id: 174, name: 'Rabdentse Ruins', city: 'Pelling', duration: 1, description: 'Ancient capital ruins', avgCostPerDay: 1100 },
    { id: 175, name: 'Yuksom Cultural Sites', city: 'Yuksom', duration: 1, description: 'Gateway to Kanchenjunga treks', avgCostPerDay: 1200 },
    { id: 176, name: 'Khecheopalri Lake', city: 'Pelling region', duration: 1, description: 'Sacred wish-fulfilling lake', avgCostPerDay: 1200 }
  ],

  'Tamil Nadu': [
    { id: 177, name: 'Meenakshi Amman Temple', city: 'Madurai', duration: 2, description: 'Vibrant Dravidian temple complex', avgCostPerDay: 1200 },
    { id: 178, name: 'Brihadeeswarar Temple', city: 'Thanjavur', duration: 1, description: 'UNESCO Chola temple', avgCostPerDay: 1200 },
    { id: 179, name: 'Mahabalipuram Shore Temple', city: 'Mahabalipuram', duration: 1, description: 'Pallava rock-cut shore temples', avgCostPerDay: 1100 },
    { id: 180, name: 'Ramanathaswamy Temple', city: 'Rameswaram', duration: 1, description: 'Important Shaiva pilgrimage', avgCostPerDay: 1100 },
    { id: 181, name: 'Gangaikonda Cholapuram', city: 'Ariyalur', duration: 1, description: 'Chola dynasty temple site', avgCostPerDay: 1000 },
    { id: 182, name: 'Chettinad Heritage Mansions', city: 'Chettinad', duration: 1, description: 'Merchant mansions & cuisine', avgCostPerDay: 1100 },
    { id: 183, name: 'Thanjavur Palace & Museum', city: 'Thanjavur', duration: 1, description: 'Royal art & inscriptions', avgCostPerDay: 1000 },
    { id: 184, name: 'Kanyakumari Vivekananda Rock Memorial', city: 'Kanyakumari', duration: 1, description: 'Coastal memorial & temples', avgCostPerDay: 1000 }
  ],

  'Telangana': [
    { id: 185, name: 'Charminar', city: 'Hyderabad', duration: 1, description: 'Iconic 16th-century monument', avgCostPerDay: 1100 },
    { id: 186, name: 'Golconda Fort', city: 'Hyderabad', duration: 1, description: 'Ancient fort with acoustics', avgCostPerDay: 1200 },
    { id: 187, name: 'Salar Jung Museum', city: 'Hyderabad', duration: 1, description: 'Extensive art & antiquities', avgCostPerDay: 1000 },
    { id: 188, name: 'Ramappa Temple', city: 'Palampet', duration: 1, description: 'UNESCO Kakatiya-era temple', avgCostPerDay: 1200 },
    { id: 189, name: 'Qutb Shahi Tombs', city: 'Hyderabad', duration: 1, description: 'Dynastic mausoleums', avgCostPerDay: 1000 },
    { id: 190, name: 'Mecca Masjid', city: 'Hyderabad', duration: 1, description: 'One of the largest mosques', avgCostPerDay: 900 },
    { id: 191, name: 'Paigah Tombs', city: 'Hyderabad', duration: 1, description: 'Ornate 18th-19th century tombs', avgCostPerDay: 900 },
    { id: 192, name: 'Warangal Fort Ruins', city: 'Warangal', duration: 1, description: 'Kakatiya fort architecture', avgCostPerDay: 1100 }
  ],

  'Tripura': [
    { id: 193, name: 'Ujjayanta Palace', city: 'Agartala', duration: 1, description: 'Royal palace turned museum', avgCostPerDay: 1000 },
    { id: 194, name: 'Neermahal Palace', city: 'Melaghar', duration: 1, description: 'Water palace in a lake', avgCostPerDay: 1100 },
    { id: 195, name: 'Unakoti Hills', city: 'Unakoti', duration: 1, description: 'Rock-cut reliefs & pilgrimage', avgCostPerDay: 1200 },
    { id: 196, name: 'Pilak Archaeological Park', city: 'Pilak', duration: 1, description: 'Ancient sculptures & relics', avgCostPerDay: 1000 },
    { id: 197, name: 'Jampui Hills Cultural Trails', city: 'Jampui', duration: 1, description: 'Orchards & tribal villages', avgCostPerDay: 1200 },
    { id: 198, name: 'Chabimura Rock Carvings', city: 'Amarpur', duration: 1, description: 'Riverside rock reliefs', avgCostPerDay: 1100 },
    { id: 199, name: 'Agartala Palace Museum', city: 'Agartala', duration: 1, description: 'State royal heritage', avgCostPerDay: 900 },
    { id: 200, name: 'Sepahijala Wildlife & Tribal Museum', city: 'Agartala', duration: 1, description: 'Flora, fauna & tribal displays', avgCostPerDay: 1000 }
  ],

  'Uttar Pradesh': [
    { id: 201, name: 'Taj Mahal', city: 'Agra', duration: 2, description: 'World Heritage monument', avgCostPerDay: 2500 },
    { id: 202, name: 'Agra Fort', city: 'Agra', duration: 1, description: 'Mughal fortress & palace', avgCostPerDay: 1200 },
    { id: 203, name: 'Fatehpur Sikri', city: 'Fatehpur Sikri', duration: 1, description: 'Abandoned Mughal city (UNESCO)', avgCostPerDay: 1100 },
    { id: 204, name: 'Varanasi Ghats & Kashi Vishwanath', city: 'Varanasi', duration: 2, description: 'Ancient spiritual city on the Ganga', avgCostPerDay: 1300 },
    { id: 205, name: 'Sarnath', city: 'Sarnath', duration: 1, description: 'Buddhist site where Buddha preached', avgCostPerDay: 1100 },
    { id: 206, name: 'Jhansi Fort', city: 'Jhansi', duration: 1, description: 'Historic fort of Rani Laxmi Bai', avgCostPerDay: 1000 },
    { id: 207, name: 'Bara & Chota Imambara', city: 'Lucknow', duration: 1, description: 'Awadhi-era monuments & halls', avgCostPerDay: 1000 },
    { id: 208, name: 'Ayodhya (Ram Janmabhoomi area)', city: 'Ayodhya', duration: 1, description: 'Major religious redevelopment area', avgCostPerDay: 1000 }
  ],

  'Uttarakhand': [
    { id: 209, name: 'Haridwar & Har Ki Pauri', city: 'Haridwar', duration: 1, description: 'Major Ganga aarti & pilgrimage', avgCostPerDay: 1100 },
    { id: 210, name: 'Rishikesh (ashrams & ghats)', city: 'Rishikesh', duration: 1, description: 'Yoga capital & spiritual sites', avgCostPerDay: 1100 },
    { id: 211, name: 'Kedarnath Temple', city: 'Kedarnath', duration: 2, description: 'High-altitude Jyotirlinga', avgCostPerDay: 1500 },
    { id: 212, name: 'Badrinath Temple', city: 'Badrinath', duration: 2, description: 'Sacred Char Dham shrine', avgCostPerDay: 1500 },
    { id: 213, name: 'Nainital Lake & Mall Road', city: 'Nainital', duration: 1, description: 'Hill-town colonial charm', avgCostPerDay: 1200 },
    { id: 214, name: 'Jim Corbett National Park (heritage)', city: 'Nainital/ Pauri', duration: 2, description: 'Oldest national park with cultural villages', avgCostPerDay: 1500 },
    { id: 215, name: 'Mussoorie Colonial Sites', city: 'Dehradun/Mussoorie', duration: 1, description: 'The Queen of Hills with heritage buildings', avgCostPerDay: 1200 },
    { id: 216, name: 'Auli (heritage skiing & temples)', city: 'Chamoli', duration: 1, description: 'Ski resort & mountain culture', avgCostPerDay: 1400 }
  ],

  'West Bengal': [
    { id: 217, name: 'Victoria Memorial', city: 'Kolkata', duration: 1, description: 'Colonial-era memorial & museum', avgCostPerDay: 1000 },
    { id: 218, name: 'Dakshineswar Kali Temple', city: 'Kolkata', duration: 1, description: 'Famous riverside temple', avgCostPerDay: 900 },
    { id: 219, name: 'Sundarbans & Mangrove Heritage', city: 'Sundarbans', duration: 2, description: 'Largest mangrove forest & tiger reserve', avgCostPerDay: 1500 },
    { id: 220, name: 'Darjeeling Himalayan Railway (Toy Train)', city: 'Darjeeling', duration: 1, description: 'UNESCO mountain railway', avgCostPerDay: 1400 },
    { id: 221, name: 'Jorasanko Thakur Bari', city: 'Kolkata', duration: 1, description: "Rabindranath Tagore's ancestral home", avgCostPerDay: 900 },
    { id: 222, name: 'Belur Math', city: 'Howrah', duration: 1, description: 'Ramakrishna Mission headquarters', avgCostPerDay: 800 },
    { id: 223, name: 'Hazarduari Palace', city: 'Murshidabad', duration: 1, description: 'Nawabi palace with thousand doors', avgCostPerDay: 900 },
    { id: 224, name: 'Bishnupur Terracotta Temples', city: 'Bishnupur', duration: 1, description: 'Terracotta temple art & craft', avgCostPerDay: 1000 }
  ],

  'Andaman & Nicobar Islands': [
    { id: 225, name: 'Cellular Jail', city: 'Port Blair', duration: 1, description: 'Colonial prison & national memorial', avgCostPerDay: 1600 },
    { id: 226, name: 'Ross Island Ruins', city: 'Port Blair', duration: 1, description: 'Historic colonial-era island ruins', avgCostPerDay: 1500 },
    { id: 227, name: 'Havelock (Swaraj Dweep) Heritage Beaches', city: 'Havelock', duration: 2, description: 'Beaches & local culture', avgCostPerDay: 1800 },
    { id: 228, name: 'Neil Island (Shaheed Dweep)', city: 'Neil Island', duration: 1, description: 'Beaches & coral heritage', avgCostPerDay: 1600 },
    { id: 229, name: 'Barren Island (volcanic landscape)', city: 'Barren Island', duration: 2, description: 'Active volcano & marine heritage', avgCostPerDay: 2000 },
    { id: 230, name: 'Chidiya Tapu', city: 'Port Blair', duration: 1, description: 'Sunset viewpoint & birdlife', avgCostPerDay: 1400 },
    { id: 231, name: 'Baratang Island Limestone Caves', city: 'Baratang', duration: 1, description: 'Mangroves & caves', avgCostPerDay: 1500 },
    { id: 232, name: 'Anthropological Museum', city: 'Port Blair', duration: 1, description: 'Indigenous culture & exhibits', avgCostPerDay: 1200 }
  ],

  'Chandigarh': [
    { id: 233, name: 'Rock Garden', city: 'Chandigarh', duration: 1, description: 'Sculptural garden by Nek Chand', avgCostPerDay: 1000 },
    { id: 234, name: 'Sukhna Lake', city: 'Chandigarh', duration: 1, description: 'Man-made reservoir with promenades', avgCostPerDay: 900 },
    { id: 235, name: 'Capitol Complex (Le Corbusier Heritage)', city: 'Chandigarh', duration: 1, description: 'Modernist architectural complex', avgCostPerDay: 1000 },
    { id: 236, name: 'Government Museum & Art Gallery', city: 'Chandigarh', duration: 1, description: 'Regional art & archaeology', avgCostPerDay: 800 },
    { id: 237, name: 'Rose Garden', city: 'Chandigarh', duration: 1, description: 'Largest rose garden in Asia', avgCostPerDay: 800 },
    { id: 238, name: 'Terraced Garden', city: 'Chandigarh', duration: 1, description: 'Public heritage gardens', avgCostPerDay: 800 },
    { id: 239, name: 'Open Hand Monument', city: 'Chandigarh', duration: 1, description: 'Symbol of the city by Le Corbusier', avgCostPerDay: 800 },
    { id: 240, name: 'Leisure Valley', city: 'Chandigarh', duration: 1, description: 'Linear park & cultural events', avgCostPerDay: 800 }
  ],

  'Dadra & Nagar Haveli & Daman & Diu': [
    { id: 241, name: 'Diu Fort', city: 'Diu', duration: 1, description: 'Portuguese-era coastal fort', avgCostPerDay: 1100 },
    { id: 242, name: 'St. Paul\'s Church (Diu)', city: 'Diu', duration: 1, description: 'Portuguese church ruins', avgCostPerDay: 1000 },
    { id: 243, name: 'Silvassa Tribal & Heritage Village', city: 'Silvassa', duration: 1, description: 'Tribal culture exhibits', avgCostPerDay: 900 },
    { id: 244, name: 'Ghoghla Beach & Lighthouse', city: 'Diu', duration: 1, description: 'Coastal heritage area', avgCostPerDay: 1000 },
    { id: 245, name: 'Dadra Heritage Walks', city: 'Dadra region', duration: 1, description: 'Local historical sites & crafts', avgCostPerDay: 900 },
    { id: 246, name: 'St. Thomas Church (Daman)', city: 'Daman', duration: 1, description: 'Colonial church & forts', avgCostPerDay: 900 },
    { id: 247, name: 'Moti Daman Fort', city: 'Daman', duration: 1, description: 'Historic sea fort', avgCostPerDay: 900 },
    { id: 248, name: 'Philippines Garden & Local Museums', city: 'Silvassa/Daman', duration: 1, description: 'Local culture & history', avgCostPerDay: 900 }
  ],

  'Delhi': [
    { id: 249, name: 'Red Fort', city: 'New Delhi', duration: 1, description: 'Mughal imperial fort & museum', avgCostPerDay: 1200 },
    { id: 250, name: 'Qutub Minar', city: 'Mehrauli', duration: 1, description: 'Historic minaret (UNESCO area)', avgCostPerDay: 1100 },
    { id: 251, name: 'India Gate & Rajpath', city: 'Central Delhi', duration: 1, description: 'National war memorial & parade avenue', avgCostPerDay: 900 },
    { id: 252, name: 'Humayun\'s Tomb', city: 'Nizamuddin', duration: 1, description: 'Precursor to Taj Mahal (UNESCO)', avgCostPerDay: 1000 },
    { id: 253, name: 'Lotus Temple', city: 'Kalkaji', duration: 1, description: 'Baha\'i house of worship & serene gardens', avgCostPerDay: 800 },
    { id: 254, name: 'Jama Masjid', city: 'Old Delhi', duration: 1, description: 'One of India\'s largest mosques', avgCostPerDay: 800 },
    { id: 255, name: 'Humayun\'s Tomb Museum & Gardens', city: 'Nizamuddin', duration: 1, description: 'Garden tomb & heritage displays', avgCostPerDay: 900 },
    { id: 256, name: 'National Museum', city: 'Janpath', duration: 1, description: 'Extensive national collections', avgCostPerDay: 900 }
  ],

  'Jammu & Kashmir': [
    { id: 257, name: 'Dal Lake & Shikara Heritage', city: 'Srinagar', duration: 1, description: 'Iconic lake with houseboats', avgCostPerDay: 1600 },
    { id: 258, name: 'Shankaracharya Temple', city: 'Srinagar', duration: 1, description: 'Hilltop temple with views', avgCostPerDay: 1200 },
    { id: 259, name: 'Mughal Gardens (Shalimar, Nishat)', city: 'Srinagar', duration: 1, description: 'Historic Mughal-era gardens', avgCostPerDay: 1200 },
    { id: 260, name: 'Jamia Masjid & Old City', city: 'Srinagar', duration: 1, description: 'Historic mosque & bazaars', avgCostPerDay: 1000 },
    { id: 261, name: 'Vaishno Devi (Katra)', city: 'Katra', duration: 1, description: 'Major pilgrimage shrine', avgCostPerDay: 1300 },
    { id: 262, name: 'Gurez Valley cultural sites', city: 'Gurez', duration: 2, description: 'Remote valley & local heritage', avgCostPerDay: 1500 },
    { id: 263, name: 'Pahalgam local heritage & temples', city: 'Pahalgam', duration: 1, description: 'Hill town & local culture', avgCostPerDay: 1300 },
    { id: 264, name: 'Srinagar Crafts & Paper Market (heritage)', city: 'Srinagar', duration: 1, description: 'Handicrafts, papier-mâché & shawls', avgCostPerDay: 900 }
  ],

  'Ladakh': [
    { id: 265, name: 'Pangong Tso', city: 'Pangong', duration: 2, description: 'High-altitude lake with striking colors', avgCostPerDay: 2200 },
    { id: 266, name: 'Leh Palace & Shanti Stupa', city: 'Leh', duration: 1, description: 'Royal palace and hilltop stupa', avgCostPerDay: 1800 },
    { id: 267, name: 'Hemis Monastery', city: 'Hemis', duration: 1, description: 'Largest monastery in Ladakh', avgCostPerDay: 1600 },
    { id: 268, name: 'Nubra Valley & Diskit Monastery', city: 'Diskit', duration: 2, description: 'Cold desert, dunes & monasteries', avgCostPerDay: 2000 },
    { id: 269, name: 'Tso Moriri', city: 'Tso Moriri', duration: 2, description: 'Remote high-altitude lake & wildlife', avgCostPerDay: 2200 },
    { id: 270, name: 'Alchi Monastery', city: 'Alchi', duration: 1, description: 'Ancient Buddhist art complex', avgCostPerDay: 1500 },
    { id: 271, name: 'Spituk Monastery & Local Markets', city: 'Leh', duration: 1, description: 'Monastery with cultural bazaars', avgCostPerDay: 1500 },
    { id: 272, name: 'Magnetic Hill & Gurudwara Pathar Sahib', city: 'Leh-Srinagar highway', duration: 1, description: 'Natural phenomenon & Sikh shrine', avgCostPerDay: 1600 }
  ],

  'Lakshadweep': [
    { id: 273, name: 'Bangaram & Agatti Islands', city: 'Agatti', duration: 2, description: 'Coral atolls & marine heritage', avgCostPerDay: 2400 },
    { id: 274, name: 'Minicoy Island cultural sites', city: 'Minicoy', duration: 2, description: 'Distinct island culture & lighthouse', avgCostPerDay: 2200 },
    { id: 275, name: 'Kavaratti Mosque & Aquarium', city: 'Kavaratti', duration: 1, description: 'Island capital cultural spots', avgCostPerDay: 2000 },
    { id: 276, name: 'Kadmat Island reef heritage', city: 'Kadmat', duration: 2, description: 'Snorkeling & marine life', avgCostPerDay: 2200 },
    { id: 277, name: 'Andrott Island village heritage', city: 'Andrott', duration: 1, description: 'Traditional island life & culture', avgCostPerDay: 1800 },
    { id: 278, name: 'Biodiversity & Marine Museum (Kavaratti)', city: 'Kavaratti', duration: 1, description: 'Marine displays & heritage', avgCostPerDay: 1600 },
    { id: 279, name: 'Coral Conservation Sites', city: 'Multiple islands', duration: 1, description: 'Coral reefs & conservation heritage', avgCostPerDay: 2000 },
    { id: 280, name: 'Local Handicraft Villages', city: 'Various', duration: 1, description: 'Island crafts & traditions', avgCostPerDay: 1600 }
  ],

  'Puducherry': [
    { id: 281, name: 'French Quarter (White Town)', city: 'Pondicherry', duration: 1, description: 'Colonial-era French architecture', avgCostPerDay: 1100 },
    { id: 282, name: 'Sri Aurobindo Ashram', city: 'Pondicherry', duration: 1, description: 'Spiritual & cultural centre', avgCostPerDay: 900 },
    { id: 283, name: 'Auroville (Matri Mandir area)', city: 'Auroville', duration: 1, description: 'International township & heritage', avgCostPerDay: 1000 },
    { id: 284, name: 'Puducherry Museum & Promenade', city: 'Pondicherry', duration: 1, description: 'Local history & colonial exhibits', avgCostPerDay: 800 },
    { id: 285, name: 'Arikamedu Archaeological Site', city: 'Pondicherry region', duration: 1, description: 'Ancient Roman trade port ruins', avgCostPerDay: 900 },
    { id: 286, name: 'Serenity Beach & Coastal Heritage', city: 'Pondicherry', duration: 1, description: 'Local fishing & beach culture', avgCostPerDay: 900 },
    { id: 287, name: 'Botanical Garden', city: 'Pondicherry', duration: 1, description: 'Colonial botanical displays', avgCostPerDay: 800 },
    { id: 288, name: 'Old Lighthouse & Harbor Area', city: 'Pondicherry', duration: 1, description: 'Maritime heritage spots', avgCostPerDay: 800 }
  ]
};


// =============================
// MONTHS (same structure as your sample)
// =============================
export const months = [
  { id: 1, name: 'January', avgTemp: '15-25°C', crowd: 'High' },
  { id: 2, name: 'February', avgTemp: '18-28°C', crowd: 'High' },
  { id: 3, name: 'March', avgTemp: '22-32°C', crowd: 'Medium' },
  { id: 4, name: 'April', avgTemp: '26-38°C', crowd: 'Low' },
  { id: 5, name: 'May', avgTemp: '28-42°C', crowd: 'Low' },
  { id: 6, name: 'June', avgTemp: '25-35°C', crowd: 'Low' },
  { id: 7, name: 'July', avgTemp: '24-33°C', crowd: 'Low' },
  { id: 8, name: 'August', avgTemp: '23-32°C', crowd: 'Low' },
  { id: 9, name: 'September', avgTemp: '22-31°C', crowd: 'Medium' },
  { id: 10, name: 'October', avgTemp: '20-30°C', crowd: 'High' },
  { id: 11, name: 'November', avgTemp: '18-28°C', crowd: 'High' },
  { id: 12, name: 'December', avgTemp: '15-25°C', crowd: 'High' }
];


// =============================
// TRANSPORT MODES
// (kept same as your sample)
// =============================
export const transportModes = [
  { id: 1, name: 'Flight', costPerKm: 4, speed: 800, comfort: 'High', time: 2 },
  { id: 2, name: 'Train', costPerKm: 1.5, speed: 60, comfort: 'Medium', time: 4 },
  { id: 3, name: 'Bus', costPerKm: 1, speed: 50, comfort: 'Low', time: 5 },
  { id: 4, name: 'Car Rental', costPerKm: 8, speed: 70, comfort: 'High', time: 5 }
];


// =============================
// DURATION OPTIONS
// =============================
export const durationDays = [
  { id: 1, days: 3 },
  { id: 2, days: 5 },
  { id: 3, days: 7 },
  { id: 4, days: 10 },
  { id: 5, days: 14 },
  { id: 6, days: 21 }
];


// =============================
// ACCOMMODATION TIERS
// =============================
export const accommodation = {
  'Budget': { costPerNight: 1000, description: '3-star hotel' },
  'Mid-range': { costPerNight: 2500, description: '4-star hotel' },
  'Luxury': { costPerNight: 5000, description: '5-star hotel' }
};


// =============================
// AVERAGE DISTANCES (km) — added for ALL 36 entries
// These are *approximate average internal travel distances* per state/UT used for cost estimates
// =============================
export const averageDistances = {
  'Andhra Pradesh': 480,
  'Arunachal Pradesh': 600,
  'Assam': 500,
  'Bihar': 350,
  'Chhattisgarh': 420,
  'Goa': 200,
  'Gujarat': 520,
  'Haryana': 200,
  'Himachal Pradesh': 300,
  'Jharkhand': 350,
  'Karnataka': 500,
  'Kerala': 700,
  'Madhya Pradesh': 450,
  'Maharashtra': 450,
  'Manipur': 500,
  'Meghalaya': 450,
  'Mizoram': 480,
  'Nagaland': 460,
  'Odisha': 400,
  'Punjab': 220,
  'Rajasthan': 600,
  'Sikkim': 300,
  'Tamil Nadu': 600,
  'Telangana': 480,
  'Tripura': 300,
  'Uttar Pradesh': 350,
  'Uttarakhand': 300,
  'West Bengal': 600,
  'Andaman & Nicobar Islands': 150,
  'Chandigarh': 50,
  'Dadra & Nagar Haveli & Daman & Diu': 120,
  'Delhi': 80,
  'Jammu & Kashmir': 500,
  'Ladakh': 800,
  'Lakshadweep': 100,
  'Puducherry': 180
};
