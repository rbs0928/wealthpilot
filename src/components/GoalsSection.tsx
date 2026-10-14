'use client';

import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Flame, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Trash2,
  Sparkles,
  Home,
  Shield,
  Plane
} from 'lucide-react';
import { FinancialGoal } from '../lib/types';
import { calculateFireTarget } from '../lib/calculations';

interface GoalsSectionProps {
  goals: FinancialGoal[];
  onAddGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  onDeleteGoal: (id: string) => void;
  annualExpense: number;
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({
  goals,
  onAddGoal,
  onDeleteGoal,
  annualExpense,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2030-12-31');
  const [category, setCategory] = useState<FinancialGoal['category']>('HOUSE_DOWNPAYMENT');
  const [priority, setPriority] = useState<FinancialGoal['priority']>('HIGH');

  // FIRE 計算器
  const [customAnnualExpense, setCustomAnnualExpense] = useState<number>(
    annualExpense > 0 ? annualExpense : 600000
  );
  const fireNumber = calculateFireTarget(customAnnualExpense, 0.04);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    onAddGoal({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
      targetDate,
      category,
      priority,
    });

    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setShowAddModal(false);
  };

  const getCategoryIcon = (cat: FinancialGoal['category']) => {
    switch (cat) {
      case 'EMERGENCY_FUND':
        return <Shield className="w-5 h-5 text-emerald-600" />;
      case 'HOUSE_DOWNPAYMENT':
        return <Home className="w-5 h-5 text-indigo-600" />;
      case 'RETIREMENT_FIRE':
        return <Flame className="w-5 h-5 text-orange-500" />;
      case 'TRAVEL':
        return <Plane className="w-5 h-5 text-sky-500" />;
      default:
        return <Target className="w-5 h-5 text-brand-600" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 頂部標題 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Target className="w-6 h-6 text-indigo-600" />
            <span>人生財務目標與 FIRE 退休規劃</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            理財不是為了數字，而是為了實現人生自由。設定清晰目標，動態計算儲蓄與投資缺口。
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>設定新目標</span>
        </button>
      </div>

      {/* FIRE 4% 法則模擬器專區 */}
      <div className="bg-gradient-to-r from-orange-950 via-amber-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 bg-orange-500/20 text-orange-300 text-xs px-3 py-1 rounded-full border border-orange-500/30 font-semibold">
              <Flame className="w-4 h-4" />
              <span>FIRE (Financial Independence, Retire Early) 4% 法則</span>
            </div>
            <h3 className="text-2xl font-extrabold text-white">
              您的財務自由提早退休數字：{formatCurrency(fireNumber)}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              根據三一學院研究 (Trinity Study)，只要累積足夠本金投入全球指數資產，每年領取 4% 本金作為生活開銷，高機率歷經 30 年以上本金依然花不完！
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/15 min-w-[280px] space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              設定退休後預計年度總開銷：
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="50000"
                value={customAnnualExpense}
                onChange={(e) => setCustomAnnualExpense(Math.max(100000, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-white/20 text-white font-bold rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
              />
              <span className="text-xs text-slate-300 whitespace-nowrap">元 / 年</span>
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-white/10">
              相當於每月生活費：{formatCurrency(customAnnualExpense / 12)}
            </div>
          </div>
        </div>
      </div>

      {/* 目標清單 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          // 計算剩餘月份
          const targetD = new Date(goal.targetDate);
          const now = new Date();
          const monthsLeft = Math.max(1, (targetD.getFullYear() - now.getFullYear()) * 12 + (targetD.getMonth() - now.getMonth()));
          const suggestedMonthlySaving = Math.round(remaining / monthsLeft);

          return (
            <div key={goal.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    {getCategoryIcon(goal.category)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      goal.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {goal.priority === 'HIGH' ? '高優先級' : '中優先級'}
                    </span>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-base">{goal.name}</h4>
                  <div className="flex items-center text-xs text-slate-400 mt-1 space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>預計達成：{goal.targetDate}（剩餘 {monthsLeft} 個月）</span>
                  </div>
                </div>

                {/* 進度條 */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">達成進度</span>
                    <span className="text-indigo-600 font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div 
                      style={{ width: `${pct}%` }} 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        pct >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 pt-0.5">
                    <span>已累積: {formatCurrency(goal.currentAmount)}</span>
                    <span className="font-bold text-slate-800">目標: {formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>
              </div>

              {/* 建議儲蓄配額 */}
              <div className="pt-3 border-t border-slate-100 bg-slate-50/60 -mx-6 -mb-6 p-4 rounded-b-2xl">
                <div className="text-xs text-slate-500 flex justify-between items-center">
                  <span>每月建議投入儲蓄額：</span>
                  <span className="font-bold text-indigo-700 text-sm">{formatCurrency(suggestedMonthlySaving)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 新增目標 Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-slate-900">設定人生新財務目標</h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">目標名稱</label>
                <input
                  type="text"
                  placeholder="例如：成家結婚基金 / 子女教育基金"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">目標類別</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="HOUSE_DOWNPAYMENT">購屋成家頭期款</option>
                  <option value="EMERGENCY_FUND">緊急預備金</option>
                  <option value="RETIREMENT_FIRE">FIRE 提早退休</option>
                  <option value="TRAVEL">環球旅遊</option>
                  <option value="EDUCATION">進修與子女教育</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">目標金額 (TWD)</label>
                  <input
                    type="number"
                    placeholder="1000000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">目前已儲蓄 (TWD)</label>
                  <input
                    type="number"
                    placeholder="200000"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">預計達成日期</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  確認建立
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
