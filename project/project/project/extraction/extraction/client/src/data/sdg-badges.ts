export interface SDGBadge {
  id: string;
  badgeNumber: number;
  name: string;
  description: string;
  iconUrl: string;
  color: string;
  relevantToWaterPollution: boolean; // Helper to highlight most relevant SDGs
}

// All 17 UN Sustainable Development Goals
export const mockSdgBadges: SDGBadge[] = [
  {
    id: "sdg-1",
    badgeNumber: 1,
    name: "No Poverty",
    description: "End poverty in all its forms everywhere",
    iconUrl: "/sdg-icons/sdg-1.svg",
    color: "#E5243B",
    relevantToWaterPollution: true, // Poor water quality affects poverty
  },
  {
    id: "sdg-2",
    badgeNumber: 2,
    name: "Zero Hunger",
    description: "End hunger, achieve food security and improved nutrition and promote sustainable agriculture",
    iconUrl: "/sdg-icons/sdg-2.svg",
    color: "#DDA63A",
    relevantToWaterPollution: true, // Water pollution affects agriculture
  },
  {
    id: "sdg-3",
    badgeNumber: 3,
    name: "Good Health and Well-being",
    description: "Ensure healthy lives and promote well-being for all at all ages",
    iconUrl: "/sdg-icons/sdg-3.svg",
    color: "#4C9F38",
    relevantToWaterPollution: true, // Most directly related - polluted water causes health issues
  },
  {
    id: "sdg-4",
    badgeNumber: 4,
    name: "Quality Education",
    description: "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all",
    iconUrl: "/sdg-icons/sdg-4.svg",
    color: "#C5192D",
    relevantToWaterPollution: false,
  },
  {
    id: "sdg-5",
    badgeNumber: 5,
    name: "Gender Equality",
    description: "Achieve gender equality and empower all women and girls",
    iconUrl: "/sdg-icons/sdg-5.svg",
    color: "#FF3A21",
    relevantToWaterPollution: true, // Women often bear burden of water collection and health impacts
  },
  {
    id: "sdg-6",
    badgeNumber: 6,
    name: "Clean Water and Sanitation",
    description: "Ensure availability and sustainable management of water and sanitation for all",
    iconUrl: "/sdg-icons/sdg-6.svg",
    color: "#26BDE2",
    relevantToWaterPollution: true, // Most directly related to water pollution monitoring
  },
  {
    id: "sdg-7",
    badgeNumber: 7,
    name: "Affordable and Clean Energy",
    description: "Ensure access to affordable, reliable, sustainable and modern energy for all",
    iconUrl: "/sdg-icons/sdg-7.svg",
    color: "#FCC30B",
    relevantToWaterPollution: false,
  },
  {
    id: "sdg-8",
    badgeNumber: 8,
    name: "Decent Work and Economic Growth",
    description: "Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all",
    iconUrl: "/sdg-icons/sdg-8.svg",
    color: "#A21942",
    relevantToWaterPollution: true, // Industrial activities affect water quality
  },
  {
    id: "sdg-9",
    badgeNumber: 9,
    name: "Industry, Innovation and Infrastructure",
    description: "Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation",
    iconUrl: "/sdg-icons/sdg-9.svg",
    color: "#FD6925",
    relevantToWaterPollution: true, // Industrial infrastructure affects water pollution
  },
  {
    id: "sdg-10",
    badgeNumber: 10,
    name: "Reduced Inequalities",
    description: "Reduce inequality within and among countries",
    iconUrl: "/sdg-icons/sdg-10.svg",
    color: "#DD1367",
    relevantToWaterPollution: true, // Water pollution disproportionately affects vulnerable populations
  },
  {
    id: "sdg-11",
    badgeNumber: 11,
    name: "Sustainable Cities and Communities",
    description: "Make cities and human settlements inclusive, safe, resilient and sustainable",
    iconUrl: "/sdg-icons/sdg-11.svg",
    color: "#FD9D24",
    relevantToWaterPollution: true, // Urban water management is crucial
  },
  {
    id: "sdg-12",
    badgeNumber: 12,
    name: "Responsible Consumption and Production",
    description: "Ensure sustainable consumption and production patterns",
    iconUrl: "/sdg-icons/sdg-12.svg",
    color: "#BF8B2E",
    relevantToWaterPollution: true, // Production processes affect water quality
  },
  {
    id: "sdg-13",
    badgeNumber: 13,
    name: "Climate Action",
    description: "Take urgent action to combat climate change and its impacts",
    iconUrl: "/sdg-icons/sdg-13.svg",
    color: "#3F7E44",
    relevantToWaterPollution: true, // Climate change affects water quality and availability
  },
  {
    id: "sdg-14",
    badgeNumber: 14,
    name: "Life Below Water",
    description: "Conserve and sustainably use the oceans, seas and marine resources for sustainable development",
    iconUrl: "/sdg-icons/sdg-14.svg",
    color: "#0A97D9",
    relevantToWaterPollution: true, // Marine pollution is directly related
  },
  {
    id: "sdg-15",
    badgeNumber: 15,
    name: "Life on Land",
    description: "Protect, restore and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, and halt and reverse land degradation and halt biodiversity loss",
    iconUrl: "/sdg-icons/sdg-15.svg",
    color: "#56C02B",
    relevantToWaterPollution: true, // Terrestrial water systems affect land ecosystems
  },
  {
    id: "sdg-16",
    badgeNumber: 16,
    name: "Peace, Justice and Strong Institutions",
    description: "Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels",
    iconUrl: "/sdg-icons/sdg-16.svg",
    color: "#00689D",
    relevantToWaterPollution: false,
  },
  {
    id: "sdg-17",
    badgeNumber: 17,
    name: "Partnerships for the Goals",
    description: "Strengthen the means of implementation and revitalize the global partnership for sustainable development",
    iconUrl: "/sdg-icons/sdg-17.svg",
    color: "#19486A",
    relevantToWaterPollution: true, // Collaborative monitoring and action needed
  },
];

