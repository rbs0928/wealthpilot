'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { DashboardOverview } from '../components/DashboardOverview';
import { CashflowSection } from '../components/CashflowSection';
import { NetWorthSection } from '../components/NetWorthSection';
import { GoalsSection } from '../components/GoalsSection';
import { InvestmentSection } from '../components/InvestmentSection';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { 
  initialTransactions, 
  initialAssetsLiabilities, 
  initialGoals 
} from '../lib/sampleData';
import { Transaction, AssetLiabilityItem, FinancialGoal } from '../lib/types';
import { isFixedExpense } from '../lib/categorizer';
import { RotateCcw } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState<boolean>(false);

  // 狀態管理
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wealthpilot_txs_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return initialTransactions;
  });

  const [assetsLiabilities, setAssetsLiabilities] = useState<AssetLiabilityItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wealthpilot_assets_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return initialAssetsLiabilities;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wealthpilot_goals_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return initialGoals;
  });

  // 自動持久化存儲至 LocalStorage
  useEffect(() => {
    localStorage.setItem('wealthpilot_txs_v2', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('wealthpilot_assets_v2', JSON.stringify(assetsLiabilities));
  }, [assetsLiabilities]);

  useEffect(() => {
    localStorage.setItem('wealthpilot_goals_v2', JSON.stringify(goals));
  }, [goals]);

  // 單筆新增交易
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  // 批次 CSV 匯入交易
  const handleImportTransactions = (importedTxs: Omit<Transaction, 'id'>[]) => {
    const formatted: Transaction[] = importedTxs.map((t, idx) => ({
      ...t,
      id: `csv-${Date.now()}-${idx}`,
    }));
    setTransactions((prev) => [...formatted, ...prev]);
  };

  // 刪除交易
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // 新增資產/負債
  const handleAddAssetLiability = (newItem: Omit<AssetLiabilityItem, 'id'>) => {
    const item: AssetLiabilityItem = {
      ...newItem,
      id: `aslb-${Date.now()}`,
    };
    setAssetsLiabilities((prev) => [...prev, item]);
  };

  // 刪除資產/負債
  const handleDeleteAssetLiability = (id: string) => {
    setAssetsLiabilities((prev) => prev.filter((item) => item.id !== id));
  };

  // 新增目標
  const handleAddGoal = (newGoal: Omit<FinancialGoal, 'id'>) => {
    const goal: FinancialGoal = {
      ...newGoal,
      id: `g-${Date.now()}`,
    };
    setGoals((prev) => [...prev, goal]);
  };

  // 刪除目標
  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // 重設為預設體驗資料
  const handleResetData = () => {
    if (confirm('確定要恢復預設演示財務資料嗎？目前的所有自訂變更將被重設。')) {
      setTransactions(initialTransactions);
      setAssetsLiabilities(initialAssetsLiabilities);
      setGoals(initialGoals);
      localStorage.removeItem('wealthpilot_txs_v2');
      localStorage.removeItem('wealthpilot_assets_v2');
      localStorage.removeItem('wealthpilot_goals_v2');
    }
  };

  // 計算月必要支出 (包含固定開銷房貸/車貸/房租 + 浮動飲食水電)
  const monthlyNeedsExpense = transactions
    .filter((t) => t.type === 'EXPENSE' && (t.category === 'NEEDS' || isFixedExpense(t.category)))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalMonthlyExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalMonthlyIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlySurplus = Math.max(0, totalMonthlyIncome - totalMonthlyExpense);

  const totalAssets = assetsLiabilities
    .filter((item) => item.type === 'ASSET')
    .reduce((sum, item) => sum + item.value, 0);

  const totalLiabilities = assetsLiabilities
    .filter((item) => item.type === 'LIABILITY')
    .reduce((sum, item) => sum + item.value, 0);

  const cashAssets = assetsLiabilities
    .filter((item) => item.type === 'ASSET' && item.subCategory === 'CASH')
    .reduce((sum, item) => sum + item.value, 0);

  const emergencyMonths = monthlyNeedsExpense > 0 ? (cashAssets / monthlyNeedsExpense) : (cashAssets / 35000);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 頂部導航列 */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddTransaction={() => setIsAddTxModalOpen(true)}
      />

      {/* 主內容區 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            transactions={transactions}
            assetsLiabilities={assetsLiabilities}
            goals={goals}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'cashflow' && (
          <CashflowSection
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onImportTransactions={handleImportTransactions}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenAddModal={() => setIsAddTxModalOpen(true)}
          />
        )}

        {activeTab === 'networth' && (
          <NetWorthSection
            assetsLiabilities={assetsLiabilities}
            onAddItem={handleAddAssetLiability}
            onDeleteItem={handleDeleteAssetLiability}
            monthlyNeedsExpense={monthlyNeedsExpense}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsSection
            goals={goals}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
            annualExpense={totalMonthlyExpense * 12}
          />
        )}

        {activeTab === 'investment' && (
          <InvestmentSection
            monthlyCashflowSurplus={monthlySurplus}
            transactions={transactions}
            emergencyFundMonths={emergencyMonths}
            totalAssets={totalAssets}
            totalLiabilities={totalLiabilities}
          />
        )}
      </main>

      {/* 記帳彈窗 Modal */}
      <AddTransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => setIsAddTxModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      {/* 底部 Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">WealthPilot 財富領航</span>
            <span>• 一條龍個人理財平台</span>
            <span className="hidden sm:inline">（固定房貸/信貸審視 ➔ 淨值防護 ➔ 全球股市脈動 ➔ 智慧投資建議）</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleResetData}
              className="inline-flex items-center space-x-1 hover:text-slate-900 transition-colors"
              title="恢復預設範例資料"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重設體驗範例</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
