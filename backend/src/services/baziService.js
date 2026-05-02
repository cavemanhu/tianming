/**
 * 八字排盘服务
 * 核心算法：年柱、月柱、日柱、时柱的计算
 */

// 天干
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 属相对应地支
const ZODIAC_MAP = {
  '鼠': '子', '牛': '丑', '虎': '寅', '兔': '卯',
  '龙': '辰', '蛇': '巳', '马': '午', '羊': '未',
  '猴': '申', '鸡': '酉', '狗': '戌', '猪': '亥'
};

// 五行对应天干
const WU_XING_TIAN_GAN = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

// 五行对应地支
const WU_XING_DI_ZHI = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土',
  '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金',
  '戌': '土', '亥': '水'
};

// 月支对应的天干起始（年上起月诀）
// 甲己之年丙作首，乙庚之年戊为头
// 丙辛必定寻庚起，丁壬壬位顺行流
// 戊癸之年何方发，甲寅之上好追求
const YUE_GAN_START = {
  '甲': 2,  // 丙
  '乙': 4,  // 戊
  '丙': 6,  // 庚
  '丁': 9,  // 壬 (原错误: 8)
  '戊': 0,  // 甲
  '己': 2,  // 丙
  '庚': 4,  // 戊
  '辛': 6,  // 庚
  '壬': 9,  // 壬 (原错误: 8)
  '癸': 0   // 甲
};

// 日干查找表（1900-2100年，缩小范围用）
// 这个表很大，实际使用时需要计算或查表
// 这里用简化算法：知道1900年1月1日是戊子日（甲子日起始）

/**
 * 计算指定日期的八字
 * @param {number} year 年份
 * @param {number} month 月份(1-12)
 * @param {number} day 日期(1-31)
 * @param {string} timeStr 时辰，如"子时"、"丑时"等
 * @returns {Object} 八字对象
 */
function calculateBaZi(year, month, day, timeStr = '子时') {
  // 1. 计算年柱
  const nianZhu = calculateNianZhu(year);
  
  // 2. 计算月柱
  const yueZhu = calculateYueZhu(year, month, nianZhu.tianGan);
  
  // 3. 计算日柱（使用蔡勒公式变体）
  const riZhu = calculateRiZhu(year, month, day);
  
  // 4. 计算时柱
  const shiZhu = calculateShiZhu(timeStr, riZhu.tianGan);
  
  // 5. 计算五行分析
  const wuXingAnalysis = calculateWuXing(nianZhu, yueZhu, riZhu, shiZhu);
  
  // 6. 推断日主强弱
  const riZhuStrength = calculateRiZhuStrength(wuXingAnalysis, riZhu.tianGan);
  
  // 7. 大运计算
  const daYun = calculateDaYun(riZhu, year, month, day);
  
  return {
    nianZhu,    // 年柱
    yueZhu,     // 月柱
    riZhu,      // 日柱
    shiZhu,     // 时柱
    wuXingAnalysis,
    riZhuStrength,
    daYun,
    zodiac: getZodiac(year),
    birthday: { year, month, day, timeStr }
  };
}

/**
 * 计算年柱
 * 公式：年干 = (年份 - 3) % 10
 *       年支 = (年份 - 3) % 12
 * 例如：1984年，(1984-3)%10=1→甲，(1984-3)%12=9→申
 */
function calculateNianZhu(year) {
  const ganIndex = (year - 3) % 10;
  const zhiIndex = (year - 3) % 12;
  const adjustedGanIndex = ganIndex < 0 ? ganIndex + 10 : ganIndex;
  const adjustedZhiIndex = zhiIndex < 0 ? zhiIndex + 12 : zhiIndex;
  
  return {
    tianGan: TIAN_GAN[adjustedGanIndex],
    diZhi: DI_ZHI[adjustedZhiIndex],
    ganZhi: TIAN_GAN[adjustedGanIndex] + DI_ZHI[adjustedZhiIndex],
    wuXing: WU_XING_TIAN_GAN[TIAN_GAN[adjustedGanIndex]]
  };
}

