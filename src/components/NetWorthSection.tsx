'use client';

import React, { useState } from 'react';
import { 
  Landmark, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  TrendingUp, 
  CreditCard, 
  DollarSign, 
  Building2, 
  Coins, 
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { AssetLiabilityItem, AssetCategory, LiabilityCategory } from '../lib/types';

interface NetWorthSectionProps {
  assetsLiabilities: AssetLiabilityItem[];
  onAddItem: (item: Omit<AssetLiabilityItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
  monthlyNeedsExpense: number;
}

export const NetWorthSection: React.FC<NetWorthSectionProps> = ({
  assetsLiabilities,
  onAddItem,
  onDeleteItem,
  monthlyNeedsExpense,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemType, setNewItemType] = useState<'ASSET' | 'LIABILITY'>('ASSET');
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newSubCategory, setNewSubCategory] = useState<string>('CASH');
  const [newInterestRate, setNewInterestRate] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);
  };

  // 1. 資產總額與分類
  const assets = assetsLiabilities.filter((item) => item.type === 'ASSET');
  const liabilities = assetsLiabilities.filter((item) => item.type === 'LIABILITY');

  const totalAssets = assets.reduce((sum, item) => sum + item.value, 0);
  const totalLiabilities = liabilities.reduce((sum, item) => sum + item.value, 0);
  const netWorth = totalAssets - totalLiabilities;
  const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  // 2. 緊急備用金
  const cashAssets = assets
    .filter((item) => item.subCategory === 'CASH')
    .reduce((sum, item) => sum + item.value, 0);

  const baselineExpense = monthlyNeedsExpense > 0 ? monthlyNeedsExpense : 32000;
  const emergencyMonths = cashAssets / baselineExpense;
  const target3Months = baselineExpense * 3;
  const target6Months = baselineExpense * 6;

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newValue) return;

    onAddItem({
      type: newItemType,
      subCategory: newSubCategory as any,
      name: newName,
      value: parseFloat(newValue),
      interestRate: newInterestRate ? parseFloat(newInterestRate) : undefined,
    });

    setNewName('');
    setNewValue('');
    setNewInterestRate('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 頂部標題 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Landmark className="w-6 h-6 text-emerald-600" />
            <span>資產負債與真實淨值</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            理財的終極目標是持續累積「淨資產 (Net Worth)」，而非僅看表面收入或單一資產。
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>新增資產或負債</span>
        </button>
      </div>

      {/* 淨值計算總表 Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">個人真實淨值 (Net Worth)</span>
            <div className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
              {formatCurrency(netWorth)}
            </div>
            <p className="text-xs text-slate-400 mt-1">資產總計扣除全部負債之真實財富</p>
          </div>

          <div className="flex items-center justify-between md:justify-around p-4 bg-white/5 rounded-xl border border-white/10 text-sm">
            <div>
              <span className="text-xs text-slate-400">總資產 (Assets)</span>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">{formatCurrency(totalAssets)}</div>
            </div>
            <div className="text-slate-500 font-bold text-xl">-</div>
            <div>
              <span className="text-xs text-slate-400">總負債 (Liabilities)</span>
              <div className="text-xl font-bold text-rose-400 mt-0.5">{formatCurrency(totalLiabilities)}</div>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">負債資產比率：</span>
              <span className={`font-bold ${debtRatio < 30 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {debtRatio.toFixed(1)}% {debtRatio < 30 ? '(健康優良)' : '(需留意利息負擔)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">流動性資產佔比：</span>
              <span className="font-bold text-slate-200">
                {totalAssets > 0 ? ((cashAssets / totalAssets) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 緊急預備金安全指針 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">緊急備用金安全水位 (Safety Net)</h3>
          </div>
          <div className="text-xs text-slate-500">
            以每月必要支出 {formatCurrency(baselineExpense)} 為基準
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500">當前活存/現金備用金</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(cashAssets)}</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500">可支撐生活時間</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{emergencyMonths.toFixed(1)} 個月</div>
          </div>

          <div className="md:col-span-2 space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">防護水位進度 (目標 6 個月：{formatCurrency(target6Months)})</span>
              <span className="text-emerald-700">{Math.min(100, Math.round((cashAssets / target6Months) * 100))}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden flex">
              <div 
                style={{ width: `${Math.min(100, (cashAssets / target6Months) * 100)}%` }} 
                className={`h-3 rounded-full transition-all duration-500 ${
                  emergencyMonths >= 6 ? 'bg-emerald-500' : emergencyMonths >= 3 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0 個月</span>
              <span>3 個月安全底線 ({formatCurrency(target3Months)})</span>
              <span>6 個月充足</span>
            </div>
          </div>
        </div>
      </div>

      {/* 資產與負債雙欄清單 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 資產欄 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>資產項目清單</span>
            </h3>
            <span className="font-extrabold text-emerald-600 text-sm">{formatCurrency(totalAssets)}</span>
          </div>

          <div className="space-y-3">
            {assets.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    {item.subCategory === 'CASH' && <DollarSign className="w-4 h-4" />}
                    {item.subCategory === 'STOCK' && <TrendingUp className="w-4 h-4" />}
                    {item.subCategory === 'REAL_ESTATE' && <Building2 className="w-4 h-4" />}
                    {item.subCategory === 'CRYPTO' && <Coins className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{item.name}</div>
                    <div className="text-xs text-slate-400">
                      {item.interestRate ? `利息/殖利率: ${item.interestRate}%` : '流動/投資資產'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-bold text-slate-900 text-sm">{formatCurrency(item.value)}</span>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 負債欄 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-rose-500" />
              <span>負債項目清單</span>
            </h3>
            <span className="font-extrabold text-rose-500 text-sm">{formatCurrency(totalLiabilities)}</span>
          </div>

          <div className="space-y-3">
            {liabilities.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">目前無任何負債，財務非常健康！</div>
            ) : (
              liabilities.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{item.name}</div>
                      <div className="text-xs text-slate-400">
                        {item.interestRate ? `貸款利率: ${item.interestRate}%` : '短期應付款項'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-rose-600 text-sm">{formatCurrency(item.value)}</span>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 新增資產/負債 Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900">新增資產或負債</h3>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="flex rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => { setNewItemType('ASSET'); setNewSubCategory('CASH'); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    newItemType === 'ASSET' ? 'bg-white shadow text-emerald-700' : 'text-slate-600'
                  }`}
                >
                  資產 (Asset)
                </button>
                <button
                  type="button"
                  onClick={() => { setNewItemType('LIABILITY'); setNewSubCategory('CREDIT_CARD'); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    newItemType === 'LIABILITY' ? 'bg-white shadow text-rose-700' : 'text-slate-600'
                  }`}
                >
                  負債 (Liability)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">名稱說明</label>
                <input
                  type="text"
                  placeholder={newItemType === 'ASSET' ? '例如：台積電股票 / 高利定存' : '例如：房屋貸款 / 信用貸款'}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">類別</label>
                <select
                  value={newSubCategory}
                  onChange={(e) => setNewSubCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {newItemType === 'ASSET' ? (
                    <>
                      <option value="CASH">現金與高利活存</option>
                      <option value="STOCK">股票與基金 ETF</option>
                      <option value="REAL_ESTATE">不動產與房屋</option>
                      <option value="CRYPTO">加密貨幣與其他</option>
                    </>
                  ) : (
                    <>
                      <option value="CREDIT_CARD">信用卡應繳款項</option>
                      <option value="PERSONAL_LOAN">信貸與學貸</option>
                      <option value="MORTGAGE">房屋貸款</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">金額 (TWD)</label>
                  <input
                    type="number"
                    placeholder="100000"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">年利率/殖利率 (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="可選 (如 2.1)"
                    value={newInterestRate}
                    onChange={(e) => setNewInterestRate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  確認新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
