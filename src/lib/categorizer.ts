import { TransactionCategory, TransactionType } from './types';

interface Rule {
  keywords: string[];
  category: TransactionCategory;
  type: TransactionType;
}

// 台灣在地消費與固定開銷關鍵字規則庫
const DEFAULT_RULES: Rule[] = [
  // 1. 固定開銷：房屋與租金 (FIXED_HOUSING)
  {
    keywords: [
      '房貸', '房屋貸款', '購屋貸款', '本息攤還', '土地銀行房貸', '台灣銀行房貸', '中信房貸',
      '國泰房貸', '台新房貸', '玉山房貸', '房租', '房屋租金', '店租', '租賃', '租金',
      '管理費', '大樓管理費', '管委會', '公寓管理費'
    ],
    category: 'FIXED_HOUSING',
    type: 'EXPENSE',
  },

  // 2. 固定開銷：各類信貸與車貸 (FIXED_LOAN)
  {
    keywords: [
      '車貸', '汽車貸款', '汽車分期', '機車分期', '裕融', '和潤', '中租',
      '信貸', '信用貸款', '個人信貸', '循環信貸', '就學貸款', '學貸', '台灣銀行學貸',
      '貸款本息', '分期本金', '貸款扣繳'
    ],
    category: 'FIXED_LOAN',
    type: 'EXPENSE',
  },

  // 3. 固定開銷：人身與財產保險 (FIXED_INSURANCE)
  {
    keywords: [
      '保費', '人壽', '產險', '南山人壽', '國泰人壽', '富邦人壽', '富邦產險',
      '新光人壽', '台灣人壽', '全球人壽', '三商美邦', '保險費', '儲蓄險',
      '醫療險', '癌症險', '意外險', '車險', '健保費', '勞保費', '國民年金'
    ],
    category: 'FIXED_INSURANCE',
    type: 'EXPENSE',
  },

  // 4. 浮動必要開銷 (NEEDS - 飲食、水電、交通、醫療)
  {
    keywords: [
      '全聯', '家樂福', '大潤發', '美廉社', '愛買', '傳統市場', '果菜市場', '生鮮',
      '7-11', '7-eleven', '統一超商', '全家便利商店', '全家', 'family mart', '萊爾富', 'ok超商',
      '台電', '台灣電力', '自來水', '瓦斯', '天然氣', '欣欣天然氣',
      '中華電信', '遠傳', '台灣大哥大', '電信費', '寬頻', '光世代',
      '捷運', '北捷', '高捷', '悠遊卡', '一卡通', 'icash', '台鐵', '高鐵', '台灣高鐵',
      '中油', '台亞', '加油站', '車麻吉', '停車費', 'etc', '遠通電收', '公車',
      '診所', '醫院', '健保特約', '牙醫', '眼科', '藥局', '大樹藥局', '丁丁藥局'
    ],
    category: 'NEEDS',
    type: 'EXPENSE',
  },

  // 5. 想要享受開銷 (WANTS - 聚餐、娛樂、網購、訂閱)
  {
    keywords: [
      '星巴克', 'starbucks', '路易莎', 'louisa', 'cama', '麻古茶坊', '50嵐', '可不可', '清心', '珍煮丹',
      'uber eats', 'ubereats', 'foodpanda', '熊貓外送', '鼎泰豐', '乾杯', '瓦城', '饗食天堂', '王品',
      'netflix', 'spotify', 'disney+', 'disney plus', 'youtube premium', 'apple.com/bill', 'icloud', 'chatgpt',
      '蝦皮', 'shopee', 'momo', '酷澎', 'coupang', 'pchome', '博客來',
      '威秀影城', '國賓影城', '秀泰影城', '錢櫃', '好樂迪', 'steam', 'playstation', 'nintendo',
      '好市多', 'costco', 'uniqlo', 'zara', 'h&m', '無印良品', 'muji',
      '健身工廠', 'world gym', '健身房', '瑜珈', 'klook', 'kkday', 'agoda', 'booking.com'
    ],
    category: 'WANTS',
    type: 'EXPENSE',
  },

  // 6. 投資增值 (INVESTMENT - 券商扣款、定期定額)
  {
    keywords: [
      '證券', '國泰證券', '元大證券', '富邦證券', '永豐金證券', '凱基證券', '群益證券', '玉山證券',
      '定期定額', '大戶投', '複委託', '美股扣款', '基金申購', '投信', '元大投信', '國泰投信', '富邦投信'
    ],
    category: 'INVESTMENT',
    type: 'EXPENSE',
  },

  // 7. 儲蓄存款 (SAVINGS - 數位帳戶、備用金)
  {
    keywords: [
      '定存', '定期存款', '備用金', '高利活存', 'richart', '大戶', 'dawho', 'snex', '數位帳戶轉存'
    ],
    category: 'SAVINGS',
    type: 'EXPENSE',
  },

  // 8. 收入：薪資 (SALARY)
  {
    keywords: [
      '薪資', '薪水', '本薪', '薪資轉帳', '薪轉', '工資', '勞務報酬'
    ],
    category: 'SALARY',
    type: 'INCOME',
  },

  // 9. 收入：獎金與被動收益 (BONUS / INVESTMENT INCOME)
  {
    keywords: [
      '獎金', '年終', '紅利', '績效獎金', '三節', '股利', '股息', '現金股利', '配息', '利息收入', '接案'
    ],
    category: 'BONUS',
    type: 'INCOME',
  },
];

