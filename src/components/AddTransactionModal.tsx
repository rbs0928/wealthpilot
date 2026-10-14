'use client';

import React, { useState } from 'react';
import { X, DollarSign, Calendar, Tag, FileText, Repeat, Sparkles } from 'lucide-react';
import { Transaction, TransactionCategory, TransactionType } from '../lib/types';
import { autoCategorize, isFixedExpense } from '../lib/categorizer';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
}) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [category, setCategory] = useState<TransactionCategory>('NEEDS');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);

  if (!isOpen) return null;

  // 當使用者輸入項目名稱時，觸發智慧自動推薦
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDescription(val);
    if (val.trim().length >= 2) {
      const detected = autoCategorize(val, type);
      setCategory(detected.category);
      if (detected.isFixed) {
        setIsRecurring(true);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    onAddTransaction({
      type,
      category,
      amount: parseFloat(amount),
      description,
      date,
      isRecurring: isRecurring || isFixedExpense(category),
    });

    setAmount('');
    setDescription('');
    setIsRecurring(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-brand-600" />
            <span>自訂記一筆收支交易</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 收支切換 */}
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => { setType('EXPENSE'); setCategory('NEEDS'); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                type === 'EXPENSE' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
              }`}
            >
              支出 (Expense)
            </button>
            <button
              type="button"
              onClick={() => { setType('INCOME'); setCategory('SALARY'); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                type === 'INCOME' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'
              }`}
            >
              收入 (Income)
            </button>
          </div>

          {/* 描述與智慧偵測提示 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              項目說明 (輸入關鍵字將自動識別分類)
            </label>
            <input
              type="text"
              placeholder="例如：房貸扣繳 / 信貸利息 / 全聯買菜 / 星巴克"
              value={description}
              onChange={handleDescriptionChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          {/* 類別 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              屬性分類
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            >
              {type === 'EXPENSE' ? (
                <>
                  <optgroup label="固定開銷 (不可隨意刪減)">
                    <option value="FIXED_HOUSING">固定開銷：房貸 / 房租 / 大樓管理費</option>
                    <option value="FIXED_LOAN">固定開銷：車貸 / 個人信貸 / 學貸</option>
                    <option value="FIXED_INSURANCE">固定開銷：壽險 / 產險 / 定期規費</option>
                  </optgroup>
                  <optgroup label="日常與生活開銷">
                    <option value="NEEDS">50% 浮動必要 (三餐、交通、水電瓦斯、醫療)</option>
                    <option value="WANTS">30% 想要享受 (聚餐外食、購物、影音訂閱)</option>
                  </optgroup>
                  <optgroup label="資產累積">
                    <option value="INVESTMENT">20% 投資增值 (股票、ETF、定期定額)</option>
                    <option value="SAVINGS">20% 儲蓄存款 (高利活存、緊急備用金)</option>
                  </optgroup>
                  <option value="OTHER">其他雜支</option>
                </>
              ) : (
                <>
                  <option value="SALARY">正職本薪所得</option>
                  <option value="BONUS">兼職接案 / 獎金紅利</option>
                  <option value="INVESTMENT">股票股利 / 利息被動收入</option>
                  <option value="OTHER">其他收入</option>
                </>
              )}
            </select>
          </div>

          {/* 金額 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              金額 (TWD)
            </label>
            <input
              type="number"
              placeholder="例如：25000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
              required
            />
          </div>

          {/* 日期與定期扣款 */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                交易日期
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div className="pt-5">
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>每月固定定期扣款</span>
              </label>
            </div>
          </div>

          {/* 提交按鈕 */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
            >
              儲存紀錄
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
