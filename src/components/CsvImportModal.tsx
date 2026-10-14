'use client';

import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Sparkles,
  HelpCircle,
  FileText
} from 'lucide-react';
import { Transaction, TransactionCategory } from '../lib/types';
import { parseBankCsv, ParsedCsvRow } from '../lib/csvParser';
import { getCategoryDisplayName, getCategoryBadgeStyle } from '../lib/categorizer';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTransactions: (txs: Omit<Transaction, 'id'>[]) => void;
  existingTransactions: Transaction[];
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportTransactions,
  existingTransactions,
}) => {
  const [parsedRows, setParsedRows] = useState<ParsedCsvRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  // 處理上傳檔案
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const rows = parseBankCsv(content, existingTransactions);
      setParsedRows(rows);
      setIsProcessing(false);
    };
    reader.readAsText(file, 'UTF-8');
  };

  // 載入台灣常用網銀/信用卡示範 CSV 內容（便於直接體驗）
  const handleLoadSampleCsv = () => {
    const sampleCsv = `交易日期,交易說明,支出金額,收入金額,備註
2026/10/01,中信房屋貸款本息攤還,28500,,固定房貸扣款
2026/10/02,國泰世華個人信貸扣繳,5600,,信用貸款分期
2026/10/03,南山人壽保險費,3200,,定期壽險
2026/10/04,全聯福利中心-台北大安店,1280,,日常生鮮採買
2026/10/05,台灣電力公司電費,1450,,水電公用
2026/10/06,Netflix 網飛串流服務,390,,娛樂訂閱
2026/10/07,星巴克咖啡-敦南門市,165,,聚餐外食
2026/10/08,元大證券定期定額0050,15000,,投資資產增值
2026/10/05,公司薪資轉帳入帳,,82000,10月份薪資`;

    setFileName('台灣網銀示範對帳單.csv');
    const rows = parseBankCsv(sampleCsv, existingTransactions);
    setParsedRows(rows);
  };

  // 修改預覽列的分類
  const handleChangeCategory = (id: string, newCat: TransactionCategory) => {
    setParsedRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, category: newCat } : r))
    );
  };

  // 刪除特定預覽列
  const handleDeleteRow = (id: string) => {
    setParsedRows((prev) => prev.filter((r) => r.id !== id));
  };

  // 執行匯入
  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;

    const toImport = parsedRows.map((r) => ({
      date: r.date,
      description: r.description,
      amount: r.amount,
      type: r.type,
      category: r.category,
      isRecurring: r.category.startsWith('FIXED_'),
    }));

    onImportTransactions(toImport);
    setParsedRows([]);
    setFileName('');
    onClose();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal 標題列 */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">匯入銀行 / 信用卡 CSV 對帳單</h3>
              <p className="text-xs text-slate-500">自動辨識房貸、車貸、保費等固定開銷與日常消費，省去手動記帳時間</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 檔案上傳區 / 範例載入 */}
        {parsedRows.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50">
            <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100 text-brand-600">
              <Upload className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">選擇或拖曳 CSV 帳單至此處</h4>
              <p className="text-xs text-slate-400 max-w-md">
                支援台灣各大銀行（玉山、台新、國泰、中信、郵局等）匯出之 CSV 檔案，自動偵測日期、說明與金額。
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <label className="cursor-pointer px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all">
                <span>瀏覽本機檔案</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleLoadSampleCsv}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>載入對帳單範例測試</span>
              </button>
            </div>
          </div>
        ) : (
          /* 預覽與校對表格 */
          <div className="flex-1 overflow-hidden flex flex-col space-y-3">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-700">檔案名稱：{fileName}</span>
                <span className="bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full font-bold">
                  解析完成：共 {parsedRows.length} 筆
                </span>
              </div>
              <button
                onClick={() => setParsedRows([])}
                className="text-slate-500 hover:text-slate-800 font-medium underline"
              >
                重新上傳
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">日期</th>
                    <th className="py-2.5 px-3">交易說明</th>
                    <th className="py-2.5 px-3">自動辨識分類</th>
                    <th className="py-2.5 px-3 text-right">金額</th>
                    <th className="py-2.5 px-3 text-center">狀態</th>
                    <th className="py-2.5 px-3 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((row) => {
                    const badge = getCategoryBadgeStyle(row.category);
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{row.date}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{row.description}</td>
                        <td className="py-2.5 px-3">
                          <select
                            value={row.category}
                            onChange={(e) => handleChangeCategory(row.id, e.target.value as TransactionCategory)}
                            className="text-xs border border-slate-200 rounded px-2 py-1 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                          >
                            <option value="FIXED_HOUSING">固定開銷：房貸 / 房租 / 管理費</option>
                            <option value="FIXED_LOAN">固定開銷：車貸 / 信貸 / 學貸</option>
                            <option value="FIXED_INSURANCE">固定開銷：保費 / 規費</option>
                            <option value="NEEDS">浮動必要 (飲食、水電、交通)</option>
                            <option value="WANTS">想要享受 (娛樂、聚餐、購物)</option>
                            <option value="INVESTMENT">投資增值 (股票、ETF、基金)</option>
                            <option value="SAVINGS">儲蓄存款 (數位活存、備用金)</option>
                            <option value="SALARY">正職薪資收入</option>
                            <option value="BONUS">獎金 / 股息紅利</option>
                            <option value="OTHER">其他</option>
                          </select>
                        </td>
                        <td className={`py-2.5 px-3 text-right font-bold whitespace-nowrap ${
                          row.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                        }`}>
                          {row.type === 'INCOME' ? `+${formatCurrency(row.amount)}` : `-${formatCurrency(row.amount)}`}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {row.isDuplicate ? (
                            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-medium inline-flex items-center">
                              <AlertTriangle className="w-3 h-3 mr-0.5" /> 疑似重複
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-medium inline-flex items-center">
                              <CheckCircle2 className="w-3 h-3 mr-0.5" /> 正常
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleDeleteRow(row.id)}
                            className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 底部操作按鈕 */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="text-xs text-slate-400">
            {parsedRows.length > 0 && `已確認 ${parsedRows.length} 筆資料，將自動更新您的淨值與 50/30/20 比例`}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              disabled={parsedRows.length === 0}
              onClick={handleConfirmImport}
              className={`px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-all ${
                parsedRows.length > 0
                  ? 'bg-brand-600 hover:bg-brand-700'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              確認批次匯入 ({parsedRows.length} 筆)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
