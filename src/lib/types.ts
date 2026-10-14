export type TransactionCategory = 
  | 'FIXED_HOUSING'   // 固定開銷：房租、房貸、大樓管理費
  | 'FIXED_LOAN'      // 固定開銷：車貸、個人信貸、學貸
  | 'FIXED_INSURANCE' // 固定開銷：壽險、產險、健保、定期規費
  | 'NEEDS'           // 浮動必要：日常飲食、水電、交通通勤、醫療
  | 'WANTS'           // 想要享受：餐飲聚會、娛樂、購物、串流訂閱
  | 'SAVINGS'         // 儲蓄存款：緊急預備金、高利活存
  | 'INVESTMENT'      // 投資增值：股票、ETF、基金、定期定額
  | 'SALARY'          // 正職薪資
  | 'BONUS'           // 接案兼職、獎金紅利
  | 'OTHER';          // 其他雜支

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string;
  isRecurring?: boolean;
}

export type AssetCategory = 'CASH' | 'STOCK' | 'REAL_ESTATE' | 'CRYPTO';
export type LiabilityCategory = 'CREDIT_CARD' | 'MORTGAGE' | 'PERSONAL_LOAN';

export interface AssetLiabilityItem {
  id: string;
  type: 'ASSET' | 'LIABILITY';
  subCategory: AssetCategory | LiabilityCategory;
  name: string;
  value: number;
  interestRate?: number;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'EMERGENCY_FUND' | 'HOUSE_DOWNPAYMENT' | 'RETIREMENT_FIRE' | 'TRAVEL' | 'EDUCATION';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export type RiskProfile = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';

export interface PortfolioHolding {
  id: string;
  name: string;
  ticker: string;
  assetClass: 'US_EQUITY' | 'GLOBAL_EQUITY' | 'BOND' | 'CASH' | 'COMMODITY';
  currentAmount: number;
  targetPercentage: number;
}

export interface UserFinancialProfile {
  monthlyIncome: number;
  monthlyFixedObligations: number; // 房貸、車貸、信貸、房租
  monthlyVariableNeeds: number;    // 浮動日常必要開銷
  monthlyWants: number;            // 想要享受
  monthlySavings: number;          // 儲蓄與投資
  freeCashflow: number;            // 扣除所有支出後之自由現金流
  savingsRate: number;
  fixedObligationRatio: number;    // 固定開銷佔收入比 (建議 < 35~40%)
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  emergencyFundMonths: number;
  healthScore: number;
}

// 全球市場行情資料型別
export interface MarketTickerData {
  ticker: string;
  name: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
  assetClass: 'GLOBAL_STOCK' | 'US_STOCK' | 'TECH' | 'TAIWAN_STOCK' | 'BOND';
  trend: 'BULLISH' | 'PULLBACK' | 'NEUTRAL';
  trendDescription: string;
  updatedTime: string;
}

// 智慧投資建議產出型別
export interface InvestmentAdvice {
  status: 'OPTIMAL' | 'DEFENSIVE' | 'OPPORTUNITY';
  title: string;
  summary: string;
  monthlyFreeCashflow: number;
  recommendedDcaAmount: number;
  recommendedCashBuffer: number;
  debtAlertMessage?: string;
  emergencyFundStatus: string;
  marketEnvironmentDescription: string;
  allocationStrategy: Array<{
    asset: string;
    ticker: string;
    percentage: number;
    amount: number;
    rationale: string;
  }>;
  actionableSteps: string[];
}