/**
 * 计算月柱
 * 月干计算口诀：甲己之年丙作首，乙庚之年戊为头...
 * 即：年干对应的月干起始 + 月份 - 1
 */
function calculateYueZhu(year, month, nianGan) {
  // 获取该年月的起始天干索引
  const startIndex = YUE_GAN_START[nianGan];
  const ganIndex = (startIndex + month - 1) % 10;
  const zhiIndex = (month - 1) % 12;
  
  return {
    tianGan: TIAN_GAN[ganIndex],
    diZhi: DI_ZHI[zhiIndex],
    ganZhi: TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex],
    wuXing: WU_XING_TIAN_GAN[TIAN_GAN[ganIndex]],
    monthName: `农历${month}月`
  };
}

/**
 * 计算日柱
 * 使用蔡勒公式（Zeller's congruence）变体
 * 原理：已知1900年1月1日为甲子日
 */
function calculateRiZhu(year, month, day) {
  // 简化算法：计算从1900年1月1日（甲子）到目标日期的天数
  // 然后取模10和模12得到干支索引
  
  // 基准日期：1900年1月1日是甲子日
  const baseYear = 1900;
  const baseMonth = 1;
  const baseDay = 1;
  
  // 计算总天数
  let totalDays = 0;
  
  // 加上年的天数
  for (let y = baseYear; y < year; y++) {
    totalDays += isLeapYear(y) ? 366 : 365;
  }
  
  // 加上月的天数
  for (let m = baseMonth; m < month; m++) {
    totalDays += getMonthDays(year, m);
  }
  
  // 加上日
  totalDays += day - baseDay;
  
  // 取模得到索引
  const ganIndex = totalDays % 10;
  const zhiIndex = totalDays % 12;
  
  return {
    tianGan: TIAN_GAN[ganIndex],
    diZhi: DI_ZHI[zhiIndex],
    ganZhi: TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex],
    wuXing: WU_XING_TIAN_GAN[TIAN_GAN[ganIndex]]
  };
}

/**
 * 计算时柱
 * 口诀：甲己还生甲，乙庚丙作初
 *       丙辛从戊起，丁壬庚子居
 *       戊癸何方发，壬子是真途
 * 即：日干对应的时干起始 + 时辰索引
 */
function calculateShiZhu(timeStr, riGan) {
  const zhiIndex = DI_ZHI.indexOf(timeStr.charAt(0));
  
  // 时干起始表
  const SHI_GAN_START = {
    '甲': 0,  // 甲
    '己': 0,  // 甲
    '乙': 2,  // 丙
    '庚': 2,  // 丙
    '丙': 4,  // 戊
    '辛': 4,  // 戊
    '丁': 6,  // 庚
    '壬': 6,  // 庚
    '戊': 8,  // 壬
    '癸': 8   // 壬
  };
  
  const startIndex = SHI_GAN_START[riGan];
  const ganIndex = (startIndex + Math.floor(zhiIndex / 2)) % 10;
  
  return {
    tianGan: TIAN_GAN[ganIndex],
    diZhi: DI_ZHI[zhiIndex],
    ganZhi: TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex],
    wuXing: WU_XING_TIAN_GAN[TIAN_GAN[ganIndex]],
    timeName: timeStr
  };
}

/**
 * 五行分析
 */
function calculateWuXing(nianZhu, yueZhu, riZhu, shiZhu) {
  const pillars = [nianZhu, yueZhu, riZhu, shiZhu];
  const wuXingCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  
  pillars.forEach(p => {
    if (p.wuXing) wuXingCount[p.wuXing]++;
  });
  
  // 计算五行强弱
  const total = 8; // 4柱，每柱有天干地支共8个字
  const percentage = {};
  for (const [key, value] of Object.entries(wuXingCount)) {
    percentage[key] = Math.round((value / total) * 100);
  }
  
  // 喜用神判断（简化版）
  const score = {
    木: wuXingCount.木,
    火: wuXingCount.火,
    土: wuXingCount.土,
    金: wuXingCount.金,
    水: wuXingCount.水
  };
  
  // 找出最弱和次弱的五行
  const sorted = Object.entries(score).sort((a, b) => a[1] - b[1]);
  const xiYong = sorted[0][0]; // 最弱的五行为喜用
  const shenYong = sorted[1][0]; // 次弱为身神
  
  return {
    count: wuXingCount,
    percentage,
    xiYong,
    shenYong,
    summary: `${score.木}木${score.火}火${score.土}土${score.金}金${score.水}水`
  };
}

