/**
 * 风水计算服务
 * 基于八卦、五行、八宅、玄空飞星等风水理论
 */

const baziService = require('./baziService');

// 八卦对应五行
const BAGUA_WU_XING = {
  '乾': '金', '兑': '金', '离': '火', '震': '木',
  '巽': '木', '坎': '水', '艮': '土', '坤': '土'
};

// 八卦对应方位
const BAGUA_DIRECTION = {
  '乾': '西北', '兑': '西', '离': '南', '震': '东',
  '巽': '东南', '坎': '北', '艮': '东北', '坤': '西南'
};

// 九宫飞星
const FEI_XING_STARS = {
  1: { name: '一白贪狼星', element: '水', desc: '文曲星，主文才、桃花' },
  2: { name: '二黑巨门星', element: '土', desc: '病符星，主疾病' },
  3: { name: '三碧禄存星', element: '木', desc: '蚩尤星，主是非' },
  4: { name: '四绿文昌星', element: '木', desc: '文昌星，主学业' },
  5: { name: '五黄廉贞星', element: '土', desc: '大煞，主灾祸' },
  6: { name: '六白武曲星', element: '金', desc: '武曲星，主事业' },
  7: { name: '七赤破军星', element: '金', desc: '盗贼星，主破财' },
  8: { name: '八白左辅星', element: '土', desc: '财星，主财运' },
  9: { name: '九紫右弼星', element: '火', desc: '吉庆星，主姻缘' }
};

// 八宅吉凶方位
const BAZHAI_MAP = {
  '乾': { sheng: ['西北', '西', '西南'], xiong: ['东', '东南', '南'] },
  '兑': { sheng: ['西', '西北', '西南'], xiong: ['东', '东南', '北'] },
  '艮': { sheng: ['东北', '西北', '西'], xiong: ['东', '南', '东南'] },
  '离': { sheng: ['南', '东', '东南'], xiong: ['西北', '西', '北'] },
  '坎': { sheng: ['北', '西北', '东北'], xiong: ['南', '东南', '西'] },
  '震': { sheng: ['东', '南', '东南'], xiong: ['西北', '西', '东北'] },
  '巽': { sheng: ['东南', '南', '东'], xiong: ['西北', '西', '东北'] },
  '坤': { sheng: ['西南', '西', '西北'], xiong: ['东', '南', '东南'] }
};

/**
 * 计算房屋风水
 */
function calculateHouseFengshui(params) {
  const { address, facingDirection, birthYear, birthMonth, birthDay, birthTime } = params;

  // 1. 计算户主八字
  const bazi = baziService.calculateBaZi(birthYear, birthMonth, birthDay, birthTime || '子时');
  
  // 2. 计算命卦
  const mingGua = calculateMingGua(birthYear);
  
  // 3. 计算八宅吉凶方位
  const baziResults = calculateBaZhai(mingGua.name);
  
  // 4. 计算流年飞星
  const currentYear = new Date().getFullYear();
  const liuNianFeiXing = calculateLiuNianFeiXing(currentYear);
  
  // 5. 生成分析
  const analysis = generateAnalysis(bazi, mingGua, baziResults, facingDirection);

  return {
    houseInfo: { address, facingDirection },
    ownerInfo: {
      bazi: `${bazi.nianZhu.ganZhi}年 ${bazi.yueZhu.ganZhi}月 ${bazi.riZhu.ganZhi}日 ${bazi.shiZhu.ganZhi}时`,
      zodiac: bazi.zodiac,
      wuXing: bazi.wuXingAnalysis.summary
    },
    mingGua,
    baziResults,
    liuNianFeiXing,
    analysis
  };
}

/**
 * 计算命卦
 */
function calculateMingGua(year) {
  // 简化算法：按元运计算
  // 1984-2043年：七赤金运
  let mingGuaNum, mingGua;
  
  if (year >= 1984 && year <= 2043) {
    const offset = (year - 1984) % 60;
    if (offset < 20) mingGuaNum = 6; // 乾
    else if (offset < 40) mingGuaNum = 7; // 兑
    else if (offset < 60) mingGuaNum = 8; // 艮
    else mingGuaNum = 9; // 离
  } else {
    mingGuaNum = 6;
  }
  
  const names = ['', '坎', '坤', '震', '巽', '', '乾', '兑', '艮', '离'];
  mingGua = names[mingGuaNum] || '乾';
  
  return {
    number: mingGuaNum,
    name: mingGua,
    wuXing: BAGUA_WU_XING[mingGua],
    type: ['坎', '离', '震', '巽'].includes(mingGua) ? '东四命' : '西四命'
  };
}