/**
 * 智慧自動歸類交易項目
 */
export function autoCategorize(description: string, defaultType: TransactionType = 'EXPENSE'): {
  category: TransactionCategory;
  type: TransactionType;
  isFixed: boolean;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
} {
  const normalized = description.toLowerCase().trim();

  // 檢查預設規則庫
  for (const rule of DEFAULT_RULES) {
    for (const kw of rule.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        const isFixed = isFixedExpense(rule.category);
        return {
          category: rule.category,
          type: rule.type,
          isFixed,
          confidence: 'HIGH',
        };
      }
    }
  }

  // 預設Fallback
  return {
    category: defaultType === 'INCOME' ? 'OTHER' : 'NEEDS',
    type: defaultType,
    isFixed: false,
    confidence: 'LOW',
  };
}

/**
 * 判斷該分類是否為不可輕易更動的「固定開銷」
 */
export function isFixedExpense(category: TransactionCategory): boolean {
  return (
    category === 'FIXED_HOUSING' ||
    category === 'FIXED_LOAN' ||
    category === 'FIXED_INSURANCE'
  );
}

/**
 * 取得分類之中文友善名稱
 */
export function getCategoryDisplayName(category: TransactionCategory): string {
  switch (category) {
    case 'FIXED_HOUSING':
      return '固定房產：房租 / 房貸 / 管理費';
    case 'FIXED_LOAN':
      return '固定債務：車貸 / 信貸 / 學貸';
    case 'FIXED_INSURANCE':
      return '固定保障：人身保險 / 規費';
    case 'NEEDS':
      return '浮動必要：日常飲食 / 水電 / 交通';
    case 'WANTS':
      return '享受娛樂：聚餐 / 購物 / 串流訂閱';
    case 'INVESTMENT':
      return '投資增值：股票 / ETF / 定期定額';
    case 'SAVINGS':
      return '儲蓄存款：緊急預備金 / 活存';
    case 'SALARY':
      return '正職薪資所得';
    case 'BONUS':
      return '獎金紅利 / 股利投資收益';
    default:
      return '其他日常收支';
  }
}

/**
 * 取得分類專屬色彩樣式
 */
export function getCategoryBadgeStyle(category: TransactionCategory): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  switch (category) {
    case 'FIXED_HOUSING':
      return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', label: '固定開銷：房貸/房租' };
    case 'FIXED_LOAN':
      return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', label: '固定開銷：車貸/信貸' };
    case 'FIXED_INSURANCE':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', label: '固定開銷：保費規費' };
    case 'NEEDS':
      return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', label: '浮動必要 (Needs)' };
    case 'WANTS':
      return { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', label: '想要享受 (Wants)' };
    case 'INVESTMENT':
      return { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', label: '投資增值 (Invest)' };
    case 'SAVINGS':
      return { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200', label: '儲蓄存款 (Savings)' };
    case 'SALARY':
      return { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200', label: '主動薪資' };
    case 'BONUS':
      return { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200', label: '獎金/被動收益' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200', label: '一般收支' };
  }
}
