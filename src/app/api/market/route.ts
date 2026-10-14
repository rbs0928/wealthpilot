import { NextResponse } from 'next/server';
import { MarketTickerData } from '@/lib/types';
import { DEFAULT_MARKET_TICKERS } from '@/lib/marketData';

export const dynamic = 'force-dynamic';

const SYMBOL_MAPPING: Record<string, { querySymbol: string; name: string; assetClass: MarketTickerData['assetClass'] }> = {
  VT: {
    querySymbol: 'VT',
    name: '全球全市場股票 ETF (Vanguard Total World Stock)',
    assetClass: 'GLOBAL_STOCK',
  },
  VOO: {
    querySymbol: 'VOO',
    name: '標普 500 指數 ETF (Vanguard S&P 500)',
    assetClass: 'US_STOCK',
  },
  QQQ: {
    querySymbol: 'QQQ',
    name: '那斯達克 100 科技旗艦 (Invesco QQQ)',
    assetClass: 'TECH',
  },
  '0050': {
    querySymbol: '0050.TW',
    name: '元大台灣卓越 50 (台灣市值型龍頭 ETF)',
    assetClass: 'TAIWAN_STOCK',
  },
  BND: {
    querySymbol: 'BND',
    name: '全美總體投資級債券 ETF (Vanguard Total Bond)',
    assetClass: 'BOND',
  },
};

export async function GET() {
  try {
    const promises = Object.entries(SYMBOL_MAPPING).map(async ([tickerKey, info]) => {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(info.querySymbol)}?interval=1d&range=2d`;
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          next: { revalidate: 30 }, // 快取 30 秒
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch ${info.querySymbol}: status ${res.status}`);
        }

        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) {
          throw new Error(`Invalid data structure for ${info.querySymbol}`);
        }

        const currentPrice = meta.regularMarketPrice || meta.fulldayPrice || 0;
        const previousClose = meta.chartPreviousClose || currentPrice;
        const change = parseFloat((currentPrice - previousClose).toFixed(2));
        const changePercent = previousClose > 0 ? parseFloat(((change / previousClose) * 100).toFixed(2)) : 0;
        const currency = meta.currency || (tickerKey === '0050' ? 'TWD' : 'USD');

        let trend: MarketTickerData['trend'] = 'NEUTRAL';
        let trendDescription = '高檔整理，穩健長線佈局';

        if (changePercent >= 0.5) {
          trend = 'BULLISH';
          trendDescription = '多頭買盤強勁，順勢定期定額';
        } else if (changePercent <= -0.5) {
          trend = 'PULLBACK';
          trendDescription = '技術性回檔，可逢低單筆加碼';
        }

        return {
          ticker: tickerKey,
          name: info.name,
          price: currentPrice,
          currency,
          change,
          changePercent,
          assetClass: info.assetClass,
          trend,
          trendDescription,
          updatedTime: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        } as MarketTickerData;
      } catch (err) {
        console.warn(`Fallback for ${tickerKey}:`, err);
        const fallback = DEFAULT_MARKET_TICKERS.find((t) => t.ticker === tickerKey);
        return fallback || {
          ticker: tickerKey,
          name: info.name,
          price: 100,
          currency: 'USD',
          change: 0,
          changePercent: 0,
          assetClass: info.assetClass,
          trend: 'NEUTRAL',
          trendDescription: '行情同步中',
          updatedTime: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
        };
      }
    });

    const results = await Promise.all(promises);
    return NextResponse.json({
      success: true,
      source: 'LIVE_YAHOO_FINANCE_API',
      timestamp: new Date().toISOString(),
      data: results,
    });
  } catch (error) {
    console.error('Market API Route Error:', error);
    return NextResponse.json({
      success: true,
      source: 'FALLBACK_CACHE',
      timestamp: new Date().toISOString(),
      data: DEFAULT_MARKET_TICKERS,
    });
  }
}
