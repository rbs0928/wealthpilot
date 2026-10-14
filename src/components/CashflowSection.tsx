'use client';

import React, { useState } from 'react';
import { 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle, 
  CheckCircle, 
  Calendar, 
  Tag, 
  Repeat, 
  Trash2,
  Filter,
  DollarSign,
  Coffee,
  HelpCircle,
  TrendingUp,
  FileSpreadsheet,
  Home,
  ShieldAlert,
  Car
} from 'lucide-react';
import { Transaction, TransactionCategory } from '../lib/types';
import { QuickEntryBar } from './QuickEntryBar';
import { CsvImportModal } from './CsvImportModal';
import { getCategoryBadgeStyle, isFixedExpense } from '../lib/categorizer';

interface CashflowSectionProps {
  transactions: Transaction[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onImportTransactions: (txs: Omit<Transaction, 'id'>[]) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
}

export const CashflowSection: React.FC<CashflowSectionProps> = ({
  transactions,
  onAddTransaction,
  onImportTransactions,
  onDeleteTransaction,
  onOpenAddModal,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);
  };

  // 1. 現金流統計
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  // 固定開銷：房貸、車貸、信貸、房租、保險
  const fixedObligations = transactions
    .filter((t) => t.type === 'EXPENSE' && isFixedExpense(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  // 浮動必要生活支出
  const variableNeeds = transactions
    .filter((t) => t.type === 'EXPENSE' && t.category === 'NEEDS')
    .reduce((sum, t) => sum + t.amount, 0);

  // 總必要支出 (固定 + 浮動)
  const totalNeedsAmount = fixedObligations + variableNeeds;

  // 想要享受
  const wantsAmount = transactions
    .filter((t) => t.type === 'EXPENSE' && t.category === 'WANTS')
    .reduce((sum, t) => sum + t.amount, 0);

  // 儲蓄投資
  const savingsInvestAmount = transactions
    .filter((t) => t.type === 'EXPENSE' && (t.category === 'SAVINGS' || t.category === 'INVESTMENT'))
    .reduce((sum, t) => sum + t.amount, 0);

  const effectiveIncome = totalIncome > 0 ? totalIncome : 1;
  const fixedRatio = (fixedObligations / effectiveIncome) * 100;
  const needsPct = (totalNeedsAmount / effectiveIncome) * 100;
  const wantsPct = (wantsAmount / effectiveIncome) * 100;
  const savingsPct = (savingsInvestAmount / effectiveIncome) * 100;

  // 定期扣款
  const recurringSubscriptions = transactions.filter(
    (t) => t.type === 'EXPENSE' && t.isRecurring
  );
  const monthlyRecurringTotal = recurringSubscriptions.reduce((sum, t) => sum + t.amount, 0);
  const annualRecurringTotal = monthlyRecurringTotal * 12;

  // 交易篩選
  const filteredTransactions = transactions.filter((t) => {
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'INCOME') return t.type === 'INCOME';
    if (filterCategory === 'FIXED') return t.type === 'EXPENSE' && isFixedExpense(t.category);
    if (filterCategory === 'NEEDS') return t.type === 'EXPENSE' && t.category === 'NEEDS';
    if (filterCategory === 'WANTS') return t.type === 'EXPENSE' && t.category === 'WANTS';
    if (filterCategory === 'INVEST') return t.type === 'EXPENSE' && (t.category === 'INVESTMENT' || t.category === 'SAVINGS');
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* 頂部標題與按鈕操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-brand-600" />
            <span>收支審視與現金流管理</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            清晰區隔「固定開銷（房貸/信貸/房租）」與「浮動生活費」，精準掌握每分錢的流向。
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-sm font-semibold shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>匯入 CSV 帳單</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
          >
            <DollarSign className="w-4 h-4" />
            <span>自訂記一筆</span>
          </button>
        </div>
      </div>

      {/* 快捷一鍵記帳工具列 */}
      <QuickEntryBar
        onQuickAdd={onAddTransaction}
        onOpenCustomModal={onOpenAddModal}
      />

      {/* 固定開銷深度透視卡 (房貸、車貸、信貸、房租、保險) */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/70 to-slate-900 rounded-2xl p-6 text-white shadow-lg space-y-4 border border-rose-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30">
              <Home className="w-3.5 h-3.5" />
              <span>固定開銷雷達 (房貸/車貸/信貸/房租/保險)</span>
            </div>
            <h3 className="text-xl font-black text-white">
              每月固定支出總計：{formatCurrency(fixedObligations)}
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              固定開銷佔您月收入的 {fixedRatio.toFixed(1)}%（財務安全黃金標準為 $\le 35\%\sim 40\%$）。
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-right min-w-[200px]">
            <div className="text-xs text-slate-400">固定負擔比率</div>
            <div className={`text-2xl font-black mt-0.5 ${fixedRatio <= 35 ? 'text-emerald-400' : fixedRatio <= 45 ? 'text-amber-400' : 'text-rose-400'}`}>
              {fixedRatio.toFixed(1)}%
            </div>
            <div className="text-[11px] text-slate-300">
              {fixedRatio <= 35 ? '✓ 負擔輕鬆，現金流充沛' : fixedRatio <= 45 ? '● 負擔適中，注意防守' : '▲ 負擔沉重，須備充裕應急金'}
            </div>
          </div>
        </div>
      </div>

      {/* 50 / 30 / 20 預算健檢分析卡 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              50 / 30 / 20 黃金預算配比診斷
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              依據當月總收入 {formatCurrency(totalIncome)} 進行結構分析
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs mt-2 sm:mt-0">
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span>必要 (Needs)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span>想要 (Wants)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>儲蓄投資 (Savings)</span>
            </span>
          </div>
        </div>

        {/* 堆疊進度條 */}
        <div className="space-y-2">
          <div className="w-full bg-slate-100 rounded-xl h-5 overflow-hidden flex">
            <div 
              style={{ width: `${Math.min(100, needsPct)}%` }} 
              className="bg-blue-500 transition-all duration-500" 
              title={`必要: ${needsPct.toFixed(1)}%`}
            />
            <div 
              style={{ width: `${Math.min(100, wantsPct)}%` }} 
              className="bg-amber-500 transition-all duration-500" 
              title={`想要: ${wantsPct.toFixed(1)}%`}
            />
            <div 
              style={{ width: `${Math.min(100, savingsPct)}%` }} 
              className="bg-emerald-500 transition-all duration-500" 
              title={`儲蓄投資: ${savingsPct.toFixed(1)}%`}
            />
          </div>
        </div>

        {/* 三個區塊詳細數據 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 50% 必要 */}
          <div className={`p-4 rounded-xl border ${needsPct <= 50 ? 'bg-blue-50/50 border-blue-200' : 'bg-rose-50/60 border-rose-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">50% 必要生活支出 (Needs)</span>
              {needsPct <= 50 ? (
                <span className="text-xs text-blue-700 font-semibold flex items-center"><CheckCircle className="w-3.5 h-3.5 mr-1" /> 合規</span>
              ) : (
                <span className="text-xs text-rose-700 font-semibold flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> 超標</span>
              )}
            </div>
            <div className="text-xl font-bold text-slate-900 mt-2">{formatCurrency(totalNeedsAmount)}</div>
            <div className="text-xs text-slate-500 mt-1 flex justify-between">
              <span>固定 {formatCurrency(fixedObligations)} + 浮動 {formatCurrency(variableNeeds)}</span>
              <span>上限：{formatCurrency(totalIncome * 0.5)}</span>
            </div>
          </div>

          {/* 30% 想要 */}
          <div className={`p-4 rounded-xl border ${wantsPct <= 30 ? 'bg-amber-50/50 border-amber-200' : 'bg-rose-50/60 border-rose-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">30% 享受娛樂支出 (Wants)</span>
              {wantsPct <= 30 ? (
                <span className="text-xs text-amber-700 font-semibold flex items-center"><CheckCircle className="w-3.5 h-3.5 mr-1" /> 合規</span>
              ) : (
                <span className="text-xs text-rose-700 font-semibold flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> 超標</span>
              )}
            </div>
            <div className="text-xl font-bold text-slate-900 mt-2">{formatCurrency(wantsAmount)}</div>
            <div className="text-xs text-slate-500 mt-1 flex justify-between">
              <span>實際佔比：{wantsPct.toFixed(1)}%</span>
              <span>上限：{formatCurrency(totalIncome * 0.3)}</span>
            </div>
          </div>

          {/* 20% 儲蓄投資 */}
          <div className={`p-4 rounded-xl border ${savingsPct >= 20 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/60 border-amber-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">20% 儲蓄與投資 (Savings)</span>
              {savingsPct >= 20 ? (
                <span className="text-xs text-emerald-700 font-semibold flex items-center"><CheckCircle className="w-3.5 h-3.5 mr-1" /> 達標</span>
              ) : (
                <span className="text-xs text-amber-700 font-semibold flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> 未達標</span>
              )}
            </div>
            <div className="text-xl font-bold text-slate-900 mt-2">{formatCurrency(savingsInvestAmount)}</div>
            <div className="text-xs text-slate-500 mt-1 flex justify-between">
              <span>實際佔比：{savingsPct.toFixed(1)}%</span>
              <span>目標底線：{formatCurrency(totalIncome * 0.2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 交易清單表格 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-slate-900 text-base">近期交易明細 ({filteredTransactions.length} 筆)</h3>
          {/* 篩選標籤 */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { id: 'ALL', label: '全部' },
              { id: 'INCOME', label: '收入' },
              { id: 'FIXED', label: '固定開銷 (房貸/信貸)' },
              { id: 'NEEDS', label: '浮動必要' },
              { id: 'WANTS', label: '想要享受' },
              { id: 'INVEST', label: '投資儲蓄' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterCategory(f.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterCategory === f.id
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">日期</th>
                <th className="pb-3">項目說明</th>
                <th className="pb-3">屬性分類</th>
                <th className="pb-3 text-right">金額</th>
                <th className="pb-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const badge = getCategoryBadgeStyle(tx.category);
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3 text-slate-500 text-xs whitespace-nowrap">{tx.date}</td>
                    <td className="py-3 font-medium text-slate-800">
                      <div className="flex items-center space-x-2">
                        <span>{tx.description}</span>
                        {tx.isRecurring && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                            固定定期
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className={`py-3 text-right font-bold whitespace-nowrap ${
                      tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {tx.type === 'INCOME' ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors"
                        title="刪除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV 匯入 Modal */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportTransactions={onImportTransactions}
        existingTransactions={transactions}
      />
    </div>
  );
};
