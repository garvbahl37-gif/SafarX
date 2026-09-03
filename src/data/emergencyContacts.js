// src/data/emergencyContacts.js
/**
 * Official Emergency Contacts & Tourist Helplines for India
 * Sources:
 * - ERSS (Emergency Response Support System) - https://112.gov.in
 * - Ministry of Women and Child Development - https://wcd.nic.in (1091, 181, 1098)
 * - Ministry of Tourism (Incredible India 24x7 Multi-lingual Tourist Helpline: 1363)
 * - National Disaster Management Authority (1070 / 1078)
 * - Ministry of External Affairs (Foreign Missions & Consulates in India)
 */

export const NATIONAL_EMERGENCY_NUMBERS = [
 {
 id: "universal_112",
 title: "All-in-One National Emergency (ERSS)",
 number: "112",
 description: "Universal emergency number for Police, Fire, and Ambulance across India",
 category: "universal",
 badge: "24x7 Govt ERSS",
 icon: "ShieldAlert",
 priority: 1,
 },
 {
 id: "tourist_1363",
 title: "Incredible India Tourist Helpline",
 number: "1363",
 altNumber: "1800111363",
 description: "24x7 toll-free multi-lingual tourist helpline by Ministry of Tourism in 12 languages (including German, French, Spanish, Japanese, Russian)",
 category: "tourist",
 badge: "Ministry of Tourism",
 icon: "Compass",
 priority: 2,
 },
 {
 id: "women_1091",
 title: "National Women Helpline",
 number: "1091",
 description: "Emergency support for women in distress / emergency response",
 category: "women",
 badge: "NCW / MHA",
 icon: "ShieldCheck",
 priority: 3,
 },
 {
 id: "women_181",
 title: "Women Helpline (Domestic & Public Distress)",
 number: "181",
 description: "Toll-free 24-hour helpline for women affected by violence or harassment",
 category: "women",
 badge: "Ministry of WCD",
 icon: "HeartHandshake",
 priority: 4,
 },
 {
 id: "police_100",
 title: "Police Control Room",
 number: "100",
 description: "Direct Police Emergency dispatch (integrated with 112)",
 category: "police",
 badge: "State Police",
 icon: "Radio",
 priority: 5,
 },
 {
 id: "ambulance_108",
 title: "Medical & Ambulance Emergency",
 number: "108",
 altNumber: "102",
 description: "Free emergency ambulance and medical transport",
 category: "medical",
 badge: "National Health Mission",
 icon: "Cross",
 priority: 6,
 },
 {
 id: "highway_1033",
 title: "National Highway Emergency (NHAI)",
 number: "1033",
 description: "Emergency medical, crane, and patrol assistance on all National Highways",
 category: "transit",
 badge: "NHAI / MoRTH",
 icon: "Car",
 priority: 7,
 },
 {
 id: "railway_139",
 title: "RailMadad (Indian Railways Security & Helpline)",
 number: "139",
 description: "Integrated railway passenger security, medical aid & complaints",
 category: "transit",
 badge: "Indian Railways",
 icon: "Train",
 priority: 8,
 },
 {
 id: "disaster_1070",
 title: "National Disaster Relief (NDMA)",
 number: "1070",
 altNumber: "1078",
 description: "Emergency assistance during landslides, floods, cyclones & earthquakes",
 category: "disaster",
 badge: "NDMA / MHA",
 icon: "CloudRain",
 priority: 9,
 },
 {
 id: "child_1098",
 title: "Childline Emergency",
 number: "1098",
 description: "24x7 emergency helpline for children in need of care and protection",
 category: "child",
 badge: "Ministry of WCD",
 icon: "Smile",
 priority: 10,
 }
];

