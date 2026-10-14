import { InvestmentAdvice, MarketTickerData, Transaction } from './types';
import { getGlobalMarketMacroPulse } from './marketData';
import { isFixedExpense } from './categorizer';

interface AdvisoryInput {
  transactions: Transaction[];
  emergencyFundMonths: number;
  totalAssets: number;
  totalLiabilities: number;
  marketData?: MarketTickerData[];
}

/**
 * 依據個人消費模式、固定開銷負擔與全球市場動態，產出「智慧投資建議」
 */
export function generateSmartInvestmentAdvice(input: AdvisoryInput): InvestmentAdvice {
  const { transactions, emergencyFundMonths, totalAssets, totalLiabilities } = input;
  const macro = getGlobalMarketMacroPulse();

  // 1. 拆解個人收支結構
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  // 固定開銷：房貸、車貸、信貸、房租、保險
  const fixedObligations = transactions
    .filter((t) => t.type === 'EXPENSE' && isFixedExpense(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  // 浮動必要開銷
  const variableNeeds = transactions
    .filter((t) => t.type === 'EXPENSE' && t.category === 'NEEDS')
    .reduce((sum, t) => sum + t.amount, 0);

  // 享受娛樂
  const wants = transactions
    .filter((t) => t.type === 'EXPENSE' && t.category === 'WANTS')
    .reduce((sum, t) => sum + t.amount, 0);

  // 現有已投入之投資儲蓄
  const currentInvestments = transactions
    .filter((t) => t.type === 'EXPENSE' && (t.category === 'INVESTMENT' || t.category === 'SAVINGS'))
    .reduce((sum, t) => sum + t.amount, 0);

  // 扣除生活日常開銷後的「淨自由現金流」 (可自由調配於儲蓄或投資)
  const totalLivingExpenses = fixedObligations + variableNeeds + wants;
  const rawFreeCashflow = Math.max(0, totalIncome - totalLivingExpenses);

  // 固定支出佔收入比例
  const effectiveIncome = totalIncome > 0 ? totalIncome : 1;
  const fixedRatio = (fixedObligations / effectiveIncome) * 100;

  // 2. 評估防禦狀態與投資空間
  let status: InvestmentAdvice['status'] = 'OPTIMAL';
  let title = '穩健進攻型：現金流充沛，建議最大化全球複利投資';
  let summary = '';
  let debtAlertMessage: string | undefined = undefined;

  let recommendedDcaPct = 0.8; // 預設將結餘的 80% 投入投資，20% 作為流動緩衝
  let equityWeight = 0.75;
  let bondWeight = 0.20;
  let cashBufferWeight = 0.05;

  // 判定狀況 A：固定開銷過高（房貸+信貸佔比超過 45%）
  if (fixedRatio > 45) {
    status = 'DEFENSIVE';
    title = '防守優先型：固定負擔偏高，加強備用金與防禦性債券';
    debtAlertMessage = `您的房貸、車貸與信貸等固定開銷佔月收入高達 ${fixedRatio.toFixed(1)}%（超過 40% 安全警戒線）。建議優先確保資金流動性，避免市場波動時被迫賣股變現。`;
    recommendedDcaPct = 0.6; // 降低投資比率，保留更多現金
    equityWeight = 0.50;
    bondWeight = 0.35;
    cashBufferWeight = 0.15;
  }
  // 判定狀況 B：緊急備用金不足 3 個月
  else if (emergencyFundMonths < 3) {
    status = 'DEFENSIVE';
    title = '防守奠基型：緊急備用金水位偏低，建議先提撥安全防護網';
    summary = `目前備用金僅可支撐 ${emergencyFundMonths.toFixed(1)} 個月。投資前應先建立 3~6 個月的安全防護墊。`;
    recommendedDcaPct = 0.5; // 一半存備用金，一半定期定額
    equityWeight = 0.60;
    bondWeight = 0.20;
    cashBufferWeight = 0.20;
  }
  // 判定狀況 C：現金流與備用金極佳，市場處於擴張期
  else {
    status = 'OPTIMAL';
    title = '乘勝追擊型：現金流健康，全力啟動全球指數化投資';
    summary = `扣除固定房貸/房租與日常花費後，本月擁有 ${new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(rawFreeCashflow)} 的自由現金流，財務體質非常健康！`;
    recommendedDcaPct = 0.85;
    equityWeight = 0.80;
    bondWeight = 0.15;
    cashBufferWeight = 0.05;
  }

  // 3. 計算具體金額
  const recommendedDcaAmount = Math.round((rawFreeCashflow * recommendedDcaPct) / 500) * 500;
  const recommendedCashBuffer = rawFreeCashflow - recommendedDcaAmount;

  // 4. 動態生成資產配置建議清單
  const allocationStrategy = [
    {
      asset: '全球全市場股票',
      ticker: 'VT (美股) / 全球型 ETF',
      percentage: Math.round(equityWeight * 60),
      amount: Math.round(recommendedDcaAmount * (equityWeight * 0.6)),
      rationale: '網羅全球逾 9,000 家頂尖企業，免除單一國家風險，捕捉全球經濟長線增長。',
    },
    {
      asset: '台灣與美國龍頭權值',
      ticker: '0050 (台股) / VOO (S&P 500)',
      percentage: Math.round(equityWeight * 40),
      amount: Math.round(recommendedDcaAmount * (equityWeight * 0.4)),
      rationale: '聚焦美台科技與半導體龍頭核心資產，提供強大資本利得超額報酬動能。',
    },
    {
      asset: '綜合投資級公債',
      ticker: 'BND (債券 ETF)',
      percentage: Math.round(bondWeight * 100),
      amount: Math.round(recommendedDcaAmount * bondWeight),
      rationale: '在降息週期中鎖定殖利率收益，並在股市震盪時發揮優異的防守抗跌效果。',
    },
  ];

  // 5. 具體可落地的行動方針
  const actionableSteps: string[] = [
    `將本月自由結餘中的 ${new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(recommendedDcaAmount)} 設定為證券帳戶定期定額自動扣繳。`,
    `固定開銷（房貸/車貸/房租）目前佔比為 ${fixedRatio.toFixed(1)}%，保持在健康控制範圍內。`,
    `全球市場目前處於多頭格局，若遇大盤短線回檔 3%~5%，切勿恐慌停扣，反而是加速複利累積的優質加碼點。`,
  ];

  if (fixedRatio > 40) {
    actionableSteps.unshift('檢視信貸或車貸是否可爭取轉貸降息，或提撥部分獎金優先償還利率高於 4% 之無擔保債務。');
  }

  return {
    status,
    title,
    summary: summary || `綜合評估個人固定支出佔比 (${fixedRatio.toFixed(1)}%) 與全球市場即時景氣，為您量身打造最佳資金配置。`,
    monthlyFreeCashflow: rawFreeCashflow,
    recommendedDcaAmount,
    recommendedCashBuffer,
    debtAlertMessage,
    emergencyFundStatus: `${emergencyFundMonths.toFixed(1)} 個月覆蓋（安全標準為 3~6 個月）`,
    marketEnvironmentDescription: macro.globalHeadline,
    allocationStrategy,
    actionableSteps,
  };
}
