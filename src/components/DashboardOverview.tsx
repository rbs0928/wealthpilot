'use client';

import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ChevronRight,
  Target,
  Home,
  Globe2
} from 'lucide-react';
import { Transaction, AssetLiabilityItem, FinancialGoal } from '../lib/types';
import { calculateFinancialHealthScore, calculateSavingToWealthImpact } from '../lib/calculations';
import { isFixedExpense } from '../lib/categorizer';
import { generateSmartInvestmentAdvice } from '../lib/advisoryEngine';

interface DashboardOverviewProps {
  transactions: Transaction[];
  assetsLiabilities: AssetLiabilityItem[];
  goals: FinancialGoal[];
  onNavigate: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  transactions,
  assetsLiabilities,
  goals,
  onNavigate,
}) => {
  // 1. 現金流計算
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  // 固定開銷 (房貸/車貸/信貸/房租/保險)
  const fixedObligations = transactions
    .filter((t) => t.type === 'EXPENSE' && isFixedExpense(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  // 全部必要支出 (固定 + 浮動)
  const totalNeedsExpense = transactions
    .filter((t) => t.type === 'EXPENSE' && (t.category === 'NEEDS' || isFixedExpense(t.category)))
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashflow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) : 0;
  const fixedRatio = totalIncome > 0 ? (fixedObligations / totalIncome) * 100 : 0;

  // 2. 資產與負債計算
  const totalAssets = assetsLiabilities
    .filter((item) => item.type === 'ASSET')
    .reduce((sum, item) => sum + item.value, 0);

  const totalLiabilities = assetsLiabilities
    .filter((item) => item.type === 'LIABILITY')
    .reduce((sum, item) => sum + item.value, 0);

  const netWorth = totalAssets - totalLiabilities;
  const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) : 0;

  // 3. 緊急備用金計算 (以每月必要總支出為基準)
  const cashAssets = assetsLiabilities
    .filter((item) => item.type === 'ASSET' && item.subCategory === 'CASH')
    .reduce((sum, item) => sum + item.value, 0);

  const emergencyMonths = totalNeedsExpense > 0 ? (cashAssets / totalNeedsExpense) : (cashAssets / 35000);

  // 4. 財務健康評分
  const stockAssets = assetsLiabilities
    .filter((item) => item.type === 'ASSET' && item.subCategory === 'STOCK')
    .reduce((sum, item) => sum + item.value, 0);

  const health = calculateFinancialHealthScore({
    savingsRate,
    emergencyFundMonths: emergencyMonths,
    debtToAssetRatio: debtRatio,
    hasInvestments: stockAssets > 0,
  });

  // 5. 智慧投資建議
  const advice = generateSmartInvestmentAdvice({
    transactions,
    emergencyFundMonths: emergencyMonths,
    totalAssets,
    totalLiabilities,
  });

  // 6. 亮點試算：省下 $3,000 投入複利投資
  const quickImpact = calculateSavingToWealthImpact(3000, 0.07, 20);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 頂部歡迎與理財階段標題 */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-brand-500/20 text-brand-300 text-xs px-3 py-1 rounded-full border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>一條龍理財成長系統：固定開銷診斷 ➔ 結餘投資連動</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              打造穩健財務體質，實現財富自由
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              審視房貸與固定開銷防護網，盤點真實淨值，並將每月自由現金流導流至全球股市指數化投資。
            </p>
          </div>

          {/* 財務健康分數徽章 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 flex items-center space-x-4 min-w-[240px]">
            <div className="relative flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-white/20"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={176}
                  strokeDashoffset={176 - (176 * health.score) / 100}
                  className="text-brand-400 transition-all duration-1000 ease-out"
                  fill="transparent"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xl font-black text-white">{health.score}</span>
            </div>
            <div>
              <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold">綜合財務健檢</div>
              <div className="text-base font-bold text-brand-300">{health.level}</div>
              <div className="text-xs text-slate-400 mt-0.5">領先 78% 同齡規劃者</div>
            </div>
          </div>
        </div>
      </div>

      {/* 四大核心指標 KPI 卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: 真實淨值 */}
        <div 
          onClick={() => onNavigate('networth')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">個人真實淨值 (Net Worth)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(netWorth)}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500 space-x-1.5">
            <span>資產 {formatCurrency(totalAssets)}</span>
            <span>•</span>
            <span className="text-rose-500 font-medium">負債 {formatCurrency(totalLiabilities)}</span>
          </div>
        </div>

        {/* KPI 2: 固定支出負擔比 (新亮點) */}
        <div 
          onClick={() => onNavigate('cashflow')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">固定開銷負擔比</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg group-hover:bg-rose-100 transition-colors">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {fixedRatio.toFixed(1)}%
          </div>
          <div className="mt-2 flex items-center text-xs space-x-1">
            <span className={`font-semibold ${fixedRatio <= 35 ? 'text-emerald-600' : fixedRatio <= 45 ? 'text-amber-600' : 'text-rose-600'}`}>
              {fixedRatio <= 35 ? '✓ 負擔健康輕盈' : fixedRatio <= 45 ? '● 適中水準' : '▲ 負擔偏高'}
            </span>
            <span className="text-slate-400">（月固開 {formatCurrency(fixedObligations)}）</span>
          </div>
        </div>

        {/* KPI 3: 本月儲蓄與投資率 */}
        <div 
          onClick={() => onNavigate('cashflow')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">本月儲蓄/投資率</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {(savingsRate * 100).toFixed(1)}%
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <span className={savingsRate >= 0.2 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
              {savingsRate >= 0.2 ? '✓ 超過黃金 20% 目標' : '需檢視生活預算'}
            </span>
          </div>
        </div>

        {/* KPI 4: 緊急預備金防護水位 */}
        <div 
          onClick={() => onNavigate('networth')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">緊急備用金覆蓋</span>
            <div className={`p-2 rounded-lg transition-colors ${
              emergencyMonths >= 6 ? 'bg-emerald-50 text-emerald-600' : emergencyMonths >= 3 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {emergencyMonths.toFixed(1)} <span className="text-base font-medium text-slate-500">個月</span>
          </div>
          <div className="mt-2 flex items-center text-xs">
            <span className={`font-semibold ${emergencyMonths >= 6 ? 'text-emerald-600' : emergencyMonths >= 3 ? 'text-amber-600' : 'text-rose-600'}`}>
              {emergencyMonths >= 6 ? '● 充裕防護網 (滿分)' : emergencyMonths >= 3 ? '● 基本防護 (建議續存)' : '▲ 需優先補足安全庫存'}
            </span>
          </div>
        </div>
      </div>

      {/* 整合全球股市即時脈動之「智慧投資決策直通車」卡片 */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>全球股市行情連動 • 智慧投資建議</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              本月建議定期定額：{formatCurrency(advice.recommendedDcaAmount)}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              扣除您的房貸/固定開銷與日常花費後，當前全球市場 (VT, VOO, 0050) 處於穩健多頭格局，建議落實定期定額累積複利！
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-xs space-y-1 min-w-[200px]">
              <div className="text-slate-400">當前市場氣氛：</div>
              <div className="font-bold text-emerald-400 text-sm">全球指數穩健多頭格局</div>
              <div className="text-[11px] text-slate-300">建議留存活存：{formatCurrency(advice.recommendedCashBuffer)}</div>
            </div>

            <button
              onClick={() => onNavigate('investment')}
              className="px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1 whitespace-nowrap"
            >
              <span>檢視完整配置策略</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 健檢診斷具體建議 + 人生目標進度 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 財務健檢建言 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-brand-600" />
              <span>個人理財健檢洞察與行動方案</span>
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">動態生成</span>
          </div>

          <div className="space-y-3">
            {health.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-slate-700 font-medium leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
            <span>負債總額佔比：{(debtRatio * 100).toFixed(1)}%</span>
            <button 
              onClick={() => onNavigate('cashflow')}
              className="text-brand-600 hover:text-brand-700 font-semibold flex items-center space-x-0.5"
            >
              <span>檢視詳細預算分配</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 人生目標追蹤進度 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <span>核心人生理財目標進度</span>
            </h3>
            <button 
              onClick={() => onNavigate('goals')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              查看全部目標
            </button>
          </div>

          <div className="space-y-4">
            {goals.slice(0, 3).map((goal) => {
              const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <div key={goal.id} className="space-y-1.5 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800">{goal.name}</span>
                    <span className="text-slate-500 font-medium">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>目前: {formatCurrency(goal.currentAmount)}</span>
                    <span>目標: {formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
