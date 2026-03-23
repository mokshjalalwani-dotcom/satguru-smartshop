export interface Event {
  id: string;
  name: string;
  date: string; // ISO format: YYYY-MM-DD
  type: "festival" | "financial" | "inventory" | "promotion";
  tag: string;
  expectedSurge: string;
  color: string;
  bgGlow: string;
  suggestions: string[];
  insight: string;
  message?: string; // Specific message for the alert toast
  daysLeft?: number;
}

export const upcomingEvents: Event[] = [
  {
    id: "EVT-1",
    name: "Holi Festival Sale",
    date: "2026-03-14",
    type: "festival",
    tag: "Regional Festival",
    expectedSurge: "+85%",
    color: "from-pink-500 to-purple-500",
    bgGlow: "bg-pink-500",
    suggestions: ["LED Strip Lights", "Smart Speakers", "Party Audio Systems"],
    insight: "Last year Holi week sales were ₹3.2L, highest in Q4 FY24-25.",
    message: "Suggested: Stock up on LED Strip Lights, Smart Speakers, and Party Audio Systems"
  },
  {
    id: "EVT-2",
    name: "Ugadi / Gudi Padwa",
    date: "2026-03-25",
    type: "festival",
    tag: "New Year Festival",
    expectedSurge: "+45%",
    color: "from-amber-500 to-orange-500",
    bgGlow: "bg-amber-500",
    suggestions: ["Home Appliances", "Ceiling Fans", "Water Purifiers"],
    insight: "Regional new year drives 35-50% lift in home appliance sales.",
    message: "High demand expected for Home Appliances and Cooling Systems."
  },
  {
    id: "EVT-3",
    name: "FY 2025-26 Closing",
    date: "2026-03-31",
    type: "financial",
    tag: "Financial Year End",
    expectedSurge: "+120%",
    color: "from-cyan-500 to-blue-500",
    bgGlow: "bg-cyan-500",
    suggestions: ["Bulk Corporate Orders", "Printer Supplies", "UPS Systems"],
    insight: "FY-end corporate procurement spikes. Last year March contributed 18% of annual revenue.",
    message: "Corporate bulk orders expected. Prepare Printer Supplies, UPS Systems, and Laptops"
  },
  {
    id: "EVT-4",
    name: "Akshaya Tritiya",
    date: "2026-04-21",
    type: "promotion",
    tag: "Auspicious Purchase Day",
    expectedSurge: "+60%",
    color: "from-yellow-500 to-amber-500",
    bgGlow: "bg-yellow-500",
    suggestions: ["Smart Watches", "Premium Electronics", "Gold-finish Gadgets"],
    insight: "Traditionally drives high-value electronic purchases. Stock premium items.",
    message: "Auspicious day for high-value tech. Prepare premium displays."
  },
];