// Helper function to get most relevant SDGs for water pollution
export const getWaterRelevantSDGs = (): SDGBadge[] => {
  return mockSdgBadges.filter(badge => badge.relevantToWaterPollution);
};

// Helper function to get SDG by number
export const getSDGByNumber = (badgeNumber: number): SDGBadge | undefined => {
  return mockSdgBadges.find(badge => badge.badgeNumber === badgeNumber);
};

// Helper function to get SDG by ID
export const getSDGById = (id: string): SDGBadge | undefined => {
  return mockSdgBadges.find(badge => badge.id === id);
};

// Mock data for sample-SDG badge assignments
export interface SampleSDGAssignment {
  id: string;
  sampleId: string;
  badgeId: string;
  assignedBy: string;
  assignedAt: Date;
  notes?: string;
}

export const mockSampleSDGAssignments: SampleSDGAssignment[] = [
  {
    id: "assignment-1",
    sampleId: "sample-chennai-1",
    badgeId: "sdg-6",
    assignedBy: "admin-mock-id",
    assignedAt: new Date(),
    notes: "Water quality monitoring directly relates to clean water access",
  },
  {
    id: "assignment-2",
    sampleId: "sample-chennai-1",
    badgeId: "sdg-3",
    assignedBy: "admin-mock-id",
    assignedAt: new Date(),
    notes: "Contaminated water poses health risks to local population",
  },
  {
    id: "assignment-3",
    sampleId: "sample-mumbai-1",
    badgeId: "sdg-6",
    assignedBy: "admin-mock-id",
    assignedAt: new Date(),
    notes: "Industrial pollution affecting water sanitation",
  },
  {
    id: "assignment-4",
    sampleId: "sample-mumbai-1",
    badgeId: "sdg-9",
    assignedBy: "admin-mock-id",
    assignedAt: new Date(),
    notes: "Industrial infrastructure impact on water quality",
  },
  {
    id: "assignment-5",
    sampleId: "sample-delhi-1",
    badgeId: "sdg-11",
    assignedBy: "admin-mock-id",
    assignedAt: new Date(),
    notes: "Urban water management challenges in sustainable cities",
  },
];