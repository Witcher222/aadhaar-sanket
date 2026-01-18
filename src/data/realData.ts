// Data is now sourced dynamically from the API.
// However, we provide this comprehensive fallback data to prevent UI crashes 
// when the API is unreachable or during development previews.

export const years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];

// Migration Flows
export const migrationFlows = [
    { source: "Bihar", target: "Delhi", value: 125000, growth: "+12%" },
    { source: "Uttar Pradesh", target: "Maharashtra", value: 98000, growth: "+8%" },
    { source: "Odisha", target: "Gujarat", value: 45000, growth: "+15%" },
    { source: "West Bengal", target: "Karnataka", value: 42000, growth: "+6%" },
    { source: "Rajasthan", target: "Gujarat", value: 38000, growth: "+5%" },
    { source: "Madhya Pradesh", target: "Delhi", value: 35000, growth: "+9%" },
    { source: "Jharkhand", target: "Maharashtra", value: 32000, growth: "+10%" },
    { source: "Bihar", target: "Punjab", value: 28000, growth: "-2%" },
    { source: "Uttarakhand", target: "Delhi", value: 25000, growth: "+4%" },
    { source: "Kerala", target: "UAE (proxy)", value: 22000, growth: "+3%" }, // Symbolic international
    { source: "Tamil Nadu", target: "Karnataka", value: 18000, growth: "+7%" },
    { source: "Andhra Pradesh", target: "Telangana", value: 15000, growth: "+1%" }
];

// Helper Lists
export const sourceStates = Array.from(new Set(migrationFlows.map(f => f.source))).sort();
export const destStates = Array.from(new Set(migrationFlows.map(f => f.target))).sort();

export const jobSectors = [
    "Construction", "Manufacturing", "Textiles", "IT & Services", "Agriculture", "Domestic Work", "Healthcare"
];

export const demographicGroups = ["All", "Age 0-5", "Age 5-17", "Age 18-30", "Age 30-60", "Age 60+"];

// State-wise Enrolment Mock
export const stateWiseEnrolment = sourceStates.map(state => ({
    state,
    enrolment: Math.floor(Math.random() * 5000000) + 1000000,
    total: Math.floor(Math.random() * 5000000) + 1000000, // Added total
    saturation: Math.floor(Math.random() * 20) + 80, // 80-100%
    trend: Math.random() > 0.5 ? 'up' : 'down'
}));

// Add destination states to valid enrolment list if missing
destStates.forEach(state => {
    if (!stateWiseEnrolment.find(s => s.state === state)) {
        stateWiseEnrolment.push({
            state,
            enrolment: Math.floor(Math.random() * 10000000) + 5000000,
            total: Math.floor(Math.random() * 10000000) + 5000000, // Added total
            saturation: Math.floor(Math.random() * 10) + 90,
            trend: 'up'
        });
    }
});

// Other placeholders to prevent crashes
export const demographicUpdates = [];
export const biometricUpdates = [];
export const districtWiseData = [];
export const dailyTrends = [
    { date: '2025-01-01', enrolments: 120, biometric: 45, demographic: 30 },
    { date: '2025-01-02', enrolments: 132, biometric: 50, demographic: 35 },
    { date: '2025-01-03', enrolments: 101, biometric: 40, demographic: 25 },
    { date: '2025-01-04', enrolments: 134, biometric: 55, demographic: 40 },
    { date: '2025-01-05', enrolments: 90, biometric: 35, demographic: 20 },
    { date: '2025-01-06', enrolments: 230, biometric: 80, demographic: 60 },
    { date: '2025-01-07', enrolments: 210, biometric: 75, demographic: 55 }
];

export const trendData = {
    seasonality: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, value2025: Math.random() * 100, value2024: Math.random() * 100 })),
    persistence: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, value2025: Math.random() * 100, value2024: Math.random() * 100 })),
    acceleration: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, value2025: Math.random() * 100, value2024: Math.random() * 100 })),
};

