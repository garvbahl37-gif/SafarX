/**
 * Indian destinations, held locally.
 *
 * The stay providers are metered — Booking.com's plan allows 50 calls a month
 * — and spending one of those on every keystroke of "jai…" is indefensible
 * when the answer never changes. Destination lookup is served from here first,
 * which also makes it instant, offline, and India-only by construction. A live
 * provider is only asked when a query matches nothing below.
 *
 * Coordinates are city centres, which is what a hotel search wants.
 */

export const PLACES = [
  // Metros and state capitals
  { name: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.209, alias: ["delhi"] },
  { name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777, alias: ["bombay"] },
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946, alias: ["bangalore"] },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, alias: ["madras"] },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, alias: ["calcutta"] },
  { name: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, alias: ["poona"] },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  { name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376 },
  { name: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245 },
  { name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366, alias: ["trivandrum"] },
  { name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362 },
  { name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296 },
  { name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096 },
  { name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322 },
  { name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },
  { name: "Srinagar", state: "Jammu & Kashmir", lat: 34.0837, lng: 74.7973 },
  { name: "Jammu", state: "Jammu & Kashmir", lat: 32.7266, lng: 74.857 },
  { name: "Panaji", state: "Goa", lat: 15.4909, lng: 73.8278, alias: ["panjim"] },
  { name: "Gandhinagar", state: "Gujarat", lat: 23.2156, lng: 72.6369 },
  { name: "Amaravati", state: "Andhra Pradesh", lat: 16.5062, lng: 80.648 },
  { name: "Itanagar", state: "Arunachal Pradesh", lat: 27.0844, lng: 93.6053 },
  { name: "Imphal", state: "Manipur", lat: 24.817, lng: 93.9368 },
  { name: "Shillong", state: "Meghalaya", lat: 25.5788, lng: 91.8933 },
  { name: "Aizawl", state: "Mizoram", lat: 23.7271, lng: 92.7176 },
  { name: "Kohima", state: "Nagaland", lat: 25.6751, lng: 94.11 },
  { name: "Agartala", state: "Tripura", lat: 23.8315, lng: 91.2868 },
  { name: "Gangtok", state: "Sikkim", lat: 27.3314, lng: 88.6138 },
  { name: "Port Blair", state: "Andaman & Nicobar", lat: 11.6234, lng: 92.7265 },

  // Heritage and pilgrimage
  { name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081 },
  { name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739, alias: ["banaras", "benares", "kashi"] },
  { name: "Amritsar", state: "Punjab", lat: 31.634, lng: 74.8723 },
  { name: "Udaipur", state: "Rajasthan", lat: 24.5854, lng: 73.7125 },
  { name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243 },
  { name: "Jaisalmer", state: "Rajasthan", lat: 26.9157, lng: 70.9083 },
  { name: "Pushkar", state: "Rajasthan", lat: 26.4899, lng: 74.5511 },
  { name: "Bikaner", state: "Rajasthan", lat: 28.0229, lng: 73.3119 },
  { name: "Mount Abu", state: "Rajasthan", lat: 24.5926, lng: 72.7156 },
  { name: "Chittorgarh", state: "Rajasthan", lat: 24.8887, lng: 74.6269 },
  { name: "Ajmer", state: "Rajasthan", lat: 26.4499, lng: 74.6399 },
  { name: "Bundi", state: "Rajasthan", lat: 25.4305, lng: 75.6499 },
  { name: "Hampi", state: "Karnataka", lat: 15.335, lng: 76.46 },
  { name: "Mysuru", state: "Karnataka", lat: 12.2958, lng: 76.6394, alias: ["mysore"] },
  { name: "Badami", state: "Karnataka", lat: 15.918, lng: 75.685 },
  { name: "Khajuraho", state: "Madhya Pradesh", lat: 24.8318, lng: 79.9199 },
  { name: "Orchha", state: "Madhya Pradesh", lat: 25.3518, lng: 78.6417 },
  { name: "Gwalior", state: "Madhya Pradesh", lat: 26.2183, lng: 78.1828 },
  { name: "Sanchi", state: "Madhya Pradesh", lat: 23.4794, lng: 77.7392 },
  { name: "Ujjain", state: "Madhya Pradesh", lat: 23.1765, lng: 75.7885 },
  { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
  { name: "Konark", state: "Odisha", lat: 19.8876, lng: 86.0945 },
  { name: "Puri", state: "Odisha", lat: 19.8135, lng: 85.8312 },
  { name: "Bodh Gaya", state: "Bihar", lat: 24.6961, lng: 84.9911 },
  { name: "Nalanda", state: "Bihar", lat: 25.1367, lng: 85.4438 },
  { name: "Aurangabad", state: "Maharashtra", lat: 19.8762, lng: 75.3433, alias: ["ajanta", "ellora"] },
  { name: "Thanjavur", state: "Tamil Nadu", lat: 10.787, lng: 79.1378, alias: ["tanjore"] },
  { name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198 },
  { name: "Mahabalipuram", state: "Tamil Nadu", lat: 12.6269, lng: 80.1927, alias: ["mamallapuram"] },
  { name: "Kanyakumari", state: "Tamil Nadu", lat: 8.0883, lng: 77.5385 },
  { name: "Tirupati", state: "Andhra Pradesh", lat: 13.6288, lng: 79.4192 },
  { name: "Hospet", state: "Karnataka", lat: 15.2689, lng: 76.3909 },
  { name: "Somnath", state: "Gujarat", lat: 20.888, lng: 70.401 },
  { name: "Dwarka", state: "Gujarat", lat: 22.2394, lng: 68.9678 },
  { name: "Shirdi", state: "Maharashtra", lat: 19.7645, lng: 74.4762 },
  { name: "Haridwar", state: "Uttarakhand", lat: 29.9457, lng: 78.1642 },
  { name: "Rishikesh", state: "Uttarakhand", lat: 30.0869, lng: 78.2676 },
  { name: "Mathura", state: "Uttarakhand", lat: 27.4924, lng: 77.6737 },
  { name: "Vrindavan", state: "Uttar Pradesh", lat: 27.5806, lng: 77.7006 },
  { name: "Ayodhya", state: "Uttar Pradesh", lat: 26.7922, lng: 82.1998 },
  { name: "Prayagraj", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463, alias: ["allahabad"] },

  // Hills, beaches and backwaters
  { name: "Goa", state: "Goa", lat: 15.2993, lng: 74.124 },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673, alias: ["cochin", "ernakulam"] },
  { name: "Munnar", state: "Kerala", lat: 10.0889, lng: 77.0595 },
  { name: "Alappuzha", state: "Kerala", lat: 9.4981, lng: 76.3388, alias: ["alleppey"] },
  { name: "Thekkady", state: "Kerala", lat: 9.5916, lng: 77.1603 },
  { name: "Varkala", state: "Kerala", lat: 8.7379, lng: 76.7163 },
  { name: "Kovalam", state: "Kerala", lat: 8.4004, lng: 76.9784 },
  { name: "Wayanad", state: "Kerala", lat: 11.6854, lng: 76.132 },
  { name: "Kozhikode", state: "Kerala", lat: 11.2588, lng: 75.7804, alias: ["calicut"] },
  { name: "Ooty", state: "Tamil Nadu", lat: 11.4102, lng: 76.695, alias: ["udhagamandalam"] },
  { name: "Kodaikanal", state: "Tamil Nadu", lat: 10.2381, lng: 77.4892 },
  { name: "Coonoor", state: "Tamil Nadu", lat: 11.3494, lng: 76.7956 },
  { name: "Puducherry", state: "Puducherry", lat: 11.9416, lng: 79.8083, alias: ["pondicherry"] },
  { name: "Coorg", state: "Karnataka", lat: 12.3375, lng: 75.8069, alias: ["madikeri", "kodagu"] },
  { name: "Chikmagalur", state: "Karnataka", lat: 13.3161, lng: 75.7720 },
  { name: "Gokarna", state: "Karnataka", lat: 14.5479, lng: 74.3188 },
  { name: "Manali", state: "Himachal Pradesh", lat: 32.2432, lng: 77.1892 },
  { name: "Dharamshala", state: "Himachal Pradesh", lat: 32.219, lng: 76.3234, alias: ["mcleodganj"] },
  { name: "Kasol", state: "Himachal Pradesh", lat: 32.0100, lng: 77.3152 },
  { name: "Dalhousie", state: "Himachal Pradesh", lat: 32.5387, lng: 75.9707 },
  { name: "Spiti", state: "Himachal Pradesh", lat: 32.2464, lng: 78.0349, alias: ["kaza"] },
  { name: "Leh", state: "Ladakh", lat: 34.1526, lng: 77.5771, alias: ["ladakh"] },
  { name: "Nubra Valley", state: "Ladakh", lat: 34.6868, lng: 77.5619 },
  { name: "Nainital", state: "Uttarakhand", lat: 29.3803, lng: 79.4636 },
  { name: "Mussoorie", state: "Uttarakhand", lat: 30.4598, lng: 78.0644 },
  { name: "Auli", state: "Uttarakhand", lat: 30.5290, lng: 79.5666 },
  { name: "Jim Corbett", state: "Uttarakhand", lat: 29.53, lng: 78.7747, alias: ["ramnagar"] },
  { name: "Darjeeling", state: "West Bengal", lat: 27.041, lng: 88.2663 },
  { name: "Kalimpong", state: "West Bengal", lat: 27.0600, lng: 88.4700 },
  { name: "Digha", state: "West Bengal", lat: 21.6270, lng: 87.5090 },
  { name: "Pelling", state: "Sikkim", lat: 27.3000, lng: 88.2400 },
  { name: "Tawang", state: "Arunachal Pradesh", lat: 27.5860, lng: 91.8590 },
  { name: "Cherrapunji", state: "Meghalaya", lat: 25.27, lng: 91.732, alias: ["sohra"] },
  { name: "Kaziranga", state: "Assam", lat: 26.5775, lng: 93.1711 },
  { name: "Majuli", state: "Assam", lat: 26.9500, lng: 94.1700 },
  { name: "Rann of Kutch", state: "Gujarat", lat: 23.7333, lng: 69.8597, alias: ["bhuj"] },
  { name: "Udupi", state: "Karnataka", lat: 13.3409, lng: 74.7421 },
  { name: "Mangaluru", state: "Karnataka", lat: 12.9141, lng: 74.856, alias: ["mangalore"] },
  { name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185, alias: ["vizag"] },
  { name: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898 },
  { name: "Lonavala", state: "Maharashtra", lat: 18.7546, lng: 73.4062 },
  { name: "Mahabaleshwar", state: "Maharashtra", lat: 17.9307, lng: 73.6477 },
  { name: "Alibaug", state: "Maharashtra", lat: 18.6414, lng: 72.8722 },
  { name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311 },
  { name: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812, alias: ["baroda"] },
  { name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  { name: "Tiruchirappalli", state: "Tamil Nadu", lat: 10.7905, lng: 78.7047, alias: ["trichy", "srirangam"] },
  { name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319 },
  { name: "Jabalpur", state: "Madhya Pradesh", lat: 23.1815, lng: 79.9864 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
  { name: "Siliguri", state: "West Bengal", lat: 26.7271, lng: 88.3953 },
  { name: "Jaisalmer Desert", state: "Rajasthan", lat: 26.8380, lng: 70.9000, alias: ["sam dunes"] },
];

const norm = (s) => String(s || "").trim().toLowerCase();

/** Prefix matches first, then any other hit, capped for a tidy list. */
export const findPlaces = (query, limit = 8) => {
  const q = norm(query);
  if (q.length < 2) return [];

  const scored = [];
  for (const place of PLACES) {
    const name = norm(place.name);
    const names = [name, ...(place.alias || []).map(norm)];
    let score = null;
    if (names.some((n) => n === q)) score = 0;
    else if (names.some((n) => n.startsWith(q))) score = 1;
    else if (names.some((n) => n.includes(q))) score = 2;
    else if (norm(place.state).startsWith(q)) score = 3;
    if (score !== null) scored.push({ place, score });
  }

  return scored
    .sort((a, b) => a.score - b.score || a.place.name.localeCompare(b.place.name))
    .slice(0, limit)
    .map(({ place }) => ({
      id: `place-${norm(place.name).replace(/\s+/g, "-")}`,
      name: place.name,
      secondaryText: [place.state, "India"].filter(Boolean).join(", "),
      destType: "city",
      lat: place.lat,
      lng: place.lng,
      source: "safarx",
    }));
};
