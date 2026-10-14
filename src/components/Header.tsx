'use client';

import React from 'react';
import { 
  Compass, 
  LayoutDashboard, 
  Receipt, 
  Landmark, 
  Target, 
  TrendingUp, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddTransaction: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddTransaction,
}) => {
  const tabs = [
    { id: 'dashboard', label: '總覽健檢', icon: LayoutDashboard },
    { id: 'cashflow', label: '收支與現金流', icon: Receipt },
    { id: 'networth', label: '資產與淨值', icon: Landmark },
    { id: 'goals', label: '理財目標', icon: Target },
    { id: 'investment', label: '投資配置與複利', icon: TrendingUp },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="p-2 bg-gradient-to-tr from-brand-600 to-emerald-400 rounded-xl text-white shadow-md shadow-brand-500/20">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">WealthPilot</span>
                <span className="text-xs bg-brand-100 text-brand-800 font-semibold px-2 py-0.5 rounded-full border border-brand-200">
                  財富領航
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">個人理財一條龍成長系統</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenAddTransaction}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-brand-600/30 transition-all hover:shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>記一筆</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-medium ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
