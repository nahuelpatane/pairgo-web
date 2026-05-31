export const CITIES = [
  "Sydney", "Melbourne", "Brisbane", "Gold Coast", "Cairns",
  "Byron Bay", "Perth", "Adelaide", "Darwin", "Hobart",
  "Noosa", "Airlie Beach", "Townsville", "Broome",
];

export const ROLES = [
  "Kitchen Hand", "Barista", "Chef / Cook", "Bar Staff",
  "Waiter / Waitress", "Housekeeper", "Farm Hand", "Retail Assistant",
  "Tour Guide", "Surf Instructor", "Cleaner", "Dishwasher",
  "Front Desk / Reception", "Fruit Picker",
];

export const VENUE_TYPES = [
  "Restaurant", "Café", "Bar & Lounge", "Hotel",
  "Hostel", "Farm / Agriculture", "Retail Store",
  "Tour Operator", "Surf School", "Other",
];

export const DEMO_BACKPACKER = {
  id: "demo_bp",
  email: "demo@pairgo.com",
  name: "Emma Laurent",
  role: "backpacker",
  currentCity: "Cairns",
  currentRole: "Kitchen Hand",
  targetCity: "Melbourne",
};

export const DEMO_MANAGER = {
  id: "demo_mgr",
  email: "manager@pairgo.com",
  name: "Tom Sullivan",
  role: "manager",
  venueName: "Saltwater Café",
  city: "Byron Bay",
  venueType: "Café",
  roleNeeded: "Barista",
};

export const AVATAR_COLORS = ["#e8654a", "#60a5fa", "#a78bfa", "#34d399", "#f472b6", "#fbbf24", "#6ee7b7", "#c084fc"];
export const getAvatarColor = (id = "") => AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length] || "#e8654a";
export const getInitials = (name = "") => name.trim().split(" ").slice(0, 2).map(w => (w[0] || "").toUpperCase()).join("") || "?";

export const MOCK_BACKPACKERS = [
  {
    id: "bp_001", name: "Emma Laurent", flag: "🇫🇷", nationality: "French",
    initials: "EL", avatarColor: "#e8654a",
    currentCity: "Sydney", targetCity: "Melbourne",
    roles: ["Kitchen Hand", "Barista", "Waiter / Waitress"],
    availableFrom: "2026-06-10",
    bio: "3 years hospitality experience in Paris. Reliable, fast learner.",
    rating: 4.8, reviewCount: 6, verified: true, swapsCompleted: 3,
  },
  {
    id: "bp_002", name: "Luca Rossi", flag: "🇮🇹", nationality: "Italian",
    initials: "LR", avatarColor: "#60a5fa",
    currentCity: "Melbourne", targetCity: "Brisbane",
    roles: ["Chef / Cook", "Kitchen Hand", "Dishwasher"],
    availableFrom: "2026-06-05",
    bio: "Trained chef, 5 years experience. Passionate about food and travel.",
    rating: 4.6, reviewCount: 4, verified: true, swapsCompleted: 2,
  },
  {
    id: "bp_003", name: "Sophie Müller", flag: "🇩🇪", nationality: "German",
    initials: "SM", avatarColor: "#a78bfa",
    currentCity: "Byron Bay", targetCity: "Cairns",
    roles: ["Barista", "Waiter / Waitress", "Front Desk / Reception"],
    availableFrom: "2026-06-20",
    bio: "Experienced barista and front-of-house. Love beach towns and good coffee.",
    rating: 4.9, reviewCount: 8, verified: true, swapsCompleted: 4,
  },
  {
    id: "bp_004", name: "Jake Williams", flag: "🇬🇧", nationality: "British",
    initials: "JW", avatarColor: "#34d399",
    currentCity: "Cairns", targetCity: "Gold Coast",
    roles: ["Bar Staff", "Kitchen Hand", "Dishwasher"],
    availableFrom: "2026-06-01",
    bio: "Pub experience back in the UK. Keen to try hostel bar work across Oz.",
    rating: 4.3, reviewCount: 2, verified: false, swapsCompleted: 1,
  },
  {
    id: "bp_005", name: "Mia Dubois", flag: "🇧🇪", nationality: "Belgian",
    initials: "MD", avatarColor: "#f472b6",
    currentCity: "Brisbane", targetCity: "Sydney",
    roles: ["Housekeeper", "Cleaner", "Front Desk / Reception"],
    availableFrom: "2026-07-01",
    bio: "Detail-oriented and punctual. Hotel housekeeping experience in Brussels.",
    rating: 4.7, reviewCount: 5, verified: true, swapsCompleted: 2,
  },
  {
    id: "bp_006", name: "Carlos Méndez", flag: "🇪🇸", nationality: "Spanish",
    initials: "CM", avatarColor: "#fbbf24",
    currentCity: "Gold Coast", targetCity: "Byron Bay",
    roles: ["Surf Instructor", "Tour Guide", "Bar Staff"],
    availableFrom: "2026-06-15",
    bio: "Certified surf instructor, 4 years teaching. Energetic and reliable.",
    rating: 5.0, reviewCount: 3, verified: true, swapsCompleted: 1,
  },
  {
    id: "bp_007", name: "Anna Kowalski", flag: "🇵🇱", nationality: "Polish",
    initials: "AK", avatarColor: "#6ee7b7",
    currentCity: "Melbourne", targetCity: "Adelaide",
    roles: ["Retail Assistant", "Waiter / Waitress", "Kitchen Hand"],
    availableFrom: "2026-06-08",
    bio: "Friendly and hardworking. 2 years retail in Warsaw, open to hospitality.",
    rating: 4.5, reviewCount: 3, verified: true, swapsCompleted: 1,
  },
  {
    id: "bp_008", name: "Tom Fischer", flag: "🇨🇭", nationality: "Swiss",
    initials: "TF", avatarColor: "#c084fc",
    currentCity: "Sydney", targetCity: "Darwin",
    roles: ["Farm Hand", "Fruit Picker", "Kitchen Hand"],
    availableFrom: "2026-06-25",
    bio: "Looking to complete second-year visa. Strong work ethic, farm experience.",
    rating: 4.4, reviewCount: 2, verified: false, swapsCompleted: 0,
  },
];