export const STATE_EMERGENCY_DATA = {
 "Andaman and Nicobar Islands": {
 police: "112 / 03192-232100",
 womenHelpline: "1091 / 03192-233054",
 touristPolice: "03192-232694",
 hospital: "GB Pant Hospital Port Blair: 03192-232102",
 disasterControl: "1077 / 03192-238880",
 stateNotes: "Carry valid photo ID. Foreigners require RAP verification at Port Blair."
 },
 "Andhra Pradesh": {
 police: "112 / 100",
 womenHelpline: "1091 / 181 (Disha Helpline)",
 touristPolice: "1363 / 0863-2340100",
 hospital: "AP Emergency Health Services: 108",
 disasterControl: "1070 / 0863-2377107",
 stateNotes: "Disha SOS app integrated with State Police for instant 6-minute emergency dispatch."
 },
 "Arunachal Pradesh": {
 police: "112 / 0360-2212233",
 womenHelpline: "1091 / 181",
 touristPolice: "0360-2212328",
 hospital: "Tomo Riba Institute (Naharlagun): 0360-2244248",
 disasterControl: "1070 / 0360-2212541",
 stateNotes: "Inner Line Permit (ILP) required for domestic tourists; PAP for international visitors."
 },
 "Assam": {
 police: "112 / 0361-2464555",
 womenHelpline: "181 / 1091",
 touristPolice: "0361-2633654",
 hospital: "Guwahati Medical College: 0361-2529457",
 disasterControl: "1070 / 0361-2237221",
 stateNotes: "Assam Tourist Assistance Booths active across Guwahati, Kaziranga, and Majuli."
 },
 "Bihar": {
 police: "112 / 100",
 womenHelpline: "181 / 1091",
 touristPolice: "0612-2215354 (Patna/Bodh Gaya/Nalanda)",
 hospital: "AIIMS Patna: 0612-2451070",
 disasterControl: "1070 / 0612-2217310",
 stateNotes: "Dedicated Tourist Police deployed across Bodh Gaya, Rajgir, and Vaishali circuits."
 },
 "Chandigarh": {
 police: "112 / 0172-2749194",
 womenHelpline: "1091",
 touristPolice: "0172-2740420",
 hospital: "PGIMER Chandigarh: 0172-2746018",
 disasterControl: "1077",
 stateNotes: "High CCTV coverage; UT Police quick response average under 5 minutes."
 },
 "Chhattisgarh": {
 police: "112",
 womenHelpline: "1091 / 181",
 touristPolice: "0771-4041000",
 hospital: "AIIMS Raipur: 0771-2572999",
 disasterControl: "1070 / 0771-2223471",
 stateNotes: "Follow guided routes in Bastar & wildlife sanctuary areas."
 },
 "Delhi": {
 police: "112 / 011-23490010",
 womenHelpline: "1091 / 011-23317004 / 181",
 touristPolice: "011-23340554 / 8750871111 (Delhi Tourist Police)",
 hospital: "AIIMS Delhi: 011-26588500 / Safdarjung: 011-26165060",
 disasterControl: "1077 / 011-22421656",
 stateNotes: "Dedicated Tourist Police vans stationed at India Gate, Red Fort, Qutub Minar, and IGI Airport."
 },
 "Goa": {
 police: "112 / 0832-2420875",
 womenHelpline: "1091 / 181",
 touristPolice: "1363 / 0832-2428800 (Goa Tourist Police Coastal Patrol)",
 hospital: "Goa Medical College (Bambolim): 0832-2458700",
 disasterControl: "1070 / 0832-2419550",
 stateNotes: "Lifeguard emergency towers active on all major beaches; pink police patrol for women travelers."
 },
 "Gujarat": {
 police: "112 / 100",
 womenHelpline: "181 (Abhayam Women Helpline)",
 touristPolice: "079-23977200",
 hospital: "Civil Hospital Ahmedabad: 079-22680074",
 disasterControl: "1070 / 079-23251900",
 stateNotes: "Abhayam 181 rapid rescue vans active statewide."
 },
 "Haryana": {
 police: "112",
 womenHelpline: "1091",
 touristPolice: "0172-2584100",
 hospital: "Civil Hospital Gurugram: 0124-2320102",
 disasterControl: "1070",
 stateNotes: "Haryana Dial 112 with integrated GPS ambulance and police dispatch."
 },
 "Himachal Pradesh": {
 police: "112 / 0177-2621714",
 womenHelpline: "1091 / 181",
 touristPolice: "0177-2625864 (Shimla / Manali Tourist Assistance)",
 hospital: "IGMC Shimla: 0177-2804251",
 disasterControl: "1070 / 1077 (Himachal Disaster Control)",
 stateNotes: "Check mountain pass weather (Atal Tunnel, Rohtang) during winter/monsoon; carry snow chains."
 },
 "Jammu and Kashmir": {
 police: "112 / 0194-2452222 (Srinagar) / 0191-2542000 (Jammu)",
 womenHelpline: "181 / 1091",
 touristPolice: "0194-2472449 (Srinagar TRC Tourist Police) / 0191-2546524",
 hospital: "SKIMS Soura: 0194-2401013 / GMC Jammu: 0191-2584283",
 disasterControl: "1070 / 0194-2455554",
 stateNotes: "Tourist Police counters at Srinagar Airport, TRC Dal Lake, Gulmarg, and Pahalgam."
 },
 "Jharkhand": {
 police: "112 / 100",
 womenHelpline: "181 / 1091",
 touristPolice: "0651-2400981",
 hospital: "RIMS Ranchi: 0651-2541533",
 disasterControl: "1070",
 stateNotes: "State tourist helpline available at major pilgrimage & waterfall circuits."
 },
 "Karnataka": {
 police: "112 / 080-22942222",
 womenHelpline: "1091 / 181 / 080-22943225 (Vanitha Sahayavani)",
 touristPolice: "080-22352828 / 1363",
 hospital: "Victoria Hospital Bengaluru: 080-26701150 / NIMHANS: 080-26995000",
 disasterControl: "1070 / 080-22340676",
 stateNotes: "Namma 112 rapid response in Bengaluru; tourist safety kiosks in Hampi and Mysuru Palace."
 },
 "Kerala": {
 police: "112 / 0471-2318189",
 womenHelpline: "1091 / 181 / 112 (Mitra App)",
 touristPolice: "0471-2321495 / 9497996991 (Kerala Tourist Police Nodal)",
 hospital: "Trivandrum Medical College: 0471-2528300",
 disasterControl: "1070 / 1077",
 stateNotes: "Dedicated Kerala Tourist Police wing operating across Fort Kochi, Munnar, Kovalam, and Alappuzha."
 },
 "Ladakh": {
 police: "112 / 01982-252018 (Leh) / 01985-232210 (Kargil)",
 womenHelpline: "1091 / 181",
 touristPolice: "01982-252018 / 01982-257883",
 hospital: "SNM Hospital Leh: 01982-252014 (Oxygen & AMS support)",
 disasterControl: "1077 / 01982-255530",
 stateNotes: "Mandatory 48-hour acclimatization in Leh. Keep offline map cached. Inner Line Permits required for Nubra & Pangong."
 },
 "Lakshadweep": {
 police: "112 / 04896-262258",
 womenHelpline: "1091",
 touristPolice: "04896-262188",
 hospital: "Indira Gandhi Hospital Kavaratti: 04896-262337",
 disasterControl: "1070 / 1077",
 stateNotes: "Entry permit mandatory from Lakshadweep Administration prior to boarding."
 },
 "Madhya Pradesh": {
 police: "112 / 100",
 womenHelpline: "1090 / 1091 (Nirbhaya Mobile)",
 touristPolice: "1363 / 0755-2778383",
 hospital: "AIIMS Bhopal: 0755-2672317",
 disasterControl: "1070 / 0755-2441419",
 stateNotes: "MP Tourism police kiosks at Khajuraho, Sanchi, Ujjain, and Pachmarhi."
 },
 "Maharashtra": {
 police: "112 / 022-22620111 (Mumbai Control)",
 womenHelpline: "103 (Mumbai Women Helpline) / 1091 / 181",
 touristPolice: "022-22845678 / 1363 (Gateway of India / Marine Drive)",
 hospital: "KEM Hospital Mumbai: 022-24107000 / AIIMS Nagpur",
 disasterControl: "1070 / 022-22027990",
 stateNotes: "Tourist safety booths at Marine Drive, Gateway of India, Ajanta-Ellora, and Lonavala."
 },
 "Manipur": {
 police: "112 / 0385-2450144",
 womenHelpline: "181 / 1091",
 touristPolice: "0385-2443425",
 hospital: "RIMS Imphal: 0385-2414629",
 disasterControl: "1070 / 0385-2458428",
 stateNotes: "Check travel advisories for highway transit routes between Imphal and Dimapur."
 },
 "Meghalaya": {
 police: "112 / 0364-2222214",
 womenHelpline: "1091 / 181",
 touristPolice: "0364-2226220 (Shillong Police)",
 hospital: "NEIGRIHMS Shillong: 0364-2538011",
 disasterControl: "1070 / 0364-2502098",
 stateNotes: "Drive cautiously in heavy fog/mist in Cherrapunjee & Mawsynram regions."
 },
 "Mizoram": {
 police: "112 / 0389-2334444",
 womenHelpline: "181 / 1091",
 touristPolice: "0389-2333485",
 hospital: "Civil Hospital Aizawl: 0389-2322318",
 disasterControl: "1070 / 0389-2335842",
 stateNotes: "Inner Line Permit required. Respect local Sunday quiet regulations in towns."
 },
 "Nagaland": {
 police: "112 / 0370-2244279",
 womenHelpline: "181 / 1091",
 touristPolice: "0370-2290070 (Nagaland Tourist Police)",
 hospital: "Naga Hospital Kohima: 0370-2244243",
 disasterControl: "1070 / 0370-2291122",
 stateNotes: "Dedicated Tourist Police deployed during Hornbill Festival (Kisama) and in Dimapur/Kohima."
 },
 "Odisha": {
 police: "112 / 0674-2536640",
 womenHelpline: "181 / 1091",
 touristPolice: "06752-222073 (Puri Tourist Police Cell)",
 hospital: "AIIMS Bhubaneswar: 0674-2476789",
 disasterControl: "1070 / 0674-2534177",
 stateNotes: "Special Tourist Police protection at Puri Sea Beach, Jagannath Temple, and Konark Sun Temple."
 },
 "Puducherry": {
 police: "112 / 0413-2231300",
 womenHelpline: "1091 / 181",
 touristPolice: "0413-2339497 (Promenade Beach Police)",
 hospital: "JIPMER Puducherry: 0413-2296000",
 disasterControl: "1077 / 0413-2253407",
 stateNotes: "Coastal & Promenade Tourist Police booth operates 24x7 in White Town."
 },
 "Punjab": {
 police: "112 / 0172-2740397",
 womenHelpline: "1091 / 181 (Saanjh Helpline)",
 touristPolice: "0183-2223555 (Amritsar Golden Temple Helpline)",
 hospital: "AIIMS Bathinda / Civil Hospital Amritsar: 0183-2563777",
 disasterControl: "1070 / 0172-2740397",
 stateNotes: "Special Tourist Assistance booth at Amritsar Heritage Street and Wagah Border."
 },
 "Rajasthan": {
 police: "112 / 0141-2744000",
 womenHelpline: "1090 / 1091 / 181",
 touristPolice: "0141-2601738 / 1363 (Rajasthan Tourist Police / Paryatan Mitra)",
 hospital: "SMS Hospital Jaipur: 0141-2560291 / AIIMS Jodhpur",
 disasterControl: "1070 / 0141-2227290",
 stateNotes: "Official Paryatan Mitra (Tourist Police) stationed at Jaipur Forts, Udaipur City Palace, and Jaisalmer Fort."
 },
 "Sikkim": {
 police: "112 / 03592-202022",
 womenHelpline: "1091 / 181",
 touristPolice: "03592-209090 (Gangtok Tourist Assistance)",
 hospital: "STNM Hospital Gangtok: 03592-202944",
 disasterControl: "1070 / 03592-201075",
 stateNotes: "Protected Area Permit (PAP) required for Nathula, Tsomgo Lake, and North Sikkim (Lachung/Lachen)."
 },
 "Tamil Nadu": {
 police: "112 / 044-28447777",
 womenHelpline: "1091 / 181 / 044-28447701 (Kavalan SOS)",
 touristPolice: "044-25380590 / 1363",
 hospital: "Rajiv Gandhi Govt General Hospital Chennai: 044-25305000",
 disasterControl: "1070 / 044-28593990",
 stateNotes: "Kavalan SOS integration with State Police Control; safety kiosks at Mahabalipuram, Madurai & Ooty."
 },
 "Telangana": {
 police: "112 / 100 / 040-27852435",
 womenHelpline: "1091 / 181 / 040-27852355 (SHE Teams)",
 touristPolice: "040-23450444",
 hospital: "Gandhi Hospital Hyderabad: 040-27505566 / AIIMS Bibinagar",
 disasterControl: "1070 / 040-23450624",
 stateNotes: "Renowned Hyderabad SHE Teams patrolling tourist hotspots and public transit for women's safety."
 },
 "Tripura": {
 police: "112 / 0381-2324000",
 womenHelpline: "1091 / 181",
 touristPolice: "0381-2325930",
 hospital: "AGMC Agartala: 0381-2356701",
 disasterControl: "1070 / 0381-2415385",
 stateNotes: "Police tourist facilitation counters active at Ujjayanta Palace and Neermahal."
 },
 "Uttar Pradesh": {
 police: "112 (UP 112 PRV Quick Response)",
 womenHelpline: "1090 (Women Power Line) / 181",
 touristPolice: "0562-2421204 (Agra Tourist Police / Taj Mahal) / 0542-2502688 (Varanasi Ghats)",
 hospital: "KGMU Lucknow: 0522-2257450 / AIIMS Gorakhpur",
 disasterControl: "1070 / 0522-2238084",
 stateNotes: "Special Tourist Police stations at Taj Mahal Agra, Varanasi Ghats, and Ayodhya Ram Mandir."
 },
 "Uttarakhand": {
 police: "112 / 0135-2716201",
 womenHelpline: "1090 / 1091 / 181 (Gaura Shakti App)",
 touristPolice: "0135-2716203 / 01372-252100 (Char Dham Yatra Tourist Control)",
 hospital: "AIIMS Rishikesh: 0135-2462940",
 disasterControl: "1070 / 0135-2710334 (SDRF)",
 stateNotes: "Char Dham Yatra mandatory biometric registration & state police checkposts across Rishikesh, Badrinath, Kedarnath."
 },
 "West Bengal": {
 police: "112 / 033-22145000",
 womenHelpline: "1091 / 181 / 033-22145455 (Winners Women Police Team)",
 touristPolice: "033-22143730 / 0354-2252100 (Darjeeling Tourist Police)",
 hospital: "SSKM Hospital Kolkata: 033-22231589 / Medical College Kolkata",
 disasterControl: "1070 / 033-22143526",
 stateNotes: "Dedicated Tourist Police assistance booths at Darjeeling Mall Road, Digha Beach, and Victoria Memorial."
 }
};

