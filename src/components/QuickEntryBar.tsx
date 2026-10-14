'use client';

import React from 'react';
import { 
  Home, 
  Car, 
  Utensils, 
  Coffee, 
  ShoppingCart, 
  TrendingUp, 
  Sparkles,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { Transaction, TransactionCategory } from '../lib/types';

interface QuickEntryBarProps {
  onQuickAdd: (tx: Omit<Transaction, 'id'>) => void;
  onOpenCustomModal: () => void;
}

export const QuickEntryBar: React.FC<QuickEntryBarProps> = ({
  onQuickAdd,
  onOpenCustomModal,
}) => {
  const presets = [
    {
      label: '房租 / 房貸',
      icon: Home,
      amount: 18000,
      description: '本月房租 / 房貸本息扣繳',
      category: 'FIXED_HOUSING' as TransactionCategory,
      type: 'EXPENSE' as const,
      badge: '固定必要',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      isRecurring: true,
    },
    {
      label: '車貸 / 信貸',
      icon: Car,
      amount: 6500,
      description: '汽車分期 / 個人信貸本利攤還',
      category: 'FIXED_LOAN' as TransactionCategory,
      type: 'EXPENSE' as const,
      badge: '固定開銷',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      isRecurring: true,
    },
    {
      label: '三餐便當',
      icon: Utensils,
      amount: 150,
      description: '午餐便當與日常飲食',
      category: 'NEEDS' as TransactionCategory,
      type: 'EXPENSE' as const,
      badge: '浮動必要',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      label: '咖啡茶飲',
      icon: Coffee,
      amount: 85,
      description: '下午茶咖啡飲品',
      category: 'WANTS' as TransactionCategory,
      type: 'EXPENSE' as const,
      badge: '想要享受',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      label: '超市生鮮',
      icon: ShoppingCart,
      amount: 680,
      description: '全聯超市生活採買',
      category: 'NEEDS' as TransactionCategory,
      type: 'EXPENSE' as const,
      badge: '浮動必要',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      label: '定期定額',
      icon: TrendingUp,
      amount: 10000,
      description: '定期定額扣繳全球股票 ETF',
      category: 'INVESTMENT' as TransactionCategory,
      type: 'EXPENSE' as const,
      badge: '投資增值',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      isRecurring: true,
    },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    onQuickAdd({
      type: preset.type,
      category: preset.category,
      amount: preset.amount,
      description: preset.description,
      date: new Date().toISOString().split('T')[0],
      isRecurring: preset.isRecurring,
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-brand-50 text-brand-600 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">常用開銷一鍵速記</h4>
            <p className="text-[11px] text-slate-400">點選快速記錄高頻支出與固定房貸/車貸開銷</p>
          </div>
        </div>
        <button
          onClick={onOpenCustomModal}
          className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center space-x-1 hover:underline"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>自訂金額記帳</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {presets.map((preset, idx) => {
          const Icon = preset.icon;
          return (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="flex flex-col items-start p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/90 hover:border-slate-200 transition-all text-left group"
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <Icon className="w-4 h-4 text-slate-600 group-hover:text-brand-600 transition-colors" />
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${preset.badgeColor}`}>
                  {preset.badge}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-800">{preset.label}</span>
              <span className="text-[11px] font-semibold text-slate-500 mt-0.5">
                ${preset.amount.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
