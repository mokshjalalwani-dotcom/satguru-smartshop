export interface Event {
  id: string;
  name: string;
  date: string; // ISO: YYYY-MM-DD
  type: "festival" | "financial" | "inventory" | "promotion";
  tag: string;
  expectedSurge: string;
  color: string;
  bgGlow: string;
  suggestions: string[];
  insight: string;
  message?: string;
  daysLeft?: number;
}

export const upcomingEvents: Event[] = [
  {
    id: "EVT-1",
    name: "Akshaya Tritiya",
    date: "2026-04-21",
    type: "festival",
    tag: "Auspicious Purchase Day",
    expectedSurge: "+65%",
    color: "from-yellow-500 to-amber-500",
    bgGlow: "bg-yellow-500",
    suggestions: ["Samsung Galaxy S24", "Apple iPhone 15", "Sony WH-1000XM5", "Smart Watches"],
    insight: "Akshaya Tritiya drives ₹4.2L+ in premium electronics — customers consider it auspicious to buy high-value items.",
    message: "Stock premium electronics. Expect surge in smartphones, laptops, and audio."
  },
  {
    id: "EVT-2",
    name: "Summer AC Peak Season",
    date: "2026-05-01",
    type: "inventory",
    tag: "Seasonal Surge",
    expectedSurge: "+180%",
    color: "from-cyan-500 to-blue-500",
    bgGlow: "bg-cyan-500",
    suggestions: ["Daikin 1.5 Ton Split AC", "LG Dual Inverter AC", "Voltas 1 Ton AC", "Blue Star 2 Ton AC"],
    insight: "April–June is peak AC season in India. Last year May contributed 38% of annual AC revenue for Satguru.",
    message: "Maximize AC inventory NOW. Logistics lead time is 10-14 days."
  },
  {
    id: "EVT-3",
    name: "Mother's Day Weekend Sale",
    date: "2026-05-10",
    type: "promotion",
    tag: "Special Occasion",
    expectedSurge: "+40%",
    color: "from-pink-500 to-rose-500",
    bgGlow: "bg-pink-500",
    suggestions: ["Philips Air Fryer", "IFB Microwave", "Morphy Richards Mixer", "Dyson Vacuum"],
    insight: "Kitchen appliances and small electronics see consistent 35-45% lift during Mother's Day weekend.",
    message: "Feature kitchen appliances and gifting packs prominently."
  },
  {
    id: "EVT-4",
    name: "Independence Day Sale",
    date: "2026-08-15",
    type: "promotion",
    tag: "National Holiday",
    expectedSurge: "+75%",
    color: "from-orange-500 to-green-500",
    bgGlow: "bg-orange-500",
    suggestions: ["Mi Smart TV", "boAt Soundbar", "Redmi Note 13 Pro+", "Philips LED Pack"],
    insight: "Independence Day is among top 5 electronics sale days. All major brands run aggressive discounts.",
    message: "Begin vendor negotiations for Independence Day offers 4 weeks prior."
  },
  {
    id: "EVT-5",
    name: "Navratri & Dussehra",
    date: "2026-10-02",
    type: "festival",
    tag: "Festival Season",
    expectedSurge: "+95%",
    color: "from-red-500 to-orange-500",
    bgGlow: "bg-red-500",
    suggestions: ["Samsung QLED TV", "LG OLED TV", "Home Theatre Systems", "Washing Machines"],
    insight: "Navratri-Dussehra kickstarts the festive buying wave. TVs and home appliances lead at +120% vs baseline.",
    message: "Pre-stock premium TVs and home appliances by September 15."
  },
  {
    id: "EVT-6",
    name: "Diwali Mega Sale",
    date: "2026-10-20",
    type: "festival",
    tag: "Biggest Festival",
    expectedSurge: "+250%",
    color: "from-yellow-400 to-orange-500",
    bgGlow: "bg-yellow-400",
    suggestions: ["Samsung QLED TV", "LG 65\" OLED", "iPhone 15", "Daikin AC", "Whirlpool Fridge"],
    insight: "Diwali is Satguru's single highest-revenue week. FY24-25 Diwali week = ₹18.5L. Every SKU should be maximally stocked.",
    message: "CRITICAL: Place all bulk orders by September 20. Diwali preparation is the most important logistics event of FY."
  },
  {
    id: "EVT-7",
    name: "Christmas & New Year",
    date: "2026-12-25",
    type: "promotion",
    tag: "Year-End Rush",
    expectedSurge: "+110%",
    color: "from-green-500 to-cyan-500",
    bgGlow: "bg-green-500",
    suggestions: ["Dell Inspiron Laptop", "HP Pavilion", "Sony Headphones", "JBL Soundbar"],
    insight: "Year-end is driven by corporate gifting + self-gifting culture. Laptops, audio, and smartphones surge 100%+.",
    message: "Corporate bulk orders begin mid-December. Keep laptop and audio inventory high."
  },
];