/**
 * 计算八宅吉凶
 */
function calculateBaZhai(mingGua) {
  const map = BAZHAI_MAP[mingGua] || BAZHAI_MAP['坎'];
  const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
  
  const result = {};
  directions.forEach(dir => {
    if (map.sheng.includes(dir)) {
      result[dir] = { ji: '吉', type: '生气/延年' };
    } else if (map.xiong.includes(dir)) {
      result[dir] = { ji: '凶', type: '五鬼/六煞/绝命' };
    } else {
      result[dir] = { ji: '平', type: '伏位' };
    }
  });
  return result;
}

/**
 * 计算流年飞星
 */
function calculateLiuNianFeiXing(year) {
  // 2024年一白入中宫
  const baseYear = 2024;
  const baseStar = 1;
  const yearOffset = (year - baseYear + 60) % 60;
  
  // 九宫飞星逆行
  const centerStar = ((baseStar - 1 + yearOffset) % 9) + 1;
  
  const positions = [];
  const directions = ['坎', '坤', '震', '巽', '中', '乾', '兑', '艮', '离'];
  
  for (let i = 0; i < 9; i++) {
    const starNum = ((centerStar - 1 + i) % 9) + 1;
    positions.push({
      宫位: directions[i],
      星: starNum,
      ...FEI_XING_STARS[starNum]
    });
  }
  
  return { year, centerStar, positions };
}

/**
 * 生成风水分析
 */
function generateAnalysis(bazi, mingGua, baziResults, facingDirection) {
  const lines = [];
  
  lines.push(`【命卦】${bazi.zodiac}年出生，命卦${mingGua.name}卦（${mingGua.type}），五行属${mingGua.wuXing}`);
  lines.push('');
  lines.push(`【大门朝向】${facingDirection}`);
  const doorResult = baziResults[facingDirection] || { ji: '平' };
  lines.push(`此方位为${doorResult.ji}位（${doorResult.type}）`);
  lines.push('');
  lines.push('【吉位】');
  Object.entries(baziResults).forEach(([dir, result]) => {
    if (result.ji === '吉') {
      lines.push(`  ${dir}：${result.type}`);
    }
  });
  lines.push('');
  lines.push('【凶位】');
  Object.entries(baziResults).forEach(([dir, result]) => {
    if (result.ji === '凶') {
      lines.push(`  ${dir}：${result.type}`);
    }
  });
  lines.push('');
  lines.push('【建议】');
  
  // 根据命卦五行给出建议
  const wx = mingGua.wuXing;
  const suggestions = {
    '木': ['东方/东南布置绿色植物', '用水生木如富贵竹', '忌西方大量白色'],
    '火': ['南方摆放红色饰品', '紫色物品增强运势', '忌北方大量蓝色'],
    '土': ['西南/东北放置陶瓷', '黄色布置', '忌东方绿色'],
    '金': ['西方/西北金属制品', '白/金色增强', '忌南方红色'],
    '水': ['北方水景/蓝色物品', '黑/蓝色布置', '忌西南/东北黄色']
  };
  
  (suggestions[wx] || suggestions['土']).forEach((s, i) => {
    lines.push(`  ${i + 1}. ${s}`);
  });
  
  return lines.join('\n');
}

/**
 * 测试
 */
function testFengshui() {
  const result = calculateHouseFengshui({
    address: '北京某小区',
    facingDirection: '南',
    birthYear: 1990,
    birthMonth: 5,
    birthDay: 15,
    birthTime: '子时'
  });
  console.log('风水结果:', JSON.stringify(result, null, 2));
  console.log('\n分析报告:\n', result.analysis);
  return result;
}

module.exports = {
  calculateHouseFengshui,
  calculateMingGua,
  calculateBaZhai,
  calculateLiuNianFeiXing,
  testFengshui
};
