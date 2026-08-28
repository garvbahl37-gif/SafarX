/**
 * Indian railway stations, held locally.
 *
 * IRCTC's station endpoint resolves an exact code and nothing else — it cannot
 * answer "delhi" — so the from/to fields match against this list in the
 * browser. Instant, no quota, and it turns the names people type into the
 * codes the API needs.
 *
 * Codes are the official station codes; a journey search needs those, not names.
 */

export const STATIONS = [
  { code: "NDLS", name: "New Delhi", city: "Delhi" },
  { code: "DLI", name: "Old Delhi", city: "Delhi" },
  { code: "NZM", name: "Hazrat Nizamuddin", city: "Delhi" },
  { code: "ANVT", name: "Anand Vihar Terminal", city: "Delhi" },
  { code: "DEE", name: "Delhi Sarai Rohilla", city: "Delhi" },
  { code: "MMCT", name: "Mumbai Central", city: "Mumbai" },
  { code: "CSMT", name: "Chhatrapati Shivaji Maharaj Terminus", city: "Mumbai" },
  { code: "LTT", name: "Lokmanya Tilak Terminus", city: "Mumbai" },
  { code: "BDTS", name: "Bandra Terminus", city: "Mumbai" },
  { code: "DR", name: "Dadar", city: "Mumbai" },
  { code: "PNVL", name: "Panvel", city: "Mumbai" },
  { code: "SBC", name: "KSR Bengaluru City", city: "Bengaluru" },
  { code: "YPR", name: "Yesvantpur", city: "Bengaluru" },
  { code: "MAS", name: "MGR Chennai Central", city: "Chennai" },
  { code: "MS", name: "Chennai Egmore", city: "Chennai" },
  { code: "HWH", name: "Howrah", city: "Kolkata" },
  { code: "SDAH", name: "Sealdah", city: "Kolkata" },
  { code: "KOAA", name: "Kolkata", city: "Kolkata" },
  { code: "SC", name: "Secunderabad", city: "Hyderabad" },
  { code: "HYB", name: "Hyderabad Deccan", city: "Hyderabad" },
  { code: "PUNE", name: "Pune", city: "Pune" },
  { code: "ADI", name: "Ahmedabad", city: "Ahmedabad" },
  { code: "JP", name: "Jaipur", city: "Jaipur" },
  { code: "LKO", name: "Lucknow Charbagh", city: "Lucknow" },
  { code: "BPL", name: "Bhopal", city: "Bhopal" },
  { code: "PNBE", name: "Patna", city: "Patna" },
  { code: "BBS", name: "Bhubaneswar", city: "Bhubaneswar" },
  { code: "TVC", name: "Thiruvananthapuram Central", city: "Thiruvananthapuram" },
  { code: "GHY", name: "Guwahati", city: "Guwahati" },
  { code: "RNC", name: "Ranchi", city: "Ranchi" },
  { code: "R", name: "Raipur", city: "Raipur" },
  { code: "DDN", name: "Dehradun", city: "Dehradun" },
  { code: "CDG", name: "Chandigarh", city: "Chandigarh" },
  { code: "ASR", name: "Amritsar", city: "Amritsar" },
  { code: "JAT", name: "Jammu Tawi", city: "Jammu" },
  { code: "SVDK", name: "Shri Mata Vaishno Devi Katra", city: "Katra" },
  { code: "AGC", name: "Agra Cantt", city: "Agra" },
  { code: "BSB", name: "Varanasi Junction", city: "Varanasi" },
  { code: "BSBS", name: "Banaras", city: "Varanasi" },
  { code: "PRYJ", name: "Prayagraj Junction", city: "Prayagraj" },
  { code: "CNB", name: "Kanpur Central", city: "Kanpur" },
  { code: "GKP", name: "Gorakhpur", city: "Gorakhpur" },
  { code: "AYC", name: "Ayodhya Cantt", city: "Ayodhya" },
  { code: "MTJ", name: "Mathura", city: "Mathura" },
  { code: "HW", name: "Haridwar", city: "Haridwar" },
  { code: "RKSH", name: "Rishikesh", city: "Rishikesh" },
  { code: "JUC", name: "Jalandhar City", city: "Jalandhar" },
  { code: "UMB", name: "Ambala Cantt", city: "Ambala" },
  { code: "KLK", name: "Kalka", city: "Kalka" },
  { code: "JU", name: "Jodhpur", city: "Jodhpur" },
  { code: "UDZ", name: "Udaipur City", city: "Udaipur" },
  { code: "JSM", name: "Jaisalmer", city: "Jaisalmer" },
  { code: "BKN", name: "Bikaner", city: "Bikaner" },
  { code: "AII", name: "Ajmer", city: "Ajmer" },
  { code: "COR", name: "Chittaurgarh", city: "Chittorgarh" },
  { code: "ABR", name: "Abu Road", city: "Mount Abu" },
  { code: "KOTA", name: "Kota", city: "Kota" },
  { code: "GWL", name: "Gwalior", city: "Gwalior" },
  { code: "JHS", name: "Jhansi", city: "Jhansi" },
  { code: "KURJ", name: "Khajuraho", city: "Khajuraho" },
  { code: "STA", name: "Satna", city: "Satna" },
  { code: "JBP", name: "Jabalpur", city: "Jabalpur" },
  { code: "INDB", name: "Indore", city: "Indore" },
  { code: "UJN", name: "Ujjain", city: "Ujjain" },
  { code: "NGP", name: "Nagpur", city: "Nagpur" },
  { code: "NK", name: "Nashik Road", city: "Nashik" },
  { code: "AWB", name: "Aurangabad", city: "Aurangabad" },
  { code: "SNSI", name: "Sainagar Shirdi", city: "Shirdi" },
  { code: "SUR", name: "Solapur", city: "Solapur" },
  { code: "KOP", name: "Kolhapur", city: "Kolhapur" },
  { code: "MAO", name: "Madgaon", city: "Goa" },
  { code: "THVM", name: "Thivim", city: "Goa" },
  { code: "VSG", name: "Vasco da Gama", city: "Goa" },
  { code: "UD", name: "Udupi", city: "Udupi" },
  { code: "MAJN", name: "Mangaluru Junction", city: "Mangaluru" },
  { code: "MYS", name: "Mysuru", city: "Mysuru" },
  { code: "HPT", name: "Hospet", city: "Hampi" },
  { code: "UBL", name: "Hubballi", city: "Hubballi" },
  { code: "BGM", name: "Belagavi", city: "Belagavi" },
  { code: "BJP", name: "Vijayapura", city: "Bijapur" },
  { code: "ERS", name: "Ernakulam Junction", city: "Kochi" },
  { code: "ERN", name: "Ernakulam Town", city: "Kochi" },
  { code: "ALLP", name: "Alappuzha", city: "Alappuzha" },
  { code: "KTYM", name: "Kottayam", city: "Kottayam" },
  { code: "CLT", name: "Kozhikode", city: "Kozhikode" },
  { code: "VRL", name: "Varkala Sivagiri", city: "Varkala" },
  { code: "QLN", name: "Kollam", city: "Kollam" },
  { code: "PGT", name: "Palakkad", city: "Palakkad" },
  { code: "CBE", name: "Coimbatore", city: "Coimbatore" },
  { code: "MDU", name: "Madurai", city: "Madurai" },
  { code: "TPJ", name: "Tiruchchirappalli", city: "Tiruchirappalli" },
  { code: "TJ", name: "Thanjavur", city: "Thanjavur" },
  { code: "RMM", name: "Rameswaram", city: "Rameswaram" },
  { code: "CAPE", name: "Kanniyakumari", city: "Kanyakumari" },
  { code: "PDY", name: "Puducherry", city: "Puducherry" },
  { code: "TPTY", name: "Tirupati", city: "Tirupati" },
  { code: "BZA", name: "Vijayawada", city: "Vijayawada" },
  { code: "VSKP", name: "Visakhapatnam", city: "Visakhapatnam" },
  { code: "GNT", name: "Guntur", city: "Guntur" },
  { code: "PURI", name: "Puri", city: "Puri" },
  { code: "CTC", name: "Cuttack", city: "Cuttack" },
  { code: "KUR", name: "Khurda Road", city: "Bhubaneswar" },
  { code: "NJP", name: "New Jalpaiguri", city: "Siliguri" },
  { code: "DJ", name: "Darjeeling", city: "Darjeeling" },
  { code: "MLDT", name: "Malda Town", city: "Malda" },
  { code: "BWN", name: "Barddhaman", city: "Bardhaman" },
  { code: "DGHA", name: "Digha", city: "Digha" },
  { code: "KGP", name: "Kharagpur", city: "Kharagpur" },
  { code: "TATA", name: "Tatanagar", city: "Jamshedpur" },
  { code: "DHN", name: "Dhanbad", city: "Dhanbad" },
  { code: "GAYA", name: "Gaya", city: "Bodh Gaya" },
  { code: "MFP", name: "Muzaffarpur", city: "Muzaffarpur" },
  { code: "NDT", name: "New Tinsukia", city: "Tinsukia" },
  { code: "DBRG", name: "Dibrugarh", city: "Dibrugarh" },
  { code: "SCL", name: "Silchar", city: "Silchar" },
  { code: "AGTL", name: "Agartala", city: "Agartala" },
  { code: "RNY", name: "Rangiya", city: "Rangiya" },
  { code: "BME", name: "Barmer", city: "Barmer" },
  { code: "BHUJ", name: "Bhuj", city: "Bhuj" },
  { code: "RJT", name: "Rajkot", city: "Rajkot" },
  { code: "ST", name: "Surat", city: "Surat" },
  { code: "BRC", name: "Vadodara", city: "Vadodara" },
  { code: "SMNH", name: "Somnath", city: "Somnath" },
  { code: "OKHA", name: "Okha", city: "Dwarka" },
  { code: "VAPI", name: "Vapi", city: "Vapi" },
  { code: "SBP", name: "Sambalpur", city: "Sambalpur" },
];

const norm = (s) => String(s || "").trim().toLowerCase();

/** Exact code first, then name, then the city it serves. */
export const findStations = (query, limit = 7) => {
  const q = norm(query);
  if (q.length < 2) return [];

  const scored = [];
  for (const [index, s] of STATIONS.entries()) {
    const code = norm(s.code);
    const name = norm(s.name);
    const city = norm(s.city);
    let score = null;
    if (code === q) score = 0;
    else if (name === q || city === q) score = 1;
    else if (code.startsWith(q)) score = 2;
    else if (name.startsWith(q) || city.startsWith(q)) score = 3;
    else if (name.includes(q) || city.includes(q)) score = 4;
    if (score !== null) scored.push({ s, score, index });
  }

  // The list is ordered by how much traffic a station actually sees, so ties
  // break on that rather than alphabetically — "delhi" means New Delhi first.
  return scored
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, limit)
    .map(({ s }) => s);
};
