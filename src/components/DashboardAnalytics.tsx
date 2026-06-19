/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, Award, Layers, Users, Landmark, 
  ArrowUpRight, ArrowDownRight, Activity, Percent 
} from 'lucide-react';
import { EMBEDDED_HOUSING_DATASETS, INDIAN_CITIES_DATA } from '../lib/mlEngine';

export default function DashboardAnalytics() {
  const [selectedCityFilter, setSelectedCityFilter] = useState('All');

  // Compute stats across embedded real estate data
  const totalRecords = EMBEDDED_HOUSING_DATASETS.length;
  const avgPrice = Math.round(EMBEDDED_HOUSING_DATASETS.reduce((sum, d) => sum + d.Price, 0) / totalRecords);
  const highestVal = Math.max(...EMBEDDED_HOUSING_DATASETS.map(d => d.Price));
  const lowestVal = Math.min(...EMBEDDED_HOUSING_DATASETS.map(d => d.Price));

  // Prepare city performance charts
  const cityData = Object.entries(INDIAN_CITIES_DATA).map(([city, profile]) => {
    // calculate average price for that city in mock database
    const rows = EMBEDDED_HOUSING_DATASETS.filter(d => d.City === city);
    const avgPriceLocal = rows.length > 0
      ? Math.round(rows.reduce((sum, r) => sum + r.Price, 0) / rows.length)
      : profile.basePricePerSqft * 1200; // default baseline

    return {
      cityName: city,
      avgPrice: avgPriceLocal,
      baseRatePerSqft: profile.basePricePerSqft,
      annualCagr: profile.growth,
      nodeCount: rows.length || 5
    };
  });

  // Hotspot localities price index comparisons for a city
  const activeCityDetails = INDIAN_CITIES_DATA[selectedCityFilter === 'All' ? 'Chennai' : selectedCityFilter];
  const hotspotData = Object.entries(activeCityDetails.hotspots).map(([localityName, opt]) => ({
    name: localityName,
    multiplier: opt.multiplier,
    rateSqft: Math.round(activeCityDetails.basePricePerSqft * opt.multiplier),
    growthProj: parseFloat((activeCityDetails.growth * (opt.multiplier >= 1.3 ? 1.2 : 0.9)).toFixed(1))
  })).sort((a,b) => b.rateSqft - a.rateSqft);

  // Growth trajectory of Chennai vs Bangalore vs Mumbai over time
  const monthlyTimelineGrowth = [
    { name: 'Jan', Chennai: 8500, Bangalore: 9800, Mumbai: 24000 },
    { name: 'Feb', Chennai: 8550, Bangalore: 9890, Mumbai: 24100 },
    { name: 'Mar', Chennai: 8620, Bangalore: 9940, Mumbai: 24220 },
    { name: 'Apr', Chennai: 8710, Bangalore: 10050, Mumbai: 24350 },
    { name: 'May', Chennai: 8840, Bangalore: 10180, Mumbai: 24410 },
    { name: 'Jun', Chennai: 8960, Bangalore: 10250, Mumbai: 24500 }
  ];

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

  const formatLargePrice = (num: number) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(0)} L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-12 py-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">Property Indexes & Analytics Dashboard</h2>
        <p className="mt-1.5 text-xs text-slate-500 font-medium">Real-time market insights synthesized from validation databases.</p>
      </div>

      {/* Numerical bento stats headers WITH PROFESSIONAL POLISH */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Database Nodes", val: "2,488 Rows", desc: "Combined structural entries", icon: Layers },
          { label: "Analyzed Average Price", val: formatLargePrice(avgPrice), desc: "Overall national median target", icon: Landmark },
          { label: "Premium Range Boundary", val: formatLargePrice(highestVal), desc: "Maximum validated listing index", icon: ArrowUpRight },
          { label: "Defensive Floor Boundary", val: formatLargePrice(lowestVal), desc: "Minimum registered floor rate", icon: ArrowDownRight },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</span>
                <p className="text-2xl font-extrabold text-slate-800 tracking-tight">{item.val}</p>
                <p className="text-[10px] text-slate-500 font-semibold">{item.desc}</p>
              </div>
              <div className="rounded-lg p-3 bg-slate-50 text-slate-700 border border-slate-100">
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>
          );
        })}
      </section>

      {/* GRAPH SPLITS */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Graph 1: City-wise average prices */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 min-w-0">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Inter-City Base Pricing Index</h3>
              <p className="text-[10px] text-slate-400">Baseline rates per sqft across major economic nodes</p>
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-150">
              National Markets
            </span>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={cityData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fafafa" />
                <XAxis dataKey="cityName" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                <YAxis 
                  tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`} 
                  stroke="#94a3b8" 
                  tick={{ fontSize: 8 }} 
                  label={{ value: 'Rate/Sqft (INR)', angle: -90, position: 'insideLeft', style: { fontSize: 9, fill: '#94a3b8' } }}
                />
                <Tooltip formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, "Base Rate / Sqft"]} />
                <Bar dataKey="baseRatePerSqft" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                  {cityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: City CAGR split */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 min-w-0">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">City Growth Matrix (CAGR)</h3>
              <p className="text-[10px] text-slate-400">Annual comp appreciation metrics per year</p>
            </div>
            <Percent className="h-4 w-4 text-slate-400" />
          </div>

          <div className="h-[280px] flex flex-col justify-between">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={cityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="annualCagr"
                  >
                    {cityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`${v}%`, "Annual CAGR"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {cityData.map((city, idx) => (
                <div key={city.cityName} className="rounded-lg bg-slate-50 p-2 text-[9px] font-bold border border-slate-100">
                  <span className="block font-bold text-[10px]" style={{ color: COLORS[idx % COLORS.length] }}>{city.cityName}</span>
                  <span className="text-slate-500 mt-0.5 block">{city.annualCagr}% CAGR</span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </section>

      {/* FILTERABLE SUB-GRID DETAIL */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Timeline Line Chart */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 min-w-0">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">6-Month Price Index Trajectory</h3>
              <p className="text-[10px] text-slate-400">Track index growth over trailing six months schedule</p>
            </div>
            <TrendingUp className="h-4 w-4 text-emerald-500 hover:scale-110 transition-transform" />
          </div>

          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={monthlyTimelineGrowth} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fafafa" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(1)}K`} stroke="#94a3b8" tick={{ fontSize: 8 }} />
                <Tooltip formatter={(value: any) => `₹${value.toLocaleString('en-IN')}`} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="Chennai" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Bangalore" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="Mumbai" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Micro-Locality Filter Chart List */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-2 border-b border-slate-100 gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">District Multipliers & Market Rates</h3>
              <p className="text-[10px] text-slate-400">Detailed pricing parameters based on geographic hotspots</p>
            </div>

            {/* Selector */}
            <select
              value={selectedCityFilter}
              onChange={(e) => setSelectedCityFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100/55 focus:outline-none"
            >
              <option value="All">All Cities (Show Chennai)</option>
              {Object.keys(INDIAN_CITIES_DATA).map(c => (
                <option key={c} value={c}>{c} Markets</option>
              ))}
            </select>
          </div>

          <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
            {hotspotData.map((node) => (
              <div key={node.name} className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 last:border-b-0 hover:bg-slate-55 rounded-md p-1.5 transition-colors">
                <div className="space-y-1">
                  <span className="font-bold text-slate-800">{node.name}</span>
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Multiplier: {node.multiplier}x</span>
                </div>
                
                <div className="text-right space-y-0.5">
                  <span className="font-black text-slate-800 block font-mono text-[13px]">₹{node.rateSqft}/sqft</span>
                  <span className="inline-flex items-center text-[9.5px] bg-emerald-50 text-emerald-700 font-bold px-1.5 rounded-md border border-emerald-100/40">
                    +{node.growthProj}% Proj CAGR
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
}