/**
 * 判断日主强弱
 */
function calculateRiZhuStrength(wuXingAnalysis, riGan) {
  const { count, xiYong } = wuXingAnalysis;
  
  // 日干本身的五行属性
  const riWuXing = WU_XING_TIAN_GAN[riGan];
  
  // 计算日干在地支中的藏干数量（简化）
  // 实际需要看四柱地支是否有日干的同党
  
  // 判断身强身弱
  // 如果日干五行强（>=2），且得令（月令），则身强
  // 简化：看日干五行在总数中的比例
  
  let strength;
  const riCount = count[riWuXing];
  
  if (riCount >= 3) {
    strength = '强';
  } else if (riCount >= 2) {
    strength = '中';
  } else if (riCount >= 1) {
    strength = '弱';
  } else {
    strength = '极弱';
  }
  
  return {
    level: strength,
    riGanWuXing: riWuXing,
    analysis: `日主${riGan}属${riWuXing}，五行${riWuXing}有${riCount}个，${strength}`
  };
}

/**
 * 大运计算
 */
function calculateDaYun(riZhu, birthYear, birthMonth, birthDay) {
  // 简化版大运计算
  // 大运起始年龄 = (出生年到下一个节气的天数) / 3.65
  // 这里简化处理，每10年一步大运
  
  const ganZhi = riZhu.ganZhi;
  
  // 顺逆排法：阳男阴女顺排，阴男阳女逆排
  // 简化：默认顺排
  
  const ganZhiList = generateGanZhiSequence(ganZhi);
  
  return {
    startAge: 0,
    sequence: ganZhiList.slice(0, 8).map((g, i) => ({
      age: i * 10,
      ganZhi: g,
      description: `${i * 10}-${i * 10 + 9}岁`
    }))
  };
}

/**
 * 生成干支序列
 */
function generateGanZhiSequence(startGanZhi) {
  const result = [];
  let ganIndex = TIAN_GAN.indexOf(startGanZhi[0]);
  let zhiIndex = DI_ZHI.indexOf(startGanZhi[1]);
  
  for (let i = 0; i < 20; i++) {
    result.push(TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex]);
    ganIndex = (ganIndex + 1) % 10;
    zhiIndex = (zhiIndex + 1) % 12;
  }
  
  return result;
}

/**
 * 获取属相
 */
function getZodiac(year) {
  const zodiacMap = {
    '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔',
    '辰': '龙', '巳': '蛇', '午': '马', '未': '羊',
    '申': '猴', '酉': '鸡', '戌': '狗', '亥': '猪'
  };
  
  const zhiIndex = (year - 3) % 12;
  const adjustedZhiIndex = zhiIndex < 0 ? zhiIndex + 12 : zhiIndex;
  return zodiacMap[DI_ZHI[adjustedZhiIndex]];
}

/**
 * 判断闰年
 */
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * 获取月份天数
 */
function getMonthDays(year, month) {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return days[month - 1];
}

/**
 * 根据生日获取八字（简化版，用于测试）
 */
function testCalculate() {
  const result = calculateBaZi(1990, 5, 15, '子时');
  console.log('八字排盘结果:', JSON.stringify(result, null, 2));
  return result;
}

module.exports = {
  calculateBaZi,
  calculateNianZhu,
  calculateYueZhu,
  calculateRiZhu,
  calculateShiZhu,
  getZodiac,
  testCalculate
};
