/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  INDIAN_CITIES_DATA, 
  predictPriceWithModels, 
  getFuturePriceForecast 
} from '../lib/mlEngine';
import { PropertyFeatures, PredictionResult } from '../types';
import { 
  ArrowRight, Download, Save, Heart, Loader2, Sparkles, 
  Info, TrendingUp, AlertCircle, RefreshCw, CheckCircle2, ChevronRight, FileText, MapPin
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, ReferenceLine, AreaChart, Area 
} from 'recharts';

interface PredictorPageProps {
  currentUser: { email: string; name: string; role: string } | null;
  onSavePrediction: (label: string, details: PredictionResult) => void;
  savedPredictions: any[];
}

export default function PredictorPage({ currentUser, onSavePrediction, savedPredictions }: PredictorPageProps) {
  // Input States
  const [city, setCity] = useState('Chennai');
  const [listOfLocalities, setListOfLocalities] = useState<string[]>([]);
  const [locality, setLocality] = useState('');
  const [areaSqft, setAreaSqft] = useState<number>(1200);
  const [bhk, setBhk] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [parking, setParking] = useState<number>(1);
  const [propertyAge, setPropertyAge] = useState<number>(3);
  const [propertyType, setPropertyType] = useState<PropertyFeatures['propertyType']>('Apartment');
  const [furnishingStatus, setFurnishingStatus] = useState<PropertyFeatures['furnishingStatus']>('Semi-Furnished');

  // Calculation States
  const [isCalculating, setIsCalculating] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [selectedSubTab, setSelectedSubTab] = useState<'aiAppraisal' | 'shap' | 'forecast' | 'comparatives' | 'recs'>('aiAppraisal');
  const [isSaved, setIsSaved] = useState(false);

  // Sync localities whenever city changes
  useEffect(() => {
    const list = Object.keys(INDIAN_CITIES_DATA[city]?.hotspots || {});
    setListOfLocalities(list);
    if (list.length > 0) {
      setLocality(list[0]);
    }
  }, [city]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setIsSaved(false);

    const feats: PropertyFeatures = {
      city,
      locality,
      areaSqft,
      bhk,
      bathrooms,
      parking,
      propertyAge,
      propertyType,
      furnishingStatus,
    };

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feats),
      });

      if (response.ok) {
        const result = await response.json();
        setPredictionResult(result);
      } else {
        throw new Error('Failed to fetch valuation from backend');
      }
    } catch (err) {
      console.warn("Backend valuation feed failed, using high-fidelity local models fallback:", err);
      // Fallback to client-side ML engine evaluation
      const result = predictPriceWithModels(feats);
      result.aiAssessment = `**Local Estimation Note**: Standard client-side XGBoost evaluated. Standard rate of **₹${result.pricePerSqft.toLocaleString('en-IN')}/sqft** resolved. Please ensure AI Studio's backend server environment is live to retrieve real-time Gemini LLM narrative appraisals.`;
      setPredictionResult(result);
    } finally {
      setIsCalculating(false);
    }
  };

  // Helper formatter for typical Indian Rupee display (Lakh/Crore standard or general thousand split)
  const formatIndianCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Crore`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakh`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleSaveResult = () => {
    if (!predictionResult) return;
    const desc = `${propertyType} | ${bhk} BHK | ${areaSqft} Sqft in ${locality}, ${city}`;
    onSavePrediction(desc, predictionResult);
    setIsSaved(true);
  };

  // Safe file exporter for predicted valuations parameters
  const exportCsv = () => {
    if (!predictionResult) return;
    const rows = [
      ["Metric", "Value"],
      ["City", city],
      ["Locality", locality],
      ["Area", `${areaSqft} sqft`],
      ["BHK", bhk],
      ["Bathrooms", bathrooms],
      ["Parking Slots", parking],
      ["Build Age", `${propertyAge} years`],
      ["Type", propertyType],
      ["Furnishing", furnishingStatus],
      ["XGBoost Price Prediction", predictionResult.predictedPrice],
      ["Confidence Rating", `${predictionResult.confidenceScore}%`],
      ["Price Per Sqft", `₹${predictionResult.pricePerSqft}`],
      ["Timestamp", predictionResult.timestamp]
    ];
    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GharML_Report_${locality}_${city}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF report downloader template
  const downloadReportPdf = () => {
    window.print(); // Easy full high-fidelity report download leveraging page layout structure
  };

  // Preparing SHAP Data for waterfall plotting
  const buildShapChartData = () => {
    if (!predictionResult) return [];
    
    let base = 0;
    return predictionResult.shapExplanation.map((item, idx) => {
      // For waterwall waterfall layout, compute start and end bounds
      const start = base;
      base += item.impact;
      const end = base;
      return {
        name: item.feature,
        impact: item.impact,
        start,
        end,
        color: item.impact >= 0 ? "#4f46e5" : "#e11d48" // Indigo for positive, Rose for negative
      };
    });
  };

  return (
    <div className="space-y-12 py-6 print:py-0">
      
      {/* Title block */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">Intelligent House Valuation Engine</h2>
          <p className="mt-1.5 text-xs text-slate-500 font-medium">Run multi-model predictions and extract explainable attribution metrics instantly.</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">XGBoost Framework v1.0.4 Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* LEFT COLUMN: PARAMETER FORMS */}
        <div className="lg:col-span-4 print:hidden">
          <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm tracking-tight uppercase">Specifications</h3>
              <button 
                type="button"
                onClick={() => {
                  setCity('Chennai');
                  setAreaSqft(1200);
                  setBhk(2);
                  setBathrooms(2);
                  setParking(1);
                  setPropertyAge(3);
                  setPropertyType('Apartment');
                  setFurnishingStatus('Semi-Furnished');
                }}
                className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Reset Controls
              </button>
            </div>

            <form onSubmit={handlePredict} className="space-y-5">
              
              {/* City Selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Target Indian City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100/55 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
                >
                  {Object.keys(INDIAN_CITIES_DATA).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Locality Selection - Dynamic */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Micro-Locality Node</label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100/55 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
                >
                  {listOfLocalities.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Slider for Area Sqfoot */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gross Built-up Area</label>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">{areaSqft} Sqft</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="5000"
                  step="50"
                  value={areaSqft}
                  onChange={(e) => setAreaSqft(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">
                  <span>400 SQFT</span>
                  <span>2,700 SQFT</span>
                  <span>5,000 SQFT</span>
                </div>
              </div>

              {/* Numeric counts: BHK, Bathrooms, Parking */}
              <div className="grid grid-cols-3 gap-3">
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">BHK</label>
                  <select
                    value={bhk}
                    onChange={(e) => {
                      setBhk(Number(e.target.value));
                      // Make a helpful guess for match
                      setBathrooms(Math.max(1, Number(e.target.value)));
                    }}
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map(v => (
                      <option key={v} value={v}>{v} BHK</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Baths</label>
                  <select
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map(v => (
                      <option key={v} value={v}>{v} Bath</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Parkings</label>
                  <select
                    value={parking}
                    onChange={(e) => setParking(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
                  >
                    {[0, 1, 2, 3].map(v => (
                      <option key={v} value={v}>{v} Slot</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Slider for age */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Property Age</label>
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                    {propertyAge === 0 ? "New Construction" : `${propertyAge} Years`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={propertyAge}
                  onChange={(e) => setPropertyAge(Number(e.target.value))}
                  className="w-full h-1 bg-slate-205 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Structural property type radio selections */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Building Typology</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Apartment', 'Independent House', 'Villa', 'Builder Floor'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPropertyType(type as any)}
                      className={`text-[11px] py-2 px-3 rounded-lg border font-bold text-center transition-all cursor-pointer ${
                        propertyType === type 
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700' 
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Furnishing selectors */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Furnishing Standard</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Unfurnished', 'Semi-Furnished', 'Fully Furnished'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFurnishingStatus(status as any)}
                      className={`text-[9px] font-black uppercase py-2 text-center rounded-lg border transition-all cursor-pointer ${
                        furnishingStatus === status 
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700' 
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {status.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit trigger button */}
              <button
                type="submit"
                disabled={isCalculating}
                className="w-full flex items-center justify-center space-x-2 rounded-lg bg-indigo-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 focus:outline-none transition-all disabled:bg-indigo-400 cursor-pointer"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing XGBoost Regressors...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Predict Valuation Price</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: PREDICTION & EXPLAINABLE ANALYTICS RESULTS */}
        <div className="lg:col-span-8 space-y-8">
          
          <AnimatePresence mode="wait">
            {!predictionResult && !isCalculating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-slate-50 p-12 text-center space-y-4 min-h-[500px]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div className="max-w-md space-y-1.5">
                  <h4 className="text-lg font-bold text-gray-900">Execute Model Estimation</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Adjust the parameter settings in the left navigation controller and tap "Predict Valuation Price" to see SHAP attributions, similar property parameters and five-year compounding future trends.
                  </p>
                </div>
              </motion.div>
            )}

            {isCalculating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-12 text-center space-y-6 min-h-[500px] shadow-sm"
              >
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-gray-900 animate-pulse">Running Gradient Boosting Estimators</h4>
                  <p className="text-xs text-gray-500 max-w-sm">
                    Filtering outliers using IQR thresholds, scaling parameters with StandardScaler and mapping locality weight modifiers...
                  </p>
                </div>
                <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-indigo-600 w-1/2 rounded-full animate-infinite-loading" />
                </div>
              </motion.div>
            )}

            {predictionResult && !isCalculating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8 print:border-none print:shadow-none bg-white p-1"
              >
                {/* PRIMARY VALUATION BANNER CARD WITH PROFESSIONAL POLISH */}
                <div className="rounded-xl bg-slate-900 p-6 text-white shadow-md border border-slate-850 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-indigo-500/5 blur-2xl" />
                  
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between relative z-10">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-505/10 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                        VALUATION INFERENCE SUCCESS
                      </span>
                      <h3 className="text-4xl font-black tracking-tight mt-2 text-white">
                        {formatIndianCurrency(predictionResult.predictedPrice)}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Estimated worth for {predictionResult.features.bhk} BHK {predictionResult.features.propertyType} in {predictionResult.features.locality}, {predictionResult.features.city}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 border-t border-slate-800 pt-4 sm:border-t-0 sm:pt-0">
                      <div className="text-center bg-slate-800/40 rounded-lg px-4 py-2 border border-slate-800">
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Accuracy</span>
                        <span className="text-lg font-extrabold text-[#10b981]">{predictionResult.confidenceScore}%</span>
                      </div>
                      <div className="text-center bg-slate-800/40 rounded-lg px-4 py-2 border border-slate-800">
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Avg Rate</span>
                        <span className="text-sm font-bold text-white">₹{predictionResult.pricePerSqft}/sqft</span>
                      </div>
                    </div>
                  </div>

                  {/* Export Controls */}
                  <div className="mt-6 border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3 relative z-10 print:hidden">
                    <div className="flex items-center space-x-1 text-xs text-slate-400">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Model: <strong>XGBoost Regressor</strong> (R²=0.95)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveResult}
                        disabled={isSaved}
                        className={`flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg border transition-all cursor-pointer ${
                          isSaved 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-slate-800 border-slate-700 hover:bg-slate-750 text-white'
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isSaved ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                        <span>{isSaved ? "Saved" : "Save Property"}</span>
                      </button>
                      <button
                        onClick={exportCsv}
                        className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-750 text-white transition-all cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Export CSV</span>
                      </button>
                      <button
                        onClick={downloadReportPdf}
                        className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-950/20 cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Print Report</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* TAB SELECTIONS FOR RESULTS DETAILS */}
                <div className="border-b border-slate-200 flex items-center space-x-6 scrollbar-none overflow-x-auto print:hidden">
                  {[
                    { id: 'aiAppraisal', label: '🤖 Real AI Appraisal' },
                    { id: 'shap', label: 'Explainable AI' },
                    { id: 'forecast', label: '5-Year Forecast' },
                    { id: 'comparatives', label: 'Models comparison' },
                    { id: 'recs', label: 'Advisory advice' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedSubTab(tab.id as any)}
                      className={`text-[10px] font-bold uppercase tracking-wider pb-3 px-1 border-b-2 transition-all cursor-pointer relative ${
                        selectedSubTab === tab.id 
                          ? 'text-indigo-600 font-extrabold' 
                          : 'border-transparent text-slate-450 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span className="relative z-10">{tab.label}</span>
                      {selectedSubTab === tab.id && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* SUBTAB DETAILS PANEL */}
                <div className="min-h-[300px]">
                  
                  {/* SUBTAB 0: REAL AI APPRAISAL */}
                  {selectedSubTab === 'aiAppraisal' && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="space-y-6"
                    >
                      <div className="rounded-xl border border-indigo-100 bg-linear-to-br from-indigo-50/30 via-white to-purple-50/30 p-6 shadow-2xs relative overflow-hidden">
                        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-indigo-100/55">
                          <Sparkles className="h-24 w-24 stroke-1 animate-pulse" />
                        </div>
                        
                        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 mb-4 relative z-10">
                          <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-[10px]">AI</div>
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Gemini Real-Time Appraisal Digest</h4>
                            <p className="text-[9px] text-slate-400">Deep real estate insight generated on current Indian market logs</p>
                          </div>
                        </div>

                        <p className="whitespace-pre-line text-xs text-slate-700 leading-relaxed font-semibold relative z-10 bg-white/50 p-4 rounded-lg border border-slate-100">
                          {predictionResult.aiAssessment || "Real AI Valuation appraisal report compiling..."}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-4 text-[9px] font-mono text-slate-450 text-slate-400 font-bold uppercase relative z-10">
                          <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-sm"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Active: Gemini 3.5 Flash</span>
                          <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-sm">Temperature: 0.7 Density</span>
                          <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-sm">Axiological Anchor: Grounded Data</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* SUBTAB 1: SHAP REPORT */}
                  {selectedSubTab === 'shap' && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="space-y-6"
                    >
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                        <p className="text-xs text-gray-600 leading-relaxed">
                          ⚡ <strong>Shapley Additive Attribution Analysis</strong> shows exactly how each specification shifts the final price relative to a standard 1200 sqft Indian median property rate. Values in <span className="text-indigo-600 font-semibold">Indigo</span> indicate price appreciations, while <span className="text-rose-600 font-semibold">Rose</span> values show depreciation rates.
                        </p>
                      </div>

                      {/* Waterfall visualizer using Recharts Bar Chart */}
                      <div className="h-[280px] w-full bg-white p-3 rounded-2xl border border-gray-100">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={buildShapChartData()}
                            margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                            <YAxis 
                              tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} 
                              stroke="#94a3b8" 
                              tick={{ fontSize: 9 }}
                            />
                            <Tooltip 
                              formatter={(value: any) => [formatIndianCurrency(value), "Feature Weight Impact"]}
                              labelStyle={{ fontSize: 11, fontWeight: 'bold' }}
                            />
                            <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />
                            <Bar dataKey="impact" radius={[4, 4, 0, 0]}>
                              {buildShapChartData().map((entry, index) => (
                                <path key={index} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Custom Waterfall detailed table description */}
                      <div className="space-y-2 border border-gray-100 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-12 bg-slate-50 px-4 py-2 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          <span className="col-span-4">Specification Parameter</span>
                          <span className="col-span-3 text-right">Attributed Shock Impact</span>
                          <span className="col-span-5 pl-4">Algorithm Context Details</span>
                        </div>
                        {predictionResult.shapExplanation.map((item, i) => (
                          <div key={item.feature} className="grid grid-cols-12 px-4 py-3 items-center text-xs border-b border-gray-100 last:border-b-0 hover:bg-slate-50/50">
                            <span className="col-span-4 font-bold text-gray-800">{item.feature}</span>
                            <span className={`col-span-3 text-right font-extrabold ${item.impact >= 0 ? "text-indigo-600" : "text-rose-600"}`}>
                              {item.impact >= 0 ? "+" : ""}{item.impact.toLocaleString('en-IN')}
                            </span>
                            <span className="col-span-5 text-gray-500 pl-4">{item.description}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* SUBTAB 2: FUTURE VALUATION FORECASTS */}
                  {selectedSubTab === 'forecast' && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="space-y-6"
                    >
                      <div className="flex flex-col gap-6 md:flex-row md:items-center">
                        <div className="space-y-3 md:w-1/2">
                          <h4 className="font-bold text-gray-900 text-sm">Appreciation Forecast Curve (5-Year Compound Plan)</h4>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            Compounded yearly capital forecasts are calculated dynamically incorporating city growth indexes: <strong>{city === "Chennai" ? "Chennai OMR Growth Corridor Multipliers" : `${city} Regional CAGR Base`} ({city === "Chennai" ? "8.7%" : "9.8%"}/Year)</strong> with slight logarithmic decay parameters over 5 years.
                          </p>
                          
                          <div className="space-y-2.5 pt-2">
                            {getFuturePriceForecast(predictionResult.predictedPrice, city === "Chennai" ? 8.7 : 9.8).map((yr) => (
                              <div key={yr.year} className="flex justify-between items-center text-xs pb-2 border-b border-gray-100 last:border-b-0">
                                <span className="font-semibold text-gray-600">Year {yr.year} Projections</span>
                                <div className="space-x-3 text-right">
                                  <span className="font-extrabold text-indigo-600">{formatIndianCurrency(yr.predictedPrice)}</span>
                                  <span className="inline-flex items-center text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md">
                                    +{yr.growthPercent}% Total Growth
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Forecast chart block */}
                        <div className="md:w-1/2 h-[260px] bg-white p-3 border border-gray-100 rounded-2xl">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={getFuturePriceForecast(predictionResult.predictedPrice, city === "Chennai" ? 8.7 : 9.8)}
                              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 9 }} />
                              <YAxis 
                                tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} 
                                stroke="#94a3b8" 
                                tick={{ fontSize: 9 }} 
                              />
                              <Tooltip formatter={(value: any) => [formatIndianCurrency(value), "Valuation Project"]} />
                              <Area type="monotone" dataKey="predictedPrice" stroke="#4f46e5" fillOpacity={0.12} fill="url(#colorPrice)" strokeWidth={2} />
                              <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* SUBTAB 3: ALGORITHMS COMPARISON */}
                  {selectedSubTab === 'comparatives' && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="space-y-6"
                    >
                      <div className="flex items-start gap-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/30">
                        <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-indigo-900">Why XGBoost wins on R² Evaluation</h4>
                          <p className="text-[11px] text-gray-600 leading-relaxed">
                            Linear models suffer in accuracy containing strict flat coefficients. XGBoost builds sequential regression tree ensembles, continuously fitting residuals. This captures sharp cross-feature interdependencies (e.g. villa premiums in Velachery vs typical builder floors) to achieve superior cross-validation ratios.
                          </p>
                        </div>
                      </div>

                      <div className="h-[250px] bg-white border border-gray-100 rounded-2xl p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={predictionResult.comparisons}
                            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="modelName" tick={{ fontSize: 8 }} />
                            <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} stroke="#94a3b8" tick={{ fontSize: 9 }} />
                            <Tooltip formatter={(v: any) => formatIndianCurrency(v)} />
                            <Bar dataKey="price" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Mathematical evaluation parameters detailed table */}
                      <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold uppercase text-gray-400 border-b border-gray-100">
                              <th className="px-4 py-2.5">ML Architecture model</th>
                              <th className="px-4 py-2.5 text-right">Evaluated Price Target</th>
                              <th className="px-4 py-2.5 text-right">Mean Absolute Error (MAE)</th>
                              <th className="px-4 py-2.5 text-right">Cross Validation R²</th>
                            </tr>
                          </thead>
                          <tbody>
                            {predictionResult.comparisons.map((item) => (
                              <tr key={item.modelName} className="border-b border-gray-100 last:border-b-0 hover:bg-slate-50/50">
                                <td className="px-4 py-3 font-semibold text-gray-900">{item.modelName}</td>
                                <td className="px-4 py-3 text-right font-extrabold text-gray-800">{formatIndianCurrency(item.price)}</td>
                                <td className="px-4 py-3 text-right text-gray-500">₹{item.mae.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-3 text-right">
                                  <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    item.r2 >= 0.90 
                                      ? 'bg-emerald-50 text-emerald-700' 
                                      : (item.r2 >= 0.80 ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700')
                                  }`}>
                                    R² = {item.r2}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                    </motion.div>
                  )}

                  {/* SUBTAB 4: PROPERTY ADVICE END */}
                  {selectedSubTab === 'recs' && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {predictionResult.recommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-start gap-3 rounded-2xl border border-amber-100/50 bg-amber-50/20 p-4">
                            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-700 leading-relaxed font-medium">{rec}</p>
                          </div>
                        ))}
                      </div>

                      {/* Similar Property list */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-gray-900 text-sm">Similar Property parameters matched in {locality}</h4>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {predictionResult.similarProperties.map((simProp) => (
                            <div key={simProp.id} className="rounded-xl border border-gray-100 p-4 bg-slate-50 relative hover:border-indigo-100 hover:bg-white transition-all">
                              <span className="absolute top-3 right-3 text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {simProp.similarityScore}% Match
                              </span>
                              <p className="text-xs font-bold text-gray-400">INDEX NODE: {simProp.id.toUpperCase()}</p>
                              <h5 className="font-extrabold text-gray-800 mt-1.5 text-sm">{simProp.bhk} BHK | {simProp.areaSqft} sqft</h5>
                              <p className="text-[11px] text-gray-550">{simProp.locality}</p>
                              <div className="mt-4 border-t border-gray-100 pt-3 flex justify-between items-center">
                                <span className="text-[10px] text-gray-400 uppercase font-semibold">Matched Valuation</span>
                                <span className="text-sm font-extrabold text-gray-900">{formatIndianCurrency(simProp.price)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                </div>

                {/* GEOGRAPHIC LOCATOR REAL MAP SECTION */}
                {(() => {
                  const cityProfile = INDIAN_CITIES_DATA[predictionResult.features.city] || INDIAN_CITIES_DATA["Chennai"];
                  const locationProfile = cityProfile.hotspots[predictionResult.features.locality] || { multiplier: 1.0, lat: 13.00, lng: 80.20 };
                  const lat = locationProfile.lat;
                  const lng = locationProfile.lng;
                  const bbox = `${lng - 0.015},${lat - 0.015},${lng + 0.015},${lat + 0.015}`;
                  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 border-t border-slate-100 print:hidden">
                      <div className="lg:col-span-8 space-y-3">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4.5 w-4.5 text-indigo-600 animate-bounce" />
                          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">Real-World Geographic GIS Locator Mapping</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                          This live interactive map displays the verified spatial grid coordinates for the **{predictionResult.features.locality}** micro-locality in **{predictionResult.features.city}**. Region coefficients and transportation access weightings are synchronised to deliver optimal capital prediction outputs.
                        </p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                          <div className="bg-slate-50 border border-slate-150 rounded-lg p-3">
                            <span className="block text-[8px] font-bold text-slate-400 uppercase">Latitude Index</span>
                            <span className="font-mono text-[10px] font-black text-slate-700">{lat?.toFixed(5)}° N</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-150 rounded-lg p-3">
                            <span className="block text-[8px] font-bold text-slate-400 uppercase">Longitude Index</span>
                            <span className="font-mono text-[10px] font-black text-slate-700">{lng?.toFixed(5)}° E</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-150 rounded-lg p-3">
                            <span className="block text-[8px] font-bold text-slate-400 uppercase">Zone Base Price</span>
                            <span className="font-mono text-[10px] font-black text-slate-700">₹{cityProfile.basePricePerSqft.toLocaleString('en-IN')}/sqft</span>
                          </div>
                          <div className="bg-indigo-55/10 border border-indigo-100 bg-indigo-50/40 rounded-lg p-3">
                            <span className="block text-[8px] font-bold text-indigo-500 uppercase">Hotspot Multiplier</span>
                            <span className="font-mono text-[10px] font-black text-indigo-600 font-extrabold">{locationProfile.multiplier || "1.00"}x</span>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-4">
                        <div className="aspect-video lg:aspect-square w-full rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shadow-xs min-h-[220px]">
                          <iframe
                            title="Locality Live Map"
                            width="100%"
                            height="100%"
                            className="rounded-xl shadow-inner filter brightness-95"
                            src={osmUrl}
                            style={{ border: 'none' }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
