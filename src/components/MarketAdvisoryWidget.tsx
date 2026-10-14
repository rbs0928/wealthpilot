'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Globe2, 
  Sparkles, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  PieChart,
  Radio
} from 'lucide-react';
import { MarketTickerData, InvestmentAdvice } from '../lib/types';
import { DEFAULT_MARKET_TICKERS, fetchLiveMarketData, getGlobalMarketMacroPulse } from '../lib/marketData';

interface MarketAdvisoryWidgetProps {
  advice: InvestmentAdvice;
}

export const MarketAdvisoryWidget: React.FC<MarketAdvisoryWidgetProps> = ({ advice }) => {
  const [tickers, setTickers] = useState<MarketTickerData[]>(DEFAULT_MARKET_TICKERS);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const macro = getGlobalMarketMacroPulse();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchLiveMarketData();
      setTickers(data);
      setIsLiveConnected(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 組件載入時自動拉取最新真實行情
  useEffect(() => {
    handleRefresh();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* 1. 全球主要股市與 ETF 即時行情看板 */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/30">
              <Globe2 className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">全球股市即時脈動觀測站</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isLiveConnected ? '真實即時行情已連動' : '公開金融數據連線中'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{macro.globalHeadline}</p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-300 rounded-lg text-xs font-semibold border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? '更新中...' : '即時刷新'}</span>
          </button>
        </div>

        {/* 行情卡片列 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {tickers.map((t) => {
            const isPositive = t.change >= 0;
            return (
              <div
                key={t.ticker}
                className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-xl p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-white tracking-wider">{t.ticker}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    isPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {isPositive ? `+${t.changePercent.toFixed(2)}%` : `${t.changePercent.toFixed(2)}%`}
                  </span>
                </div>

                <div className="text-xs text-slate-400 line-clamp-1" title={t.name}>{t.name}</div>

                <div className="flex items-baseline space-x-1.5 pt-1">
                  <span className="text-base font-extrabold text-white">
                    {t.currency === 'USD' ? `$${t.price.toFixed(2)}` : `NT$${t.price.toFixed(1)}`}
                  </span>
                  <span className={`text-[11px] font-semibold flex items-center ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                    {isPositive ? `+${t.change}` : t.change}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 border-t border-white/5 pt-1 mt-1 flex justify-between">
                  <span>{t.trendDescription}</span>
                  <span className="text-[9px] text-slate-500">{t.updatedTime}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 結合個人收支模式之「智慧投資建議決策卡」 */}
      <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-2xl p-6 sm:p-7 border border-emerald-200/80 shadow-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-emerald-100 pb-4 gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-md font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>依您本月消費模式與結餘產出</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {advice.title}
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              {advice.summary}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm min-w-[240px] text-right">
            <span className="text-xs text-slate-500">本月建議定期定額投入</span>
            <div className="text-2xl font-black text-brand-600 mt-0.5">
              {formatCurrency(advice.recommendedDcaAmount)}
            </div>
            <div className="text-[11px] text-slate-400">
              建議留存活存緩衝：{formatCurrency(advice.recommendedCashBuffer)}
            </div>
          </div>
        </div>

        {/* 債務警示提示（若固定開銷過高時顯示） */}
        {advice.debtAlertMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">固定開銷防禦警示：</span>
              <p className="mt-0.5 leading-relaxed">{advice.debtAlertMessage}</p>
            </div>
          </div>
        )}

        {/* 具體配置配額推薦 */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <PieChart className="w-4 h-4 text-brand-600" />
            <span>當月建議配置組合分配與具體金額 (TWD)</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {advice.allocationStrategy.map((strat, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{strat.asset}</span>
                  <span className="text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full">
                    {strat.percentage}%
                  </span>
                </div>

                <div className="text-xs font-mono font-semibold text-slate-500">{strat.ticker}</div>

                <div className="text-lg font-black text-slate-800 pt-1">
                  {formatCurrency(strat.amount)}
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2 mt-2">
                  {strat.rationale}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 行動方針指南 */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>本月理財具體行動清單</span>
          </h4>
          <div className="space-y-1.5">
            {advice.actionableSteps.map((step, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
