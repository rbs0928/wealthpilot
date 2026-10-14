import { Transaction, AssetLiabilityItem, FinancialGoal, PortfolioHolding } from './types';

export const initialTransactions: Transaction[] = [
  // 1. 收入
  { id: 'tx-1', type: 'INCOME', category: 'SALARY', amount: 85000, description: '本月正職本薪', date: '2026-10-05', isRecurring: true },
  { id: 'tx-2', type: 'INCOME', category: 'BONUS', amount: 12000, description: '自由接案與被動股利', date: '2026-10-08' },

  // 2. 固定開銷 (房貸、車貸、信貸、保險、管理費)
  { id: 'tx-3', type: 'EXPENSE', category: 'FIXED_HOUSING', amount: 26000, description: '中信房屋貸款本息攤還', date: '2026-10-01', isRecurring: true },
  { id: 'tx-4', type: 'EXPENSE', category: 'FIXED_HOUSING', amount: 2200, description: '社區大樓管委會管理費', date: '2026-10-02', isRecurring: true },
  { id: 'tx-5', type: 'EXPENSE', category: 'FIXED_LOAN', amount: 5500, description: '個人就學貸款/信用貸款分期', date: '2026-10-03', isRecurring: true },
  { id: 'tx-6', type: 'EXPENSE', category: 'FIXED_INSURANCE', amount: 3200, description: '人壽與實支實付醫療險保費', date: '2026-10-03', isRecurring: true },

  // 3. 浮動必要生活支出 (NEEDS)
  { id: 'tx-7', type: 'EXPENSE', category: 'NEEDS', amount: 9500, description: '全聯採買與三餐基本伙食', date: '2026-10-04' },
  { id: 'tx-8', type: 'EXPENSE', category: 'NEEDS', amount: 3500, description: '水電瓦斯與電信網路費', date: '2026-10-06', isRecurring: true },
  { id: 'tx-9', type: 'EXPENSE', category: 'NEEDS', amount: 2800, description: '通勤捷運與機車交通加油', date: '2026-10-07', isRecurring: true },

  // 4. 想要享受開銷 (WANTS)
  { id: 'tx-10', type: 'EXPENSE', category: 'WANTS', amount: 390, description: 'Netflix 影音串流訂閱', date: '2026-10-02', isRecurring: true },
  { id: 'tx-11', type: 'EXPENSE', category: 'WANTS', amount: 168, description: 'Spotify 音樂串流訂閱', date: '2026-10-02', isRecurring: true },
  { id: 'tx-12', type: 'EXPENSE', category: 'WANTS', amount: 1500, description: '健身房會員月費', date: '2026-10-03', isRecurring: true },
  { id: 'tx-13', type: 'EXPENSE', category: 'WANTS', amount: 4800, description: '週末朋友聚餐與娛樂', date: '2026-10-09' },

  // 5. 投資增值與儲蓄 (INVESTMENT / SAVINGS)
  { id: 'tx-14', type: 'EXPENSE', category: 'INVESTMENT', amount: 22000, description: '定期定額全球股票 ETF (VT / 0050)', date: '2026-10-06', isRecurring: true },
  { id: 'tx-15', type: 'EXPENSE', category: 'SAVINGS', amount: 8000, description: '數位高利活存備用金', date: '2026-10-06', isRecurring: true },
];

export const initialAssetsLiabilities: AssetLiabilityItem[] = [
  // 資產
  { id: 'as-1', type: 'ASSET', subCategory: 'CASH', name: '高利數位活存帳戶 (緊急預備金)', value: 350000, interestRate: 2.1 },
  { id: 'as-2', type: 'ASSET', subCategory: 'CASH', name: '日常薪轉與生活帳戶', value: 58000 },
  { id: 'as-3', type: 'ASSET', subCategory: 'STOCK', name: '美股全球指數 ETF (VT + BND)', value: 480000 },
  { id: 'as-4', type: 'ASSET', subCategory: 'STOCK', name: '台股指數 ETF (0050 / 006208)', value: 295000 },
  { id: 'as-5', type: 'ASSET', subCategory: 'CRYPTO', name: '主流加密貨幣 (BTC / ETH)', value: 65000 },
  // 負債
  { id: 'lb-1', type: 'LIABILITY', subCategory: 'MORTGAGE', name: '房屋貸款剩餘本金', value: 6500000, interestRate: 2.18 },
  { id: 'lb-2', type: 'LIABILITY', subCategory: 'PERSONAL_LOAN', name: '個人就學/信用貸款餘額', value: 58000, interestRate: 1.65 },
  { id: 'lb-3', type: 'LIABILITY', subCategory: 'CREDIT_CARD', name: '本期信用卡應繳款項', value: 14500, interestRate: 0 },
];

export const initialGoals: FinancialGoal[] = [
  {
    id: 'g-1',
    name: '健全緊急備用金 (6個月生活費)',
    targetAmount: 360000,
    currentAmount: 350000,
    targetDate: '2026-12-31',
    category: 'EMERGENCY_FUND',
    priority: 'HIGH',
  },
  {
    id: 'g-2',
    name: '首購自住成家裝修儲蓄',
    targetAmount: 1200000,
    currentAmount: 480000,
    targetDate: '2028-12-31',
    category: 'HOUSE_DOWNPAYMENT',
    priority: 'HIGH',
  },
  {
    id: 'g-3',
    name: 'FIRE 財務自由提早退休計畫',
    targetAmount: 18000000,
    currentAmount: 840000,
    targetDate: '2045-12-31',
    category: 'RETIREMENT_FIRE',
    priority: 'MEDIUM',
  },
];

export const initialHoldings: PortfolioHolding[] = [
  { id: 'h-1', name: '全球股市 ETF (Vanguard Total World Stock)', ticker: 'VT', assetClass: 'GLOBAL_EQUITY', currentAmount: 350000, targetPercentage: 50 },
  { id: 'h-2', name: '台股市值型 ETF (元大台灣50)', ticker: '0050', assetClass: 'US_EQUITY', currentAmount: 295000, targetPercentage: 30 },
  { id: 'h-3', name: '美國總體債券 ETF (Vanguard Total Bond)', ticker: 'BND', assetClass: 'BOND', currentAmount: 130000, targetPercentage: 15 },
  { id: 'h-4', name: '避險黃金與現金緩衝', ticker: 'GLD/CASH', assetClass: 'CASH', currentAmount: 50000, targetPercentage: 5 },
];
