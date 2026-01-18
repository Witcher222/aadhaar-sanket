// Simplified India States GeoJSON
// This is a minimal version for demonstration. For production, use full GeoJSON from:
// https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson

export const indiaStatesGeoJSON = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "id": "IN-UP",
            "properties": {
                "name": "Uttar Pradesh",
                "ST_NM": "Uttar Pradesh",
                "state_code": "UP"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[80.5, 30.5], [85.5, 30.5], [85.5, 24.5], [80.5, 24.5], [80.5, 30.5]]]
            }
        },
        {
            "type": "Feature",
            "id": "IN-MH",
            "properties": {
                "name": "Maharashtra",
                "ST_NM": "Maharashtra",
                "state_code": "MH"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[72.5, 21.5], [80.5, 21.5], [80.5, 15.5], [72.5, 15.5], [72.5, 21.5]]]
            }
        },
        {
            "type": "Feature",
            "id": "IN-KA",
            "properties": {
                "name": "Karnataka",
                "ST_NM": "Karnataka",
                "state_code": "KA"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[74.0, 18.5], [78.5, 18.5], [78.5, 11.5], [74.0, 11.5], [74.0, 18.5]]]
            }
        },
        {
            "type": "Feature",
            "id": "IN-TN",
            "properties": {
                "name": "Tamil Nadu",
                "ST_NM": "Tamil Nadu",
                "state_code": "TN"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[76.5, 13.5], [80.5, 13.5], [80.5, 8.0], [76.5, 8.0], [76.5, 13.5]]]
            }
        },
        {
            "type": "Feature",
            "id": "IN-MP",
            "properties": {
                "name": "Madhya Pradesh",
                "ST_NM": "Madhya Pradesh",
                "state_code": "MP"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[74.0, 26.5], [82.5, 26.5], [82.5, 21.5], [74.0, 21.5], [74.0, 26.5]]]
            }
        },
        {
            "type": "Feature",
            "id": "IN-GJ",
            "properties": {
                "name": "Gujarat",
                "ST_NM": "Gujarat",
                "state_code": "GJ"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[68.0, 24.5], [74.5, 24.5], [74.5, 20.0], [68.0, 20.0], [68.0, 24.5]]]
            }
        },
        {
            "type": "Feature",
            "id": "IN-DL",
            "properties": {
                "name": "Delhi",
                "ST_NM": "Delhi",
                "state_code": "DL"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[76.8, 29.0], [77.5, 29.0], [77.5, 28.4], [76.8, 28.4], [76.8, 29.0]]]
            }
        },
        {
            "type": "Feature",
            "id": "IN-RJ",
            "properties": {
                "name": "Rajasthan",
                "ST_NM": "Rajasthan",
                "state_code": "RJ"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[69.5, 30.5], [78.5, 30.5], [78.5, 23.0], [69.5, 23.0], [69.5, 30.5]]]
            }
        }
    ]
};

// State name variations mapping for data matching
export const stateNameMapping: Record<string, string[]> = {
    "Uttar Pradesh": ["UP", "U.P.", "Uttar Pradesh", "UTTAR PRADESH"],
    "Maharashtra": ["MH", "Maharashtra", "MAHARASHTRA"],
    "Karnataka": ["KA", "Karnataka", "KARNATAKA"],
    "Tamil Nadu": ["TN", "Tamil Nadu", "TAMIL NADU", "TamilNadu"],
    "Madhya Pradesh": ["MP", "M.P.", "Madhya Pradesh", "MADHYA PRADESH"],
    "Gujarat": ["GJ", "Gujarat", "GUJARAT"],
    "Delhi": ["DL", "Delhi", "DELHI", "NCT of Delhi"],
    "Rajasthan": ["RJ", "Rajasthan", "RAJASTHAN"],
};

// Map state code/name from data to GeoJSON ID
export const getStateId = (stateName: string): string | null => {
    const normalized = stateName.trim().toUpperCase();

    for (const [standard, variations] of Object.entries(stateNameMapping)) {
        if (variations.some(v => v.toUpperCase() === normalized)) {
            return `IN-${stateNameMapping[standard][0]}`;
        }
    }

    return null;
};
