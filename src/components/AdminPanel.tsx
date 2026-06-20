/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Database, RefreshCw, UploadCloud, ShieldAlert, 
  Trash2, UserCheck, Play, CheckCircle2, AlertTriangle, FileSpreadsheet, Loader2 
} from 'lucide-react';
import { DatasetUploadLog, ModelMetrics } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminPanelProps {
  currentUser: { email: string; name: string; role: string } | null;
}

export default function AdminPanel({ currentUser }: AdminPanelProps) {
  const [logs, setLogs] = useState<DatasetUploadLog[]>([]);
  const [metrics, setMetrics] = useState<ModelMetrics[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);
  
  // Simulated upload parameters
  const [uploadFileName, setUploadFileName] = useState('chennai_ecr_villas.csv');
  const [uploadRowCount, setUploadRowCount] = useState(150);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch logs and metrics
  const fetchAdminData = async () => {
    setIsLoadingLogs(true);
    try {
      const logsRes = await fetch('/api/dataset/logs');
      const metricsRes = await fetch('/api/metrics');
      if (logsRes.ok) setLogs(await logsRes.json());
      if (metricsRes.ok) setMetrics(await metricsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRetrain = async () => {
    setIsRetraining(true);
    setRetrainSuccess(false);
    
    // Smooth simulation delay of fitting weights
    setTimeout(async () => {
      try {
        const res = await fetch('/api/admin/retrain', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics);
          setRetrainSuccess(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsRetraining(false);
      }
    }, 1500);
  };

  const handleSimulateUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    setTimeout(async () => {
      try {
        const res = await fetch('/api/dataset/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: uploadFileName,
            rowCount: uploadRowCount,
            uploaderEmail: currentUser?.email || "shaganasundar9@gmail.com"
          })
        });
        if (res.ok) {
          const data = await res.json();
          // Update local state logs
          setLogs(prev => [data.log, ...prev]);
          // Reset file inputs
          setUploadFileName(`dataset_update_${Math.round(Math.random()*1000)}.csv`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    }, 1200);
  };

  return (
    <div className="space-y-12 py-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-200 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">AI House Price Prediction Admin Hub</h2>
          <p className="mt-1.5 text-xs text-slate-500 font-medium">Coordinate local datasets feed pipelines and retrain model regressors.</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-900 text-slate-100 px-3.5 py-1.5 rounded-lg text-xs font-bold leading-none shadow-xs">
          <ShieldAlert className="h-4 w-4 text-amber-500 animate-pulse" />
          <span className="uppercase tracking-wider text-[10px]">Secured Admin Privileges</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* RETRAIN CONTROL BLOCK */}
        <div className="lg:col-span-5 bg-white p-6 border border-slate-200 rounded-xl shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Model Tuning Operations</h3>
              <p className="text-[10px] text-slate-400">Perform backprop, fitting and residual minimization splits</p>
            </div>
            <button 
              onClick={handleRetrain}
              disabled={isRetraining}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-305 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer transition-colors shadow-2xs"
            >
              {isRetraining ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Fitting Trees...</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 fill-white" />
                  <span>Retrain Model</span>
                </>
              )}
            </button>
          </div>

          {retrainSuccess && (
            <div className="bg-emerald-50 border border-emerald-150 p-3.5 rounded-lg flex items-start space-x-2 text-emerald-800 text-xs shadow-2xs">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <span className="font-black uppercase tracking-wider block text-[10px]">Weights Optimization Concluded</span>
                <p className="mt-0.5 leading-relaxed text-[11px] text-emerald-700 font-medium">All four model variants (LR, Random Forest, GBR, XGBoost) were successfully computed across the newly loaded validation structures. R² scores were compiled and saved.</p>
              </div>
            </div>
          )}

          {/* Metrics scores table */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#555] pb-1">Current active scores matrix</h4>
            <div className="space-y-2">
              {metrics.map((m) => (
                <div key={m.name} className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-800 text-xs">{m.name}</span>
                    <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wide">Status: {m.status} • MAE: ₹{m.mae.toLocaleString('en-IN')}</span>
                  </div>
                  <span className={`font-mono font-black px-2 py-0.5 rounded-md text-[10px] border ${
                    m.r2 >= 0.9 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    R² = {m.r2}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DATASET UPLOAD BLOCK */}
        <div className="lg:col-span-7 bg-white p-6 border border-slate-200 rounded-xl shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Simulate Dataset Core Feeder</h3>
            <p className="text-[10px] text-slate-400">Validate schemas and perform automated data cleansing metrics on CSV blocks</p>
          </div>

          <form onSubmit={handleSimulateUpload} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Simulated CSV Filename</label>
              <input
                type="text"
                required
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
                placeholder="chennai_housing_omr_new.csv"
                className="w-full text-xs rounded-lg border border-slate-200 px-3.5 py-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-medium shadow-2xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Input Rows Count</label>
              <input
                type="number"
                required
                min="10"
                max="5000"
                value={uploadRowCount}
                onChange={(e) => setUploadRowCount(Number(e.target.value))}
                className="w-full text-xs rounded-lg border border-slate-200 px-3.5 py-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-medium shadow-2xs"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                disabled={isUploading}
                className="w-full flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white rounded-lg py-3 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="uppercase tracking-wide">Cleansing duplicate records, null values & outliers (IQR)...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    <span className="uppercase tracking-wide">Run DataLake Pipeline Injection</span>
                  </>
                )}
              </button>
            </div>

          </form>

          {/* IQR Explanation context */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg flex items-start space-x-2 text-slate-500 text-[10px] leading-relaxed shadow-2xs">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="font-semibold">
              <strong>Cleanse Pipeline Settings:</strong> When CSV streams are loaded, the system validates coordinates, drops rows missing pricing attributes, and executes IQR clipping (<code className="font-bold">Lower Bound = Q1 - 1.5*IQR</code>, <code className="font-bold">Upper Bound = Q3 + 1.5*IQR</code>) to prevent volatile listing metrics from corrupting the gradient model weights.
            </p>
          </div>
        </div>

      </div>

      {/* SYSTEM DATASET LOG AUDITS TABLE */}
      <section className="space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wide">
          <FileSpreadsheet className="h-4.5 w-4.5 text-indigo-650" />
          Ingested Datasets Upload Logs Audit Trail
        </h3>

        <div className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-[9px] font-black uppercase tracking-wider text-slate-450 border-b border-slate-250 font-sans">
                  <th className="px-4 py-3">Schema Target Filename</th>
                  <th className="px-4 py-3">Injected By</th>
                  <th className="px-4 py-3">Time Stream</th>
                  <th className="px-4 py-3 text-right">Rows</th>
                  <th className="px-4 py-3 text-right">Duplicates Cut</th>
                  <th className="px-4 py-3 text-right">Nulls Filled</th>
                  <th className="px-4 py-3 text-right">Outliers (IQR)</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/55 transition-colors font-semibold text-xs">
                    <td className="px-4 py-3.5 text-slate-800 font-bold">{log.fileName}</td>
                    <td className="px-4 py-3.5 text-slate-500 font-medium">{log.uploadedBy}</td>
                    <td className="px-4 py-3.5 text-slate-400 font-medium">{new Date(log.uploadedAt).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-800">{log.rowCount}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-500 font-medium font-bold">-{log.removedDuplicates}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-500 font-medium font-bold">+{log.nullValuesFilled}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-rose-600 font-bold">{log.outliersDetected} outliers</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-55/10 border border-emerald-55/20 px-2.5 py-0.5 rounded-md">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
}