export const nationalStats = {
    totalEnrolments: 1420000000,
    totalBiometric: 1250000000,
    totalDemographic: 1380000000,
    activeMigrations: 15000000,
    migrationVelocity: 'High',
    dataFreshness: 'Live',
    lastUpdated: new Date().toISOString(),
};

export const anomalyData = [
    { id: 1, location: "Delhi", severity: "High", description: "Unexpected inflow spike from Bihar" },
    { id: 2, location: "Mumbai", severity: "Medium", description: "Dormant account activation surge" }
];

export const stressZones = [
    { id: 1, name: "Central Delhi", severity: "severe", pressure: 92, enrolments: 4500000, population: "12.5M", growthRate: "+4.2%" },
    { id: 2, name: "Thane", severity: "high", pressure: 85, enrolments: 3200000, population: "8.2M", growthRate: "+3.8%" },
    { id: 3, name: "Surat East", severity: "high", pressure: 78, enrolments: 2800000, population: "6.4M", growthRate: "+5.1%" },
    { id: 4, name: "Bengaluru South", severity: "moderate", pressure: 65, enrolments: 2100000, population: "4.8M", growthRate: "+2.9%" },
    { id: 5, name: "Pune Core", severity: "moderate", pressure: 58, enrolments: 1800000, population: "3.2M", growthRate: "+1.5%" }
];

export const forecastAlerts = [
    { id: 1, title: "Seasonal Surge Alert", region: "Delhi-NCR", probability: 92, level: "critical", date: "2025-03-15", description: "Predicted 15% increase in seasonal migration from Bihar and UP." },
    { id: 2, title: "Resource Strain Warning", region: "Mumbai Metropolitan", probability: 78, level: "warning", date: "2025-03-20", description: "High biometric update volume projected in suburban railway hubs." },
    { id: 3, title: "Enrollment Anomaly", region: "Bengaluru South", probability: 45, level: "info", date: "2025-04-01", description: "Unusual density of new enrollments detected in tech corridors." }
];

export const forecastProjection = [
    { month: 'Mar', actual: 4200000, projected: 4100000, upper: 4300000, lower: 3900000 },
    { month: 'Apr', actual: 4800000, projected: 4900000, upper: 5100000, lower: 4700000 },
    { month: 'May', projected: 5200000, upper: 5500000, lower: 4900000 },
    { month: 'Jun', projected: 5800000, upper: 6200000, lower: 5400000 }
];

export const policyRecommendations = [
    { id: 1, title: "Mobile Unit Reallocation", category: "Infrastructure", urgency: "critical", budget: "₹12 Cr", impact: "High", dataSource: "Spatial Stress Map v4.1", description: "Deploy 5 additional mobile units to Surat East corridor based on predicted surge." },
    { id: 2, title: "Secondary School Expansion", category: "Education", urgency: "high", budget: "₹45 Cr", impact: "Medium", dataSource: "Child Population Forecast", description: "Expand capacity in 12 schools in Thane industrial belt to accommodate migrant children." },
    { id: 3, title: "Health Center Synchronization", category: "Healthcare", urgency: "medium", budget: "₹18 Cr", impact: "High", dataSource: "Migration Flow Analysis", description: "Sync satellite health clinics with central Aadhaar health records for transient population." }
];

export const heatmapData = [];
export const dataQualityMetrics = {
    integrityScore: 94,
    anomalyRate: 2.1,
    completeness: 98,
    timeliness: 95,
    accuracy: 99,
    totalRecords: {
        biometric: 1250000000,
        demographic: 1380000000,
        enrolment: 1420000000
    }
};

export const dataLineage = [];
export const aiSuggestedQueries = [
    "Identify blocks with >20% growth in biometric updates",
    "Compare migration trends between 2024 and 2025 peak periods",
    "Predict saturation points for urban corridors"
];

export const liveTicker = [
    "Live: Bihar to Delhi migration up 12% today",
    "Alert: High biometric update volume in Mumbai West",
    "Update: National enrolment saturation reached 94.2%"
];