export const EMBASSY_DIRECTORY = [
 {
 country: "United States of America",
 city: "New Delhi (Embassy) + Mumbai, Chennai, Kolkata, Hyderabad (Consulates)",
 phone: "011-24198000",
 emergencyPhone: "011-24198000 (24x7 Citizen Services)",
 address: "Shantipath, Chanakyapuri, New Delhi, Delhi 110021",
 email: "acsnd@state.gov",
 website: "https://in.usembassy.gov"
 },
 {
 country: "United Kingdom",
 city: "New Delhi (High Commission) + Mumbai, Bengaluru, Chennai, Kolkata",
 phone: "011-24192100",
 emergencyPhone: "011-24192100",
 address: "Shantipath, Chanakyapuri, New Delhi 110021",
 email: "web.newdelhi@fcdo.gov.uk",
 website: "https://www.gov.uk/world/india"
 },
 {
 country: "France",
 city: "New Delhi + Mumbai, Puducherry, Bengaluru, Kolkata",
 phone: "011-43196100",
 emergencyPhone: "011-43196100",
 address: "2/50-E Shantipath, Chanakyapuri, New Delhi 110021",
 email: "admin-francais.new-delhi-amba@diplomatie.gouv.fr",
 website: "https://in.ambafrance.org"
 },
 {
 country: "Germany",
 city: "New Delhi + Mumbai, Bengaluru, Chennai, Kolkata",
 phone: "011-44199199",
 emergencyPhone: "011-44199199",
 address: "No. 6/50G, Shantipath, Chanakyapuri, New Delhi 110021",
 email: "info@new-delhi.diplo.de",
 website: "https://india.diplo.de"
 },
 {
 country: "Japan",
 city: "New Delhi + Mumbai, Chennai, Kolkata, Bengaluru",
 phone: "011-46104610",
 emergencyPhone: "011-46104610",
 address: "50-G, Chanakyapuri, New Delhi 110021",
 email: "jpemb-cons@nd.mofa.go.jp",
 website: "https://www.in.emb-japan.go.jp"
 },
 {
 country: "Australia",
 city: "New Delhi (High Commission) + Mumbai, Chennai, Kolkata, Bengaluru",
 phone: "011-41399900",
 emergencyPhone: "+61 2 6261 3305 (24/7 Consular Emergency Centre)",
 address: "1/50G Shantipath, Chanakyapuri, New Delhi 110021",
 email: "ahc.newdelhi@dfat.gov.au",
 website: "https://india.highcommission.gov.au"
 },
 {
 country: "Canada",
 city: "New Delhi (High Commission) + Mumbai, Bengaluru, Chandigarh",
 phone: "011-41782000",
 emergencyPhone: "+1 613 996 8885 (Emergency Watch and Response Centre)",
 address: "7/8 Shantipath, Chanakyapuri, New Delhi 110021",
 email: "delhi-consular@international.gc.ca",
 website: "https://www.international.gc.ca/country-pays/india-inde"
 },
 {
 country: "United Arab Emirates",
 city: "New Delhi (Embassy) + Mumbai, Thiruvananthapuram, Hyderabad",
 phone: "011-26111111",
 emergencyPhone: "00971-80024",
 address: "12 Chandragupta Marg, Chanakyapuri, New Delhi 110021",
 email: "newdelhiemb@mofa.gov.ae",
 website: "https://www.mofa.gov.ae"
 }
];

