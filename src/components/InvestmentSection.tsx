'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  Sliders, 
  Sparkles, 
  ShieldAlert, 
  Info, 
  Coffee, 
  Award,
  Zap,
  BarChart3,
  CheckCircle2,
  Globe2
} from 'lucide-react';
import { calculateDCAProjection, calculateSavingToWealthImpact } from '../lib/calculations';
import { RiskProfile, Transaction } from '../lib/types';
import { MarketAdvisoryWidget } from './MarketAdvisoryWidget';
import { generateSmartInvestmentAdvice } from '../lib/advisoryEngine';

interface InvestmentSectionProps {
  monthlyCashflowSurplus: number;
  transactions: Transaction[];
  emergencyFundMonths: number;
  totalAssets: number;
  totalLiabilities: number;
}

export const InvestmentSection: React.FC<InvestmentSectionProps> = ({
  monthlyCashflowSurplus,
  transactions,
  emergencyFundMonths,
  totalAssets,
  totalLiabilities,
}) => {
  // 1. 產生個人化智慧投資建議 (結合收支、固定負擔與全球即時市場)
  const advice = generateSmartInvestmentAdvice({
    transactions,
    emergencyFundMonths,
    totalAssets,
    totalLiabilities,
  });

  // 2. 定期定額複利模擬參數
  const [initialAmount, setInitialAmount] = useState<number>(100000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(
    advice.recommendedDcaAmount > 0 ? advice.recommendedDcaAmount : 20000
  );
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(0.07); // 7%
  const [investmentYears, setInvestmentYears] = useState<number>(20);

  // 3. 風險模型選擇
  const [selectedProfile, setSelectedProfile] = useState<RiskProfile>('MODERATE');

  // 4. 節流轉投資快速模擬金額
  const [savingExperiment, setSavingExperiment] = useState<number>(3000);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);
  };

  // 計算定期定額複利預測數列
  const projectionData = calculateDCAProjection(
    initialAmount,
    monthlyContribution,
    expectedReturnRate,
    investmentYears
  );

  const finalProjection = projectionData[projectionData.length - 1] || {
    totalContributed: 0,
    futureValue: 0,
    interestEarned: 0,
  };

  const wealthMultiplier = finalProjection.totalContributed > 0
    ? (finalProjection.futureValue / finalProjection.totalContributed).toFixed(2)
    : '1.0';

  // 節流轉投資效應
  const savingImpact = calculateSavingToWealthImpact(savingExperiment, 0.07, 20);

  // 經典投資組合配置建議
  const portfolios = {
    CONSERVATIVE: {
      name: '穩健保本型 (Conservative)',
      description: '注重資產防守與抗波動，適合接近退休或固定開銷壓力較大的投資人。',
      allocation: [
        { label: '全球債券 (BND/BNDX)', pct: 60, color: 'bg-blue-500' },
        { label: '全球股票 (VT)', pct: 30, color: 'bg-emerald-500' },
        { label: '高利現金儲蓄', pct: 10, color: 'bg-amber-500' },
      ],
      expectedReturn: '4% ~ 5%',
    },
    MODERATE: {
      name: '經典平衡型 (Moderate 60/40)',
      description: '歷經百年考驗的股債平衡經典組合，兼顧資本增長與下檔保護。',
      allocation: [
        { label: '全球股票 (VT / 0050)', pct: 60, color: 'bg-emerald-500' },
        { label: '綜合公債 (BND / TLT)', pct: 30, color: 'bg-blue-500' },
        { label: '現金與多元抗通膨', pct: 10, color: 'bg-amber-500' },
      ],
      expectedReturn: '6% ~ 8%',
    },
    AGGRESSIVE: {
      name: '積極成長型 (Aggressive 80/20)',
      description: '追求長線最大化複利成長，適合距離退休 15 年以上且現金流穩健的投資人。',
      allocation: [
        { label: '全球股票 (VT / VTI)', pct: 70, color: 'bg-emerald-500' },
        { label: '高成長市場 (0050 / QQQ)', pct: 20, color: 'bg-purple-500' },
        { label: '避險債券與現金', pct: 10, color: 'bg-blue-500' },
      ],
      expectedReturn: '8% ~ 10%',
    },
  };

  const currentPortfolio = portfolios[selectedProfile];

  return (
    <div className="space-y-8 pb-12">
      {/* 頂部標題 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-brand-600" />
            <span>全球市場脈動與智慧投資建議</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            透過即時全球市場行情結合個人收支模式，將生活節流無縫轉化為全球指數化複利資產。
          </p>
        </div>
      </div>

      {/* 核心整合：全球股市即時脈動與個人化智慧投資建議卡 */}
      <MarketAdvisoryWidget advice={advice} />

      {/* 核心模擬器：定期定額複利成長 */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>定期定額 (DCA) 複利增長動態試算</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              已帶入智慧建議之月投入額，您亦可自由滑動調整參數，看見未來的複利威力
            </p>
          </div>
          {/* 結算亮點 */}
          <div className="text-right">
            <div className="text-xs text-slate-400">預估 {investmentYears} 年後資產終值</div>
            <div className="text-2xl sm:text-3xl font-black text-brand-600 tracking-tight">
              {formatCurrency(finalProjection.futureValue)}
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-0.5">
              淨賺複利利息：+{formatCurrency(finalProjection.interestEarned)} ({wealthMultiplier}倍翻轉)
            </div>
          </div>
        </div>

        {/* 參數控制列 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
          {/* 每月投入 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>每月定期定額</span>
              <span className="text-brand-600 font-bold">{formatCurrency(monthlyContribution)}</span>
            </div>
            <input
              type="range"
              min="2000"
              max="100000"
              step="1000"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(parseInt(e.target.value))}
              className="w-full accent-brand-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>$2,000</span>
              <span>$50,000</span>
              <span>$100,000</span>
            </div>
          </div>

          {/* 預期年化報酬率 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>預期年化報酬率</span>
              <span className="text-brand-600 font-bold">{(expectedReturnRate * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.03"
              max="0.12"
              step="0.005"
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(parseFloat(e.target.value))}
              className="w-full accent-brand-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>3% (保守債券)</span>
              <span>7% (全球股票平均)</span>
              <span>12%</span>
            </div>
          </div>

          {/* 投資年期 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>投資年期 (時間複利)</span>
              <span className="text-brand-600 font-bold">{investmentYears} 年</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="1"
              value={investmentYears}
              onChange={(e) => setInvestmentYears(parseInt(e.target.value))}
              className="w-full accent-brand-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>5 年</span>
              <span>20 年</span>
              <span>40 年</span>
            </div>
          </div>

          {/* 初始單筆本金 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>現有初始本金</span>
              <span className="text-brand-600 font-bold">{formatCurrency(initialAmount)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000000"
              step="50000"
              value={initialAmount}
              onChange={(e) => setInitialAmount(parseInt(e.target.value))}
              className="w-full accent-brand-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>$0</span>
              <span>$1,000,000</span>
              <span>$2,000,000</span>
            </div>
          </div>
        </div>

        {/* 視覺化複利長條階梯圖 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-slate-400 inline-block" />
                <span>自行投入總本金</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                <span>時間複利孳生收益</span>
              </span>
            </div>
            <span className="text-slate-400">每 5 年關鍵里程碑節點</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {projectionData
              .filter((d) => d.year % Math.max(1, Math.floor(investmentYears / 4)) === 0 || d.year === investmentYears)
              .slice(0, 4)
              .map((d) => {
                const total = d.futureValue;
                const principalPct = total > 0 ? (d.totalContributed / total) * 100 : 100;
                const interestPct = 100 - principalPct;

                return (
                  <div key={d.year} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">第 {d.year} 年</span>
                      <span className="text-emerald-700 font-black text-sm">{formatCurrency(d.futureValue)}</span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-lg h-3 overflow-hidden flex">
                      <div style={{ width: `${principalPct}%` }} className="bg-slate-400" />
                      <div style={{ width: `${interestPct}%` }} className="bg-emerald-500" />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>本金: {formatCurrency(d.totalContributed)}</span>
                      <span className="text-emerald-600 font-semibold">+{formatCurrency(d.interestEarned)}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* 一條龍連動核心：日常節流 -> 長期複利效益計算機 */}
      <div className="bg-gradient-to-br from-brand-900 via-emerald-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-500/30 font-semibold">
              <Coffee className="w-3.5 h-3.5" />
              <span>拿鐵效應：日常省流轉投資放大器</span>
            </div>
            <h3 className="text-2xl font-black text-white leading-snug">
              「省下的不是零錢，而是你未來的財富自由基金」
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              很多人誤以為記帳節流只省了幾千元沒有感覺，但如果將這筆開銷導入 7% 報酬率的指數化投資，時間會將它放大數倍！
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>每月開銷省流金額實驗：</span>
                <span className="font-extrabold text-emerald-400 text-base">{formatCurrency(savingExperiment)}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="20000"
                step="500"
                value={savingExperiment}
                onChange={(e) => setSavingExperiment(parseInt(e.target.value))}
                className="w-full accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>$1,000 (省下幾杯外食飲料)</span>
                <span>$5,000 (退訂無用訂閱+減少交際)</span>
                <span>$20,000</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-4">
            <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
              20 年後帶來的真實回報
            </h4>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
              {formatCurrency(savingImpact.finalFV)}
            </div>
            <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-white/10">
              <div className="flex justify-between">
                <span>自行省下總本金：</span>
                <span className="font-bold text-slate-100">{formatCurrency(savingImpact.totalContributed)}</span>
              </div>
              <div className="flex justify-between">
                <span>複利額外創造淨收益：</span>
                <span className="font-bold text-emerald-300">+{formatCurrency(savingImpact.profit)}</span>
              </div>
              <div className="flex justify-between">
                <span>財富成長槓桿倍數：</span>
                <span className="font-bold text-emerald-300">{savingImpact.multiplier} 倍</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 資產配置模型建議 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-brand-600" />
              <span>依風險屬性之經典資產配置模型</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              不盲目挑選單一個股，採用全球分散與股債平衡，穩健獲取市場平均報酬
            </p>
          </div>

          {/* 風險標籤切換 */}
          <div className="flex rounded-lg bg-slate-100 p-1 text-xs">
            {(['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'] as RiskProfile[]).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedProfile(p)}
                className={`px-3 py-1.5 font-bold rounded-md transition-all ${
                  selectedProfile === p
                    ? 'bg-white shadow text-slate-900'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {p === 'CONSERVATIVE' ? '保守型' : p === 'MODERATE' ? '穩健型 (推薦)' : '積極型'}
              </button>
            ))}
          </div>
        </div>

        {/* 模型介紹與配比展示 */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-slate-900 text-base">{currentPortfolio.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{currentPortfolio.description}</p>
            </div>
            <div className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full self-start sm:self-auto">
              歷史年化長期參考：{currentPortfolio.expectedReturn}
            </div>
          </div>

          {/* 配比進度條 */}
          <div className="space-y-2">
            <div className="w-full bg-slate-200 rounded-xl h-4 overflow-hidden flex">
              {currentPortfolio.allocation.map((item, idx) => (
                <div
                  key={idx}
                  style={{ width: `${item.pct}%` }}
                  className={`${item.color} transition-all duration-300`}
                  title={`${item.label}: ${item.pct}%`}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {currentPortfolio.allocation.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs">
                  <span className={`w-3 h-3 rounded-full ${item.color} shrink-0`} />
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="font-bold text-slate-900">({item.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
