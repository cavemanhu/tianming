/**
 * 算命报告导出服务
 * 支持 PDF 格式导出
 */

const PDFDocument = require('pdfkit');
const FortuneRecordModel = require('../models/FortuneRecord');

/**
 * 生成 PDF 格式的算命报告
 * @param {object} record 算命记录
 * @param {object} options 配置选项
 * @returns {Promise<Buffer>} PDF 缓冲区
 */
async function generateFortunePDF(record, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 60, bottom: 60, left: 80, right: 80 },
        info: {
          Title: `天命阁 - ${getFateTypeName(record.fate_type)}报告`,
          Author: '天命阁',
          Subject: '命理分析报告'
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const result = record.result_data || {};
      const input = record.input_data || {};
      const bazi = result.bazi || {};

      // ========== 封面 ==========
      drawCover(doc, record, result);

      // ========== 八字信息 ==========
      doc.addPage();
      drawBaziPage(doc, input, bazi);

      // ========== 年运分析 ==========
      if (result.type === 'bazi') {
        doc.addPage();
        drawYearFortunePage(doc, result);
      }

      // ========== 姻缘分析 ==========
      if (result.type === 'yinyuan') {
        doc.addPage();
        drawYinyuanPage(doc, result);
      }

      // ========== 五行分析 ==========
      if (result.wuxing) {
        doc.addPage();
        drawWuxingPage(doc, result.wuxing);
      }

      // ========== 页脚 ==========
      drawFooter(doc, record);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * 绘制封面
 */
function drawCover(doc, record, result) {
  const pageW = doc.page.width;
  const centerX = pageW / 2;

  // 背景色块
  doc.rect(0, 0, pageW, doc.page.height).fill('#1A1A2E');

  // 顶部装饰线
  doc.fill('#FFD700').rect(0, 80, pageW, 3);

  // Logo
  doc.fill('#FFD700').fontSize(36).text('天命阁', centerX - 60, 120, { align: 'center', width: 120 });
  doc.fill('#FFFFFF').fontSize(12).text('TIANMING FATE ANALYSIS', centerX - 72, 165, { align: 'center', width: 144 });

  // 分隔线
  doc.strokeColor('#FFD700').lineWidth(1)
    .moveTo(100, 200).lineTo(pageW - 100, 200).stroke();

  // 标题
  doc.fill('#FFFFFF').fontSize(28).text(getFateTypeName(record.fate_type), centerX - 80, 230, { align: 'center', width: 160 });
  doc.fill('#B8B8D0').fontSize(14).text('命 格 分 析 报 告', centerX - 56, 270, { align: 'center', width: 112 });

  // 分数圆
  const score = result.score || 0;
  const level = result.level || 1;
  const levelName = result.levelName || getLevelName(level);

  doc.fill('#FFD700').circle(centerX, 380, 50).fill();
  doc.fill('#1A1A2E').fontSize(36).text(score.toString(), centerX - 20, 365, { align: 'center', width: 40 });
  
  doc.fill('#FFD700').fontSize(14).text(levelName, centerX - 20, 440, { align: 'center', width: 40 });
  doc.fill('#B8B8D0').fontSize(10).text('命格评分', centerX - 24, 458, { align: 'center', width: 48 });

  // 日期
  doc.fill('#6B6B80').fontSize(10)
    .text(`生成时间: ${new Date(record.created_at || Date.now()).toLocaleString('zh-CN')}`, 
          centerX - 80, 550, { align: 'center', width: 160 });

  // 底部装饰
  doc.fill('#FFD700').rect(0, doc.page.height - 60, pageW, 2);
}

/**
 * 绘制八字信息页
 */
function drawBaziPage(doc, input, bazi) {
  const pageW = doc.page.width;

  // 页面标题
  doc.fill('#1A1A2E').fontSize(20).text('八字命盘', 80, 60);
  doc.fill('#FFD700').rect(80, 85, 60, 3);

  // 基本信息
  let y = 120;
  doc.fill('#333333').fontSize(12);
  
  const birthStr = `${input.birth_year}年${input.birth_month}月${input.birth_day}日${getTimeName(input.birth_hour)}`;
  const genderStr = input.gender === 1 ? '男' : '女';
  
  doc.text(`出生信息: ${birthStr}  |  性别: ${genderStr}`, 80, y);
  y += 30;

  // 四柱表格
  const pillars = [
    { name: '年柱', data: bazi.year },
    { name: '月柱', data: bazi.month },
    { name: '日柱', data: bazi.day },
    { name: '时柱', data: bazi.time }
  ];

  const colW = (pageW - 160) / 4;
  
  pillars.forEach((pillar, i) => {
    const x = 80 + i * colW;
    
    // 标题背景
    doc.fill('#1A1A2E').rect(x, y, colW - 10, 30);
    doc.fill('#FFFFFF').fontSize(12).text(pillar.name, x + 5, y + 8);
    
    // 内容
    doc.fill('#F5F5F5').rect(x, y + 30, colW - 10, 50);
    doc.fill('#333333').fontSize(16).text(pillar.data?.gan || '', x + 5, y + 38);
    doc.fill('#666666').fontSize(10).text(pillar.data?.zhi || '', x + 5, y + 60);
  });

  y += 100;

  // 天干地支详情
  doc.fill('#333333').fontSize(11);
  if (bazi.year) {
    doc.text(`年柱: ${bazi.year.gan}${bazi.year.zhi}  (${bazi.year.element})`, 80, y); y += 20;
  }
  if (bazi.month) {
    doc.text(`月柱: ${bazi.month.gan}${bazi.month.zhi}  (${bazi.month.element})`, 80, y); y += 20;
  }
  if (bazi.day) {
    doc.text(`日柱: ${bazi.day.gan}${bazi.day.zhi}  (${bazi.day.element})`, 80, y); y += 20;
  }
  if (bazi.time) {
    doc.text(`时柱: ${bazi.time.gan}${bazi.time.zhi}  (${bazi.time.element})`, 80, y); y += 20;
  }
}

/**
 * 绘制年运分析页
 */
function drawYearFortunePage(doc, result) {
  // 页面标题
  doc.fill('#1A1A2E').fontSize(20).text('年度运势分析', 80, 60);
  doc.fill('#FFD700').rect(80, 85, 80, 3);

  let y = 120;

  // 综合评分
  doc.fill('#333333').fontSize(14).text('综合评分', 80, y);
  y += 25;
  doc.fill('#FFD700').fontSize(28).text(`${result.score}分`, 80, y);
  doc.fill('#666666').fontSize(10).text(`（${result.levelName}）`, 130, y + 8);
  y += 40;

  // 年度概述
  doc.fill('#333333').fontSize(12).text('年度概述', 80, y);
  y += 20;
  doc.fill('#666666').fontSize(10).text(result.summary || '', 80, y, { width: 500, lineGap: 4 });
  y += 60;

  // 流月运势
  if (result.monthlyFortunes && result.monthlyFortunes.length > 0) {
    doc.fill('#333333').fontSize(12).text('流月运势', 80, y);
    y += 25;

    result.monthlyFortunes.forEach((month, i) => {
      if (i % 3 === 0) {
        const xBase = 80 + (i % 3) * 170;
        doc.fill('#F5F5F5').rect(xBase, y, 160, 40);
        doc.fill('#333333').fontSize(10).text(`${month.month}月: ${month.summary.slice(0, 20)}...`, xBase + 5, y + 5, { width: 150 });
      }
    });
  }
}

/**
 * 绘制姻缘分析页
 */
function drawYinyuanPage(doc, result) {
  doc.fill('#1A1A2E').fontSize(20).text('姻缘配对分析', 80, 60);
  doc.fill('#FFD700').rect(80, 85, 80, 3);

  let y = 120;

  // 配对评分
  doc.fill('#333333').fontSize(14).text('配对评分', 80, y);
  y += 25;
  doc.fill('#FFD700').fontSize(28).text(`${result.score}分`, 80, y);
  y += 50;

  // 详细信息
  if (result.details) {
    doc.fill('#333333').fontSize(12).text('配对分析', 80, y);
    y += 20;
    doc.fill('#666666').fontSize(10).text(result.details, 80, y, { width: 500, lineGap: 4 });
    y += 80;
  }

  // 报告
  if (result.report) {
    doc.fill('#333333').fontSize(12).text('配对建议', 80, y);
    y += 20;
    doc.fill('#666666').fontSize(10).text(result.report, 80, y, { width: 500, lineGap: 4 });
  }
}

/**
 * 绘制五行分析页
 */
function drawWuxingPage(doc, wuxing) {
  doc.fill('#1A1A2E').fontSize(20).text('五行分析', 80, 60);
  doc.fill('#FFD700').rect(80, 85, 60, 3);

  let y = 120;

  const colors = { '金': '#DAA520', '木': '#228B22', '水': '#4169E1', '火': '#DC143C', '土': '#8B4513' };

  if (Array.isArray(wuxing)) {
    wuxing.forEach(item => {
      doc.fill('#333333').fontSize(11).text(item.name, 80, y);
      
      // 条形图
      const barW = (item.percent / 100) * 300;
      doc.fill(colors[item.name] || '#999999').rect(120, y - 3, barW, 16);
      doc.fill('#333333').fontSize(10).text(`${item.percent}%`, 120 + barW + 5, y);
      
      y += 30;
    });
  } else if (wuxing.jin !== undefined) {
    const items = [
      { name: '金', value: wuxing.jin },
      { name: '木', value: wuxing.mu },
      { name: '水', value: wuxing.shui },
      { name: '火', value: wuxing.huo },
      { name: '土', value: wuxing.tu }
    ];
    items.forEach(item => {
      doc.fill('#333333').fontSize(11).text(item.name, 80, y);
      const barW = (item.value / 100) * 300;
      doc.fill(colors[item.name] || '#999999').rect(120, y - 3, barW, 16);
      doc.fill('#333333').fontSize(10).text(`${item.value}%`, 120 + barW + 5, y);
      y += 30;
    });
  }
}

/**
 * 绘制页脚
 */
function drawFooter(doc, record) {
  const pageW = doc.page.width;
  
  doc.fill('#FFD700').rect(0, doc.page.height - 30, pageW, 1);
  doc.fill('#999999').fontSize(8)
    .text('天命阁 - 探索命运，洞悉人生', 80, doc.page.height - 20)
    .text(`第 ${doc.bufferedPageRange().start + 1} 页`, pageW - 150, doc.page.height - 20);
}

/**
 * 辅助函数
 */
function getFateTypeName(type) {
  const names = { bazi: '八字年运', yinyuan: '姻缘配对', naming: '取名测算' };
  return names[type] || '命理分析';
}

function getLevelName(level) {
  const names = { 1: '大吉', 2: '吉', 3: '中', 4: '平', 5: '凶' };
  return names[level] || '平';
}

function getTimeName(hour) {
  const times = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];
  return times[hour % 12] || '子时';
}

module.exports = {
  generateFortunePDF
};
