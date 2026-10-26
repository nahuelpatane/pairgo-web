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

export const AVATAR_COLORS = ["#e8654a", "#60a5fa", "#a78bfa", "#34d399", "#f472b6", "#fbbf24", "#6ee7b7", "#c084fc"];
export const getAvatarColor = (id = "") => AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length] || "#e8654a";
export const getInitials = (name = "") => name.trim().split(" ").slice(0, 2).map(w => (w[0] || "").toUpperCase()).join("") || "?";
