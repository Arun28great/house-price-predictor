/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Database, BarChart3, Bot, FileText, User, ShieldAlert, Heart, LogIn, Activity } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: { email: string; name: string; role: string } | null;
  onLoginClick: () => void;
  onLogout: () => void;
  savedCount: number;
}

export default function Header({ activeTab, setActiveTab, currentUser, onLoginClick, onLogout, savedCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
        
        {/* Logo and title matching template branding */}
        <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('landing')}>
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0">
            A
          </div>
          <div>
            <h1 className="text-xs sm:text-sm md:text-base font-black tracking-tight text-slate-800 leading-tight">
              AI-Based <span className="text-indigo-600">House Price Prediction</span>
            </h1>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Indian Real Estate Valuation Suite</p>
          </div>
        </div>

        {/* Global Nav Bar aligned with template look and feel */}
        <nav className="hidden space-x-6 md:flex h-full items-center">
          {[
            { id: 'landing', label: 'Explore', icon: Home },
            { id: 'predictor', label: 'Predict Price', icon: Activity },
            { id: 'dashboard', label: 'Stats Panel', icon: BarChart3 },
            { id: 'market', label: 'Market Hotspots', icon: BarChart3 },
            { id: 'chat', label: 'AI Assistant', icon: Bot },
            { id: 'docs', label: 'Thesis Portal', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-sm font-medium transition-all relative py-4 ${
                  active 
                    ? 'text-indigo-600 font-semibold' 
                    : 'text-slate-500 hover:text-indigo-600'
                }`}
              >
                <span>{tab.label}</span>
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls and User states */}
        <div className="flex items-center space-x-4">
          {currentUser && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`relative flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'profile' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Heart className="h-4 w-4 text-rose-500 fill-rose-500 animate-pulse-slow" />
              <span className="hidden sm:inline">Favorites</span>
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white">
                  {savedCount}
                </span>
              )}
            </button>
          )}

          {currentUser && currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-1 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'admin' ? 'bg-amber-50 text-amber-700' : 'text-amber-700 hover:bg-amber-50/50'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {currentUser ? (
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4 h-full">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-700">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 font-medium">Lead Analyst</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-600">
                {currentUser.name ? currentUser.name[0] : 'U'}
              </div>
              <button
                onClick={onLogout}
                className="rounded-md border border-slate-250 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center space-x-1.5 rounded-md bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
