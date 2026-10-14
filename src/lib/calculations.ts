import { Transaction, AssetLiabilityItem, FinancialGoal } from './types';

/**
 * 計算複利投資成長 (定期定額 DCA)
 * @param initialPrincipal 初始投入本金
 * @param monthlyContribution 每月定期定額投入
 * @param annualRate 年化報酬率 (小數, 例如 0.07 代表 7%)
 * @param years 投資年數
 */
export function calculateDCAProjection(
  initialPrincipal: number,
  monthlyContribution: number,
  annualRate: number,
  years: number
) {
  const monthlyRate = annualRate / 12;
  const totalMonths = years * 12;
  const result: Array<{
    year: number;
    totalContributed: number;
    futureValue: number;
    interestEarned: number;
  }> = [];

  let currentFV = initialPrincipal;
  let totalContributed = initialPrincipal;

  for (let m = 1; m <= totalMonths; m++) {
    currentFV = currentFV * (1 + monthlyRate) + monthlyContribution;
    totalContributed += monthlyContribution;

    if (m % 12 === 0) {
      const year = m / 12;
      result.push({
        year,
        totalContributed: Math.round(totalContributed),
        futureValue: Math.round(currentFV),
        interestEarned: Math.round(currentFV - totalContributed),
      });
    }
  }

  return result;
}

/**
 * 計算生活開銷「省流轉投資」的增值效應
 */
export function calculateSavingToWealthImpact(
  monthlySaved: number,
  annualRate: number = 0.07,
  years: number = 20
) {
  const projection = calculateDCAProjection(0, monthlySaved, annualRate, years);
  const finalFV = projection[projection.length - 1]?.futureValue || 0;
  const totalContributed = projection[projection.length - 1]?.totalContributed || 0;
  const profit = finalFV - totalContributed;

  return {
    monthlySaved,
    years,
    totalContributed,
    finalFV,
    profit,
    multiplier: totalContributed > 0 ? (finalFV / totalContributed).toFixed(2) : '1.0',
  };
}

/**
 * 計算 4% 法則的 FIRE 退休本金需求
 */
export function calculateFireTarget(annualExpense: number, safeWithdrawalRate: number = 0.04) {
  return Math.round(annualExpense / safeWithdrawalRate);
}

/**
 * 財務健康度綜合評分 (0 ~ 100 分)
 */
export function calculateFinancialHealthScore(params: {
  savingsRate: number; // e.g. 0.25 (25%)
  emergencyFundMonths: number; // e.g. 5
  debtToAssetRatio: number; // e.g. 0.3 (30%)
  hasInvestments: boolean;
}): { score: number; level: string; tips: string[] } {
  let score = 50; // base score
  const tips: string[] = [];

  // 1. 儲蓄率評分 (佔 25 分)
  if (params.savingsRate >= 0.3) {
    score += 25;
    tips.push('儲蓄率超過 30%，現金流儲備極佳！');
  } else if (params.savingsRate >= 0.2) {
    score += 20;
    tips.push('儲蓄率符合 20% 黃金標準，保持良好節奏。');
  } else if (params.savingsRate > 0.05) {
    score += 10;
    tips.push('儲蓄率偏低，建議檢視非必要「想要」開銷以提升儲蓄空間。');
  } else {
    score -= 10;
    tips.push('當前收支幾無結餘或呈現赤字，建議啟動緊急支出優化。');
  }

  // 2. 緊急備用金 (佔 25 分)
  if (params.emergencyFundMonths >= 6) {
    score += 25;
  } else if (params.emergencyFundMonths >= 3) {
    score += 18;
    tips.push('備用金水位為 3~6 個月，安全防護良好。');
  } else {
    score += 5;
    tips.push('緊急備用金低於 3 個月，建議優先補足至安全水位以防突發變故。');
  }

  // 3. 負債比 (佔 25 分)
  if (params.debtToAssetRatio === 0) {
    score += 25;
  } else if (params.debtToAssetRatio < 0.3) {
    score += 20;
  } else if (params.debtToAssetRatio < 0.6) {
    score += 10;
    tips.push('負債比率介於 30%~60%，注意利息支出控制。');
  } else {
    score -= 10;
    tips.push('負債比率偏高（超過 60%），建議優先償還高息債務。');
  }

  // 4. 投資部位 (佔 25 分)
  if (params.hasInvestments) {
    score += 25;
  } else {
    tips.push('尚未配置投資部位，長期資產容易受到通膨侵蝕，建議啟動指數化定期定額。');
  }

  score = Math.min(100, Math.max(0, score));

  let level = '良好 (Healthy)';
  if (score >= 85) level = '卓越 (Excellent)';
  else if (score >= 70) level = '良好 (Healthy)';
  else if (score >= 50) level = '中等 (Moderate)';
  else level = '亟需改善 (Attention Needed)';

  return { score, level, tips };
}
