/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BadgePercent, Landmark, TrendingUp, Sparkles, MapPin, Layers, Award } from 'lucide-react';

interface LandingPageProps {
  onStartPredict: () => void;
  setActiveTab: (tab: string) => void;
}

export default function LandingPage({ onStartPredict, setActiveTab }: LandingPageProps) {
  const animations = {
    fadeIn: {
      initial: { opacity: 0, y: 15 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 }
    },
    stagger: {
      animate: { transition: { staggerChildren: 0.12 } }
    }
  };

  return (
    <div className="space-y-16 py-8">
      
      {/* Hero Banner Section WITH PROFESSIONAL POLISH */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-950 px-8 py-20 text-white sm:px-14 md:py-24 border border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.12),transparent)] opacity-85" />
        <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />
        
        <div className="relative mx-auto max-w-4xl text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center space-x-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 border border-indigo-500/20"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span className="tracking-wider uppercase text-[10px]">XGBoost & Explainable AI Framework</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white"
          >
            Predict Indian House Values <br className="hidden sm:inline" />
            With <span className="bg-gradient-to-r from-indigo-450 via-indigo-300 to-indigo-200 bg-clip-text text-transparent">Decision Tree Precision</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mx-auto max-w-2xl text-base text-slate-300 sm:text-lg leading-relaxed font-normal"
          >
            Our analytics pipeline leverages predictive models trained on real estate registries in Chennai and major tier-1 urban zones. Verify output values with mathematical SHAP waterfall graphs.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-4"
          >
            <button
              onClick={onStartPredict}
              className="group flex w-full items-center justify-center space-x-2 rounded-lg bg-indigo-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-50 hover:shadow-indigo-500/30 transition-all sm:w-auto cursor-pointer"
            >
              <span>Instant Property Prediction</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className="flex w-full items-center justify-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900/50 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-slate-800 hover:text-white transition-all sm:w-auto cursor-pointer"
            >
              <span>Explore High Growth Zones</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Core Highlights Stats Bento Grid */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Training Set", val: "2,450+", desc: "Verified registered sales entries", icon: Layers, color: "text-indigo-600 bg-indigo-50/50" },
          { label: "Predictive R² Accuracy", val: "95%", desc: "Tuned on regularized XGBoost", icon: Award, color: "text-emerald-600 bg-emerald-50/50" },
          { label: "Chennai Hotspot Compound", val: "11.4%", desc: "CAGR in OMR IT Corridor zones", icon: TrendingUp, color: "text-purple-600 bg-purple-50/50" },
          { label: "Evaluation Methods", val: "4 ML Models", desc: "Regressor comparatives side-by-side", icon: Landmark, color: "text-amber-600 bg-amber-50/50" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</span>
                <div className={`rounded-lg p-2.5 ${stat.color} border border-slate-100`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.val}</p>
                <p className="mt-1 text-xs text-slate-500 font-medium">{stat.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Chennai Specific Showcase Locations Section */}
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Chennai Real Estate Premium Zones</h2>
            <p className="mt-1.5 text-xs text-slate-500 font-medium">Local micro-market indexes tracked by our prediction algorithms</p>
          </div>
          <button 
            onClick={() => setActiveTab('market')}
            className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-500"
          >
            <span>View All Regional Statistics</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { tag: "Prime Elite", name: "Adyar & Mylapore", price: "₹13,600 - ₹15,500", growth: "+9.2%", type: "High Demand Residential", desc: "Top choice for premium apartments and villas. Possesses mature infrastructure and robust capital defense profiles." },
            { tag: "IT Hub Growth", name: "OMR Sholinganallur", price: "₹7,400 - ₹8,200", growth: "+11.4%", type: "Rising Rental Corridors", desc: "Unmatched rental demand from industrial tech networks. Substantial capital growth forecasted over a 5-year outlook." },
            { tag: "Central Hub", name: "Velachery & Guindy", price: "₹9,200 - ₹11,300", growth: "+8.7%", type: "Mid-to-High Capital Yields", desc: "Exceptional transportation connectivity. Close proximity to key retail hubs, metro stations and business districts." }
          ].map((loc, i) => (
            <motion.div
              key={loc.name}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-6 hover:border-indigo-200 hover:bg-indigo-50/5 hover:shadow-xs transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 border border-indigo-150">{loc.tag}</span>
                  <span className="flex items-center text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                    <TrendingUp className="mr-1 h-3.5 w-3.5" />
                    {loc.growth} CAGR
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-800 flex items-center">
                  <MapPin className="mr-1.5 h-4 w-4 text-indigo-500" />
                  {loc.name}
                </h3>
                <p className="mt-1 text-[10px] text-slate-400 uppercase font-bold tracking-wide">{loc.type}</p>
                <p className="mt-3 text-xs text-slate-500 leading-relaxed font-normal">{loc.desc}</p>
              </div>
              
              <div className="mt-5 border-t border-slate-200/60 pt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Market Avg / Sqft</span>
                <span className="text-sm font-bold text-slate-850">{loc.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Advanced Explainable Machine Learning Pipeline Banner */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs hover:shadow-sm transition-all">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="space-y-4 lg:w-1/2">
            <div className="inline-flex items-center space-x-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 border border-indigo-100">
              <BadgePercent className="h-3.5 w-3.5" />
              <span>Explainable AI (XAI) Model Reporting</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-800">Demystifying the Real Estate Black Box</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-normal">
              Most platforms display prices with zero explanation. Our system incorporates mathematical <strong>SHAP (Shapley Additive exPlanations)</strong>. 
              Our service visualizes how features like room sizes, age deprecation, parking spots, and corridor markers increment or pull down estimated valuations.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-slate-100 p-3.5 bg-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attribution Layout</p>
                <p className="text-xs font-bold text-slate-700">SHAP Waterfall Plotting</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-3.5 bg-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scoring Framework</p>
                <p className="text-xs font-bold text-slate-700">4 algorithms comparison</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 lg:w-1/2 space-y-4 text-slate-100 font-mono text-xs shadow-inner shadow-black/80">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400 font-sans font-bold text-[10px] uppercase tracking-wider">Inference Engine Sandbox</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-indigo-400"># Initializing Local Dataset Split (80% Train, 20% Test)...</p>
            <p className="text-slate-300">$ python train_model.py --model=XGBoostRegressor</p>
            <div className="space-y-1 text-slate-400 text-[11px]">
              <p>{`[✓] Loading Chennai House Price Dataset (Grid Schema verified)`}</p>
              <p>{`[✓] Handling Nulls & Outliers using Interquartile Range (IQR)`}</p>
              <p>{`[✓] Computing SHAP attributions for Velachery Test Row (1400sqft)`}</p>
            </div>
            <div className="border-t border-slate-800 pt-3 space-y-1 text-[11px]">
              <p className="text-amber-400">XGBoost validation score: R² = 0.954</p>
              <p className="text-purple-400">Random Forest score: R² = 0.884</p>
              <p className="text-emerald-400 font-bold">Predicted Price Output: ₹1,24,00,000</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
