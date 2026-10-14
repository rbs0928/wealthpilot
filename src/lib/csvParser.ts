import { Transaction, TransactionCategory, TransactionType } from './types';
import { autoCategorize } from './categorizer';

export interface ParsedCsvRow {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  isDuplicate?: boolean;
}

/**
 * 簡易而穩健的 CSV 解析函式
 */
export function parseBankCsv(csvText: string, existingTransactions: Transaction[] = []): ParsedCsvRow[] {
  // 1. 去除 UTF-8 BOM
  let cleanText = csvText.replace(/^\uFEFF/, '').trim();
  if (!cleanText) return [];

  // 2. 切割每一行
  const lines = cleanText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  // 3. 解析標題列
  const delimiter = detectDelimiter(lines[0]);
  const headers = splitCsvLine(lines[0], delimiter).map((h) => h.trim().toLowerCase());

  // 尋找關鍵欄位索引
  const dateColIdx = headers.findIndex((h) =>
    h.includes('日') || h.includes('date') || h.includes('時間')
  );
  const descColIdx = headers.findIndex((h) =>
    h.includes('說明') || h.includes('摘要') || h.includes('項目') ||
    h.includes('店') || h.includes('商戶') || h.includes('desc') || h.includes('memo')
  );
  const amountColIdx = headers.findIndex((h) =>
    h.includes('金額') || h.includes('支出') || h.includes('扣款') ||
    h.includes('消費') || h.includes('amount') || h.includes('debit')
  );
  const incomeColIdx = headers.findIndex((h) =>
    h.includes('收入') || h.includes('存入') || h.includes('credit')
  );

  const results: ParsedCsvRow[] = [];

  // 4. 解析每一筆資料列
  for (let i = 1; i < lines.length; i++) {
    const rawCols = splitCsvLine(lines[i], delimiter);
    if (rawCols.length < 2) continue;

    // 解析日期
    let dateStr = dateColIdx >= 0 ? rawCols[dateColIdx]?.trim() : '';
    dateStr = normalizeDate(dateStr);

    // 解析說明
    let desc = descColIdx >= 0 ? rawCols[descColIdx]?.trim() : `交易明細 #${i}`;
    desc = desc.replace(/^["']|["']$/g, '').trim();

    // 解析金額
    let amount = 0;
    let type: TransactionType = 'EXPENSE';

    if (incomeColIdx >= 0 && rawCols[incomeColIdx] && cleanNumber(rawCols[incomeColIdx]) > 0) {
      amount = cleanNumber(rawCols[incomeColIdx]);
      type = 'INCOME';
    } else if (amountColIdx >= 0 && rawCols[amountColIdx]) {
      const parsedVal = cleanNumber(rawCols[amountColIdx]);
      amount = Math.abs(parsedVal);
      // 若金額本身為負數或有收入備註，可辨識為收入
      if (parsedVal < 0 && !desc.includes('支出')) {
        type = 'INCOME';
      }
    } else {
      // 嘗試找第一個數字欄位
      for (const col of rawCols) {
        const val = cleanNumber(col);
        if (val > 0) {
          amount = val;
          break;
        }
      }
    }

    if (amount <= 0 || !desc) continue;

    // 自動歸類
    const catResult = autoCategorize(desc, type);

    // 檢查是否與現有交易重複 (日期相同、金額相同、說明相似)
    const isDuplicate = existingTransactions.some((t) =>
      t.date === dateStr &&
      Math.abs(t.amount - amount) < 1 &&
      (t.description.includes(desc) || desc.includes(t.description))
    );

    results.push({
      id: `csv-${Date.now()}-${i}`,
      date: dateStr,
      description: desc,
      amount,
      type: catResult.type,
      category: catResult.category,
      isDuplicate,
    });
  }

  return results;
}

/**
 * 偵測分隔符號 (, 或 \t 或 ;)
 */
function detectDelimiter(headerLine: string): string {
  if (headerLine.includes('\t')) return '\t';
  if (headerLine.includes(';') && !headerLine.includes(',')) return ';';
  return ',';
}

/**
 * 安全處理含引號的 CSV 欄位切割
 */
function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * 清理金額數字（移除 $, NT$, 千分位逗點）
 */
function cleanNumber(str: string): number {
  if (!str) return 0;
  const cleaned = str.replace(/[^\d.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * 正規化日期字串為 YYYY-MM-DD
 * 支援：2026/10/12, 2026-10-12, 113/10/12 (民國年轉換)
 */
function normalizeDate(raw: string): string {
  if (!raw) return new Date().toISOString().split('T')[0];

  const cleaned = raw.replace(/[^\d/-]/g, '').trim();
  const parts = cleaned.split(/[/ -]/).filter(Boolean);

  if (parts.length === 3) {
    let year = parseInt(parts[0], 10);
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');

    // 民國年轉換 (例如 113 -> 2024, 115 -> 2026)
    if (year < 1900 && year > 0) {
      year += 1911;
    }

    return `${year}-${month}-${day}`;
  }

  return new Date().toISOString().split('T')[0];
}
