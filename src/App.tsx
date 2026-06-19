/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import PredictorPage from './components/PredictorPage';
import DashboardAnalytics from './components/DashboardAnalytics';
import MarketAnalytics from './components/MarketAnalytics';
import UserProfile from './components/UserProfile';
import AdminPanel from './components/AdminPanel';
import AiChatAssistant from './components/AiChatAssistant';
import McaDocumentationHub from './components/McaDocumentationHub';
import { PredictionResult } from './types';
import { Key, Mail, ShieldAlert, Sparkles, X, Heart, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; role: string } | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  
  // Terminal and historical states
  const [savedFavorites, setSavedFavorites] = useState<{ id: string; label: string; details: PredictionResult }[]>([]);
  const [predictionHistory, setPredictionHistory] = useState<PredictionResult[]>([]);

  // Automatically seed generic user on component load for pleasant immediate usability
  useEffect(() => {
    setCurrentUser({
      email: "arunsakthi2802@gmail.com",
      name: "Arun Sakthi",
      role: "admin"
    });
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setIsLoginModalOpen(false);
        setLoginEmail('');
      }
    } catch (err) {
      console.error(err);
      // fallback mock registration in client
      const derivedRole = loginEmail.toLowerCase() === "arunsakthi2802@gmail.com" ? "admin" : "user";
      setCurrentUser({
        email: loginEmail,
        name: loginEmail.split('@')[0],
        role: derivedRole
      });
      setIsLoginModalOpen(false);
      setLoginEmail('');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSavedFavorites([]);
    setActiveTab('landing');
  };

  const handleSaveFavorite = async (label: string, details: PredictionResult) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/user/saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer jwt_mock_token_' + (currentUser?.email || "usr_1")
        },
        body: JSON.stringify({ label, details })
      });
      
      if (res.ok) {
        const data = await res.json();
        setSavedFavorites(prev => [...prev, data.saved]);
      } else {
        throw new Error('Fallback inline save');
      }
    } catch (e) {
      // client-side memory fallback
      const mockFav = {
        id: "fav_" + Math.random().toString(36).substr(2, 9),
        label,
        details
      };
      setSavedFavorites(prev => [...prev, mockFav]);
    }

    // append to terminal session log
    setPredictionHistory(prev => [details, ...prev]);
  };

  const handleRemoveFavorite = async (id: string) => {
    try {
      const res = await fetch(`/api/user/saved/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedFavorites(prev => prev.filter(f => f.id !== id));
      } else {
        throw new Error();
      }
    } catch (err) {
      setSavedFavorites(prev => prev.filter(f => f.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-gray-800 flex flex-col justify-between">
      
      <div className="flex-1">
        {/* Nav Header */}
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          currentUser={currentUser}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          savedCount={savedFavorites.length}
        />

        {/* Outer view limits */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          
          {activeTab === 'landing' && (
            <LandingPage 
              onStartPredict={() => setActiveTab('predictor')} 
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'predictor' && (
            <PredictorPage 
              currentUser={currentUser}
              onSavePrediction={handleSaveFavorite}
              savedPredictions={savedFavorites}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardAnalytics />
          )}

          {activeTab === 'market' && (
            <MarketAnalytics />
          )}

          {activeTab === 'chat' && (
            <AiChatAssistant />
          )}

          {activeTab === 'docs' && (
            <McaDocumentationHub />
          )}

          {activeTab === 'profile' && (
            <UserProfile 
              currentUser={currentUser}
              savedFavorites={savedFavorites}
              onRemoveFavorite={handleRemoveFavorite}
              predictionHistory={predictionHistory}
            />
          )}

          {activeTab === 'admin' && currentUser?.role === 'admin' && (
            <AdminPanel currentUser={currentUser} />
          )}

        </div>
      </div>

      {/* Footer block */}
      <footer className="border-t border-gray-100 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 font-semibold uppercase tracking-wider gap-4">
          <p>© {new Date().getFullYear()} AI-Based House Price Prediction Portal. All rights reserved.</p>
          <div className="flex items-center space-x-1 font-mono text-[10px] text-indigo-500">
            <Sparkles className="h-3.5 w-3.5" />
            <span>XGBoost & Explainable AI Forecasting Engine</span>
          </div>
        </div>
      </footer>

      {/* SECURE SIGN IN OVERLAY MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 relative space-y-6">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-1.5 pt-2">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Key className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-gray-900 text-lg">Platform Sign In</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Sign in with your email to enable Favorites bookmarks, saving reports and accessing ML logs.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-700 uppercase block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. arunsakthi2802@gmail.com"
                    className="w-full text-sm py-2.5 pl-10 pr-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-100"
              >
                Sign In / Authenticate
              </button>
            </form>
            
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-start space-x-2 text-[10px] text-gray-500 leading-relaxed">
              <ShieldCheck className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
              <p>Sign in using email <strong>arunsakthi2802@gmail.com</strong> to gain absolute <strong>Admin</strong> privileges (retraining, CSV uploads, logs audits).</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
