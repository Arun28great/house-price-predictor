/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Heart, Trash2, Calendar, FileText, Download, Building2, MapPin, Sparkles } from 'lucide-react';
import { PredictionResult } from '../types';

interface UserProfileProps {
  currentUser: { email: string; name: string; role: string } | null;
  savedFavorites: { id: string; label: string; details: PredictionResult }[];
  onRemoveFavorite: (id: string) => void;
  predictionHistory: PredictionResult[];
}

export default function UserProfile({ currentUser, savedFavorites, onRemoveFavorite, predictionHistory }: UserProfileProps) {
  
  const formatLargePrice = (num: number) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(0)} L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const exportSingleCsv = (details: PredictionResult) => {
    const rows = [
      ["Metric", "Value"],
      ["City", details.features.city],
      ["Locality", details.features.locality],
      ["Area", `${details.features.areaSqft} sqft`],
      ["BHK", details.features.bhk],
      ["Bathrooms", details.features.bathrooms],
      ["Parking Slots", details.features.parking],
      ["Build Age", `${details.features.propertyAge} years`],
      ["Type", details.features.propertyType],
      ["Furnishing", details.features.furnishingStatus],
      ["Predicted Price", details.predictedPrice],
      ["Confidence Score", `${details.confidenceScore}%`],
      ["Price Per Sqft", `₹${details.pricePerSqft}`],
      ["Timestamp", details.timestamp]
    ];
    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GharML_Saved_Report_${details.features.locality}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-12 py-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">Personal Intelligence Hub</h2>
          <p className="mt-1.5 text-xs text-slate-500 font-medium">Access saved favorite assets and complete prediction log archives.</p>
        </div>
        {currentUser && (
          <div className="rounded-xl border border-indigo-150 bg-indigo-50/40 p-3 sm:text-right">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Registered Email</p>
            <p className="text-xs font-extrabold text-indigo-700 mt-0.5">{currentUser.email}</p>
          </div>
        )}
      </div>

      {/* SAVED FAVORITES CARDS */}
      <section className="space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wide">
          <Heart className="h-4.5 w-4.5 text-rose-500 fill-rose-500 animate-pulse" />
          Saved Favorite Properties ({savedFavorites.length})
        </h3>

        {savedFavorites.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-slate-250 rounded-xl bg-slate-50 space-y-3">
            <p className="font-bold text-slate-500 text-sm">No favorite properties bookmarks yet.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-semibold">
              When you predict property rates on our Valuer panel, click the 'Save Property' flag bookmark cards to save indices directly to your profile.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedFavorites.map((fav) => (
              <motion.div
                key={fav.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 relative hover:border-indigo-200 hover:shadow-xs transition-shadow duration-300"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-black tracking-widest text-[#555] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      {fav.details.features.propertyType}
                    </span>
                    <h4 className="font-extrabold text-slate-800 text-base mt-2.5 flex items-center">
                      <MapPin className="h-4 w-4 shrink-0 text-indigo-500 mr-1" />
                      {fav.details.features.locality}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-semibold">{fav.details.features.city}</p>
                  </div>
                  <button
                    onClick={() => onRemoveFavorite(fav.id)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50/40 transition-all cursor-pointer"
                    title="Remove Favorite"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase font-black tracking-wider">Area</span>
                    <p className="text-xs font-bold text-slate-800">{fav.details.features.areaSqft} sqft</p>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase font-black tracking-wider">Layout</span>
                    <p className="text-xs font-bold text-slate-800">{fav.details.features.bhk} BHK</p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="block text-[8px] text-slate-450 uppercase font-black tracking-wider">Estimated Price</span>
                    <p className="font-extrabold text-indigo-650 text-base">{formatLargePrice(fav.details.predictedPrice)}</p>
                  </div>
                  <button
                    onClick={() => exportSingleCsv(fav.details)}
                    className="flex items-center space-x-1 border border-slate-250 hover:border-indigo-150 text-[10px] font-bold text-slate-600 hover:text-indigo-650 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer bg-white"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>CSV Report</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* HISTORIC PREDICTIONS LOG */}
      <section className="space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wide">
          <Calendar className="h-4.5 w-4.5 text-indigo-650" />
          Trailing Inference Session Log ({predictionHistory.length})
        </h3>

        {predictionHistory.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/55">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">No inference records on this terminal yet.</p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-250 text-[9px] uppercase font-black tracking-wider text-slate-450 font-sans">
                    <th className="px-4 py-3">Property Location Node</th>
                    <th className="px-4 py-3">Typology Specifications</th>
                    <th className="px-5 py-3 text-right">Confidence scale</th>
                    <th className="px-5 py-3 text-right">Inferred Valuation Price</th>
                    <th className="px-4 py-3 text-center">Action Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {predictionHistory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800 text-xs">{item.features.locality}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{item.features.city}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-bold">
                        {item.features.bhk} BHK {item.features.propertyType} • {item.features.areaSqft} sqft
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-600">
                        {item.confidenceScore}% Acc
                      </td>
                      <td className="px-5 py-3.5 text-right font-extrabold text-slate-800 font-mono">
                        {formatLargePrice(item.predictedPrice)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => exportSingleCsv(item)}
                          className="inline-flex items-center space-x-1 border border-slate-250 p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-150 hover:bg-indigo-50/10 cursor-pointer"
                          title="Download CSV report"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
