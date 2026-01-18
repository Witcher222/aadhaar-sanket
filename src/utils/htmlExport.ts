import { saveAs } from 'file-saver';

export const generateInteractiveHTMLReport = (data: {
    title: string;
    summary: string;
    metrics: any[];
    tableData: any[];
    chartData?: any; // Plotly data
}) => {
    // 1. Construct the HTML content as a string
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title} - Interactive Report</title>
    <!-- Tailwind CSS (via CDN) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Plotly.js (via CDN) -->
    <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
    <!-- Mapbox GL JS (Optional/Simulated for offline) or Leaflet -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
        .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); margin-bottom: 24px; }
        .metric-value { font-size: 2rem; font-weight: 700; color: #0f172a; }
        .metric-label { color: #64748b; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
        #map { height: 500px; width: 100%; border-radius: 12px; }
    </style>
</head>
<body class="p-8 max-w-7xl mx-auto">

    <!-- Header -->
    <div class="mb-10 text-center">
        <h1 class="text-4xl font-bold text-slate-900 mb-2">${data.title}</h1>
        <p class="text-slate-500">Generated on ${new Date().toLocaleDateString()}</p>
        <div class="mt-4 inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            Interactive Analysis
        </div>
    </div>

    <!-- Executive Summary -->
    <div class="card border-l-4 border-blue-500">
        <h2 class="text-xl font-bold mb-4 text-slate-800">Executive Summary (AI Generated)</h2>
        <p class="text-slate-700 leading-relaxed text-lg">${data.summary}</p>
    </div>

    <!-- Key Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        ${data.metrics.map(metric => `
            <div class="card flex flex-col justify-center items-center text-center">
                <span class="metric-label">${Object.keys(metric)[0]}</span>
                <span class="metric-value">${Object.values(metric)[0]}</span>
            </div>
        `).join('')}
    </div>

    <!-- Geo-Spatial Map Layer -->
    <div class="card">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-slate-800">Geo-Spatial Intelligence Layer</h2>
            <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" id="toggle-stress" checked class="form-checkbox text-red-500 h-5 w-5">
                    <span class="text-sm font-medium">Stress Hotspots</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" id="toggle-flow" class="form-checkbox text-blue-500 h-5 w-5">
                    <span class="text-sm font-medium">Migration Flows</span>
                </label>
            </div>
        </div>
        <div id="map"></div>
    </div>

    <!-- Interactive Data Table -->
    <div class="card">
         <h2 class="text-xl font-bold mb-4 text-slate-800">Detailed District Data</h2>
         <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-slate-600">
                <thead class="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        ${Object.keys(data.tableData[0] || {}).map(k => `<th class="px-6 py-3">${k}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.tableData.map((row, i) => `
                        <tr class="bg-white border-b hover:bg-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}">
                            ${Object.values(row).map(val => `<td class="px-6 py-4 font-medium">${val}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
         </div>
    </div>

    <script>
        // --- 1. Map Initialization (Leaflet) ---
        const map = L.map('map').setView([20.5937, 78.9629], 5); // India Center

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }).addTo(map);

        // Dummy Layers
        const stressMarkers = [];
        const flowLines = [];

        // Add some dummy stress zones
        const hotspots = [
            { lat: 28.7041, lng: 77.1025, name: "Delhi Connect", color: "red" },
            { lat: 19.0760, lng: 72.8777, name: "Mumbai Central", color: "orange" },
            { lat: 12.9716, lng: 77.5946, name: "Bangalore Tech", color: "red" }
        ];

        hotspots.forEach(pt => {
             const circle = L.circleMarker([pt.lat, pt.lng], {
                color: pt.color,
                fillColor: pt.color,
                fillOpacity: 0.5,
                radius: 15
            }).bindPopup("<b>" + pt.name + "</b><br>Stress Level: Critical");
            stressMarkers.push(circle);
            circle.addTo(map);
        });

        // Add dummy flows (hidden by default)
        const flows = [
             [[25.5941, 85.1376], [30.7333, 76.7794]], // Bihar -> Chandigarh
             [[26.8467, 80.9462], [19.0760, 72.8777]]  // UP -> Mumbai
        ];
        
        flows.forEach(line => {
             const poly = L.polyline(line, {color: 'blue', weight: 3, opacity: 0.6, dashArray: '10, 10'});
             flowLines.push(poly);
             // Don't add to map initially
        });


        // --- 2. Interactive Logic ---
        document.getElementById('toggle-stress').addEventListener('change', (e) => {
            if (e.target.checked) {
                stressMarkers.forEach(m => m.addTo(map));
            } else {
                stressMarkers.forEach(m => m.remove());
            }
        });

        document.getElementById('toggle-flow').addEventListener('change', (e) => {
            if (e.target.checked) {
                flowLines.forEach(l => l.addTo(map));
            } else {
                flowLines.forEach(l => l.remove());
            }
        });

        // --- 3. Plotly Charts (if data provided) ---
        // (Can be implemented here if chartData allows)

    </script>
</body>
</html>
    `;

    // 2. Create Blob and Download
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    saveAs(blob, `${data.title.replace(/\s+/g, '_')}_Interactive.html`);
};
