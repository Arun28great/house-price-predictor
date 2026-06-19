/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, TrendingUp, Sparkles, Building2, HelpCircle, 
  ArrowUpRight, Award, Compass, Map, Layers 
} from 'lucide-react';

interface ZoneProfile {
  name: string;
  x: number; // SVG mapping coordinates
  y: number;
  rate: number;
  growth: number;
  demand: 'Extreme' | 'High' | 'Moderate';
  suitability: string;
  premiumWeight: number;
  lat: number;
  lng: number;
}

export default function MarketAnalytics() {
  const [selectedZone, setSelectedZone] = useState<string>('Velachery');
  const [mapMode, setMapMode] = useState<'leaflet' | 'vector'>('leaflet');
  const mapRef = useRef<HTMLIFrameElement>(null);

  const chennaiZones: Record<string, ZoneProfile> = {
    "Anna Nagar": { name: "Anna Nagar", x: 120, y: 100, rate: 14500, growth: 9.8, demand: "Extreme", suitability: "Luxury Families", premiumWeight: 1.7, lat: 13.0850, lng: 80.2101 },
    "T. Nagar": { name: "T. Nagar", x: 200, y: 140, rate: 16100, growth: 10.4, demand: "Extreme", suitability: "Ultra High Net-Worth", premiumWeight: 1.9, lat: 13.0418, lng: 80.2337 },
    "Adyar": { name: "Adyar", x: 260, y: 190, rate: 13600, growth: 9.2, demand: "High", suitability: "Hedge Investors", premiumWeight: 1.6, lat: 13.0033, lng: 80.2550 },
    "Velachery": { name: "Velachery", x: 170, y: 220, rate: 9350, growth: 9.5, demand: "High", suitability: "Tech Professionals", premiumWeight: 1.1, lat: 12.9801, lng: 80.2228 },
    "OMR Sholinganallur": { name: "OMR Sholinganallur", x: 210, y: 310, rate: 7650, growth: 11.4, demand: "Extreme", suitability: "IT Landlords / Rental", premiumWeight: 0.9, lat: 12.9010, lng: 80.2272 },
    "Madipakkam": { name: "Madipakkam", x: 130, y: 260, rate: 6800, growth: 8.4, demand: "Moderate", suitability: "Value Seekers", premiumWeight: 0.8, lat: 12.9622, lng: 80.1986 },
    "Tambaram": { name: "Tambaram", x: 60, y: 340, rate: 5500, growth: 7.9, demand: "Moderate", suitability: "Suburban Commuters", premiumWeight: 0.65, lat: 12.9224, lng: 80.1215 },
    "Porur": { name: "Porur", x: 70, y: 160, rate: 7220, growth: 8.7, demand: "High", suitability: "Mid-scale Commuters", premiumWeight: 0.85, lat: 13.0382, lng: 80.1565 },
    "Thiruvanmiyur": { name: "Thiruvanmiyur", x: 280, y: 235, rate: 12750, growth: 9.0, demand: "High", suitability: "Coastal Investors", premiumWeight: 1.5, lat: 12.9830, lng: 80.2594 },
    "Guindy": { name: "Guindy", x: 155, y: 175, rate: 11050, growth: 9.1, demand: "High", suitability: "Business Professionals", premiumWeight: 1.3, lat: 13.0067, lng: 80.2206 }
  };

  const activeProfile = chennaiZones[selectedZone] || chennaiZones['Velachery'];

  // 1) Listen to map communications (Click events in Leaflet iframe)
  useEffect(() => {
    const handleMapMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ZONE_SELECTED') {
        setSelectedZone(event.data.zoneName);
      }
    };
    window.addEventListener('message', handleMapMessage);
    return () => window.removeEventListener('message', handleMapMessage);
  }, []);

  // 2) Synchronize React external selection to the Leaflet Map
  useEffect(() => {
    if (mapMode === 'leaflet' && mapRef.current?.contentWindow) {
      const frame = mapRef.current;
      const sendSelection = () => {
        frame.contentWindow?.postMessage({ type: 'SELECT_ZONE', zoneName: selectedZone }, '*');
      };
      
      sendSelection();
      
      const handleLoad = () => {
        setTimeout(sendSelection, 300);
      };
      frame.addEventListener('load', handleLoad);
      return () => {
        frame.removeEventListener('load', handleLoad);
      };
    }
  }, [selectedZone, mapMode]);

  const getLeafletSrcDoc = () => {
    const zonesJson = JSON.stringify(chennaiZones);
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
  <style>
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
    }
    .custom-tooltip {
      background: rgba(15, 23, 42, 0.95) !important;
      color: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      border-radius: 8px !important;
      font-weight: 600;
      font-size: 11px;
      padding: 6px 10px !important;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
    }
    .leaflet-tooltip-top:before {
      border-top-color: rgba(15, 23, 42, 0.95) !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script>
    const zones = ${zonesJson};
    
    // Initialize map centering around central Chennai
    const map = L.map('map', {
      center: [13.00, 80.22],
      zoom: 11.5,
      zoomControl: true,
      attributionControl: false
    });

    // Clean, minimalistic CartoDB theme tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    const mapCircles = {};
    const mapMarkers = {};

    // Render geographic representation circles & center pin nodes
    Object.keys(zones).forEach(key => {
      const zone = zones[key];
      const isExtreme = zone.demand === 'Extreme';
      const isHigh = zone.demand === 'High';
      
      const themeColor = isExtreme ? '#ef4444' : (isHigh ? '#6366f1' : '#f59e0b');

      // Region Circle representing spatial price footprint
      const circle = L.circle([zone.lat, zone.lng], {
        color: themeColor,
        fillColor: themeColor,
        fillOpacity: 0.18,
        weight: 1.5,
        radius: Math.max(700, zone.rate / 6)
      }).addTo(map);

      // Core Anchor Node Marker
      const anchorMarker = L.circleMarker([zone.lat, zone.lng], {
        color: '#ffffff',
        fillColor: themeColor,
        fillOpacity: 0.95,
        weight: 2,
        radius: 7
      }).addTo(map);

      // Stylized Tooltip 
      const tooltipHTML = '<div style="line-height: 1.4;">' +
        '<div style="font-size: 12px; font-weight: 800; color: #f8fafc; margin-bottom: 2px;">' + zone.name + '</div>' +
        '<div style="color: #cbd5e1; font-size: 10px;">Valuation Rate: <b style="color: #ffffff;">₹' + zone.rate.toLocaleString("en-IN") + '/sqft</b></div>' +
        '<div style="color: #cbd5e1; font-size: 10px;">Yearly Growth: <b style="color: #10b981;">+' + zone.growth + '% / yr</b></div>' +
        '<div style="color: #cbd5e1; font-size: 10px;">Market Demand: <b style="color: ' + (isExtreme ? '#f43f5e' : (isHigh ? '#818cf8' : '#fbbf24')) + ';">' + zone.demand + '</b></div>' +
      '</div>';

      circle.bindTooltip(tooltipHTML, {
        className: 'custom-tooltip',
        direction: 'top',
        sticky: true,
        offset: [0, -10]
      });

      anchorMarker.bindTooltip(tooltipHTML, {
        className: 'custom-tooltip',
        direction: 'top',
        sticky: true,
        offset: [0, -10]
      });

      mapCircles[key] = circle;
      mapMarkers[key] = anchorMarker;

      const triggerSelection = () => {
        window.parent.postMessage({ type: 'ZONE_SELECTED', zoneName: key }, '*');
        
        // Dynamic ripple effect styling changes in real-time
        circle.setStyle({ fillOpacity: 0.4, weight: 3 });
        setTimeout(() => {
          circle.setStyle({ fillOpacity: 0.18, weight: 1.5 });
        }, 1200);
      };

      circle.on('click', triggerSelection);
      anchorMarker.on('click', triggerSelection);
    });

    // Receive selected coordinate instructions from React parent
    window.addEventListener('message', event => {
      if (event.data && event.data.type === 'SELECT_ZONE') {
        const zoneName = event.data.zoneName;
        const matched = zones[zoneName];
        if (matched) {
          map.flyTo([matched.lat, matched.lng], 13.5, {
            animate: true,
            duration: 1.2
          });
          
          // Animate targeted hotspot circle to create highlight flow
          const selectedCircle = mapCircles[zoneName];
          if (selectedCircle) {
            selectedCircle.setStyle({ fillOpacity: 0.4, weight: 3 });
            setTimeout(() => {
              selectedCircle.setStyle({ fillOpacity: 0.18, weight: 1.5 });
            }, 1500);
          }
        }
      }
    });
  </script>
</body>
</html>
`;
  };

  return (
    <div className="space-y-12 py-6">
      
      {/* Introduction Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">Chennai Micro-Market Hotspots</h2>
          <p className="mt-1.5 text-xs text-slate-500 font-medium">Interactive spatial analysis plotting GIS location hotspots and micro-indicators across Chennai.</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-lg text-xs font-bold text-indigo-700 flex items-center gap-1.5 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-500" />
          <span className="uppercase tracking-wider text-[10px]">Macro Yield Engine Calibrated</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* INTERACTIVE GEOSPATIAL MAP PORTAL */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Compass className="h-4.5 w-4.5 text-indigo-600 animate-spin-slow" />
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">
                  Spatial Hotspot GIS Locator
                </h3>
              </div>
              <p className="text-[10px] text-slate-400">Click elements on the map or select a quick zone in the panel to inspect</p>
            </div>
            
            {/* Map Mode Buttons */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto shadow-sm">
              <button
                onClick={() => setMapMode('leaflet')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all duration-200 ${
                  mapMode === 'leaflet'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Map className="h-3 w-3" />
                <span>Leaflet Live</span>
              </button>
              <button
                onClick={() => setMapMode('vector')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all duration-200 ${
                  mapMode === 'vector'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="h-3 w-3" />
                <span>Vector Grid</span>
              </button>
            </div>
          </div>

          {/* RENDERING WRAPPER */}
          {mapMode === 'leaflet' ? (
            <div className="relative aspect-video w-full rounded-xl bg-slate-50 border border-slate-200 overflow-hidden min-h-[385px] shadow-inner">
              <iframe
                ref={mapRef}
                title="Chennai Live Hotspots Leaflet Map"
                srcDoc={getLeafletSrcDoc()}
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          ) : (
            <div className="relative aspect-video w-full rounded-xl bg-gradient-to-tr from-slate-900 via-neutral-900 to-indigo-950 overflow-hidden min-h-[385px]">
              {/* Grid overlay */}
              <div className="absolute inset-0 bg-grid-pattern opacity-10" />
              
              {/* Bay Of Bengal decoration */}
              <div className="absolute top-1/2 right-4 -translate-y-1/2 text-right opacity-30 select-none">
                <p className="font-mono text-[9px] font-bold text-cyan-300 uppercase tracking-[0.3em]">BAY OF BENGAL</p>
                <p className="font-mono text-[7px] text-cyan-400 mt-1">Slight coastal trade coordinates</p>
              </div>

              {/* SVG Elements */}
              <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
                {/* OMR IT Corridor link line */}
                <line x1="260" y1="190" x2="210" y2="310" stroke="#4f46e5" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
                <line x1="170" y1="220" x2="210" y2="310" stroke="#4f46e5" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />

                {/* Coastal Highway line */}
                <path d="M 260,190 Q 280,250 240,350" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.4" />

                {/* Coordinates indicators */}
                <text x="15" y="385" fill="#475569" fontSize="8" fontFamily="monospace">GRID REGION: CHENNAI_METRO_V2</text>

                {/* Clickable hotspot nodes */}
                {Object.entries(chennaiZones).map(([key, zone]) => {
                  const isActive = selectedZone === key;
                  return (
                    <g 
                      key={key} 
                      className="cursor-pointer group"
                      onClick={() => setSelectedZone(key)}
                    >
                      {/* Ring Pulse */}
                      {isActive && (
                        <circle 
                          cx={zone.x} 
                          cy={zone.y} 
                          r="14" 
                          fill="none" 
                          stroke="#4f46e5" 
                          strokeWidth="1.5"
                          className="animate-ping-slow"
                        />
                      )}
                      
                      {/* Inner anchor dot */}
                      <circle 
                        cx={zone.x} 
                        cy={zone.y} 
                        r={isActive ? "7" : "5"} 
                        fill={isActive ? "#4f46e5" : "#64748b"} 
                        stroke="#ffffff" 
                        strokeWidth="1.5"
                        className="transition-all duration-300 group-hover:fill-indigo-400 group-hover:scale-125"
                      />

                      {/* text flag tags */}
                      <text 
                        x={zone.x + 10} 
                        y={zone.y + 4} 
                        fill={isActive ? "#ef4444" : "#cbd5e1"} 
                        fontSize="9" 
                        fontWeight={isActive ? "bold" : "600"}
                        fontFamily="Arial, sans-serif"
                        className="select-none transition-all duration-200 group-hover:fill-white"
                      >
                        {zone.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {/* Quick Hotspot Links list */}
          <div className="flex flex-wrap gap-2 pt-2">
            {Object.keys(chennaiZones).map((zoneName) => {
              const isSelected = selectedZone === zoneName;
              return (
                <button
                  key={zoneName}
                  onClick={() => setSelectedZone(zoneName)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-xs font-bold' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-250/30'
                  }`}
                >
                  {zoneName}
                </button>
              );
            })}
          </div>

        </div>

        {/* PROFILE SPECIFIC ANALYTICS CARD */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-xs min-h-[400px]">
          
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
                <h3 className="font-extrabold text-slate-800 text-lg leading-tight">{activeProfile.name}</h3>
              </div>
              <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${
                activeProfile.demand === 'Extreme' 
                  ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                  : (activeProfile.demand === 'High' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700')
              }`}>
                {activeProfile.demand} Liquidity
              </span>
            </div>

            {/* Price list parameters */}
            <div className="space-y-4">
              
              <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-200/50">
                <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">Avg Transaction Price</span>
                <span className="font-extrabold text-lg text-slate-800">₹{activeProfile.rate.toLocaleString('en-IN')}/sqft</span>
              </div>

              <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-200/50">
                <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">Yearly Growth Target</span>
                <span className="font-extrabold text-[#10b981] flex items-center">
                  <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
                  +{activeProfile.growth}% / Yr
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-200/50">
                <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">Macro Buyer Match</span>
                <span className="font-bold text-slate-700 text-right max-w-[180px] truncate">{activeProfile.suitability}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wide text-[10px]">Multiplier Weighting</span>
                <span className="font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">{activeProfile.premiumWeight}x benchmark</span>
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start space-x-2.5">
              <Award className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Investment Strategy Recommendation</span>
                <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                  {activeProfile.premiumWeight >= 1.5 
                    ? `Premium Core investment profiles. Low risk, exceptional residential appreciation curves due to heavy transport infrastructure and primary city access.`
                    : `IT corridor high-yield nodes. Rental multipliers are extremely active with short occupancy turnovers. Ideal for secondary rental income assets.`
                  }
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-1 font-bold uppercase">
              <span>LATITUDE: {activeProfile.lat.toFixed(4)}° N</span>
              <span>LONGITUDE: {activeProfile.lng.toFixed(4)}° E</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