/** Lines that work anywhere in India — the right answer when the state is unknown. */
const NATIONAL_EMERGENCY_CONTACTS = {
 state: "India (National)",
 police: "112 / 100",
 womenHelpline: "1091 / 181",
 touristPolice: "1363 (24x7 Incredible India Helpline)",
 hospital: "108 / 102",
 disasterControl: "1070",
 stateNotes: "Dial 112 for all police, medical, and fire emergencies in any location in India."
};

export const getEmergencyContactsForState = (stateName) => {
 /* Not knowing which state someone is in is not a reason to hand them
    Delhi's local numbers — AIIMS's switchboard and the India Gate tourist
    police van are no use in Shillong. The national lines below work
    everywhere, which is exactly what an unknown location needs. */
 if (!stateName || !String(stateName).trim()) return NATIONAL_EMERGENCY_CONTACTS;
  
 // Clean match
 const stateKey = Object.keys(STATE_EMERGENCY_DATA).find((key) => key.toLowerCase() === stateName.trim().toLowerCase()
 );

 if (stateKey) {
 return { state: stateKey, ...STATE_EMERGENCY_DATA[stateKey] };
 }

 // Partial match fallback
 const partialKey = Object.keys(STATE_EMERGENCY_DATA).find((key) => key.toLowerCase().includes(stateName.toLowerCase()) || stateName.toLowerCase().includes(key.toLowerCase())
 );

 if (partialKey) {
 return { state: partialKey, ...STATE_EMERGENCY_DATA[partialKey] };
 }

 // Default to universal national numbers
 return { ...NATIONAL_EMERGENCY_CONTACTS, state: stateName || "India (National)" };
};
