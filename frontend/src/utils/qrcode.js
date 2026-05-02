/**
 * 天命阁 - QR码生成工具
 * 使用Canvas绘制简单QR码
 */

const QRCODE_VERSION = 2
const QRCODE_SIZE = 25

// QR码掩码模式
const MASK_PATTERNS = [
  [0, 0, 0, 0, 0],
  [0, 1, 0, 1, 0],
  [0, 0, 1, 0, 0],
  [0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0]
]

/**
 * 生成QR码数据矩阵
 */
function generateQRMatrix(data) {
  const size = QRCODE_SIZE
  const matrix = Array.from({ length: size }, () => Array(size).fill(0))
  
  // 绘制定位图案 (左上角)
  drawPositionPattern(matrix, 0, 0)
  drawPositionPattern(matrix, size - 7, 0)
  drawPositionPattern(matrix, 0, size - 7)
  
  // 绘制对准图案
  drawAlignmentPattern(matrix, size - 7, size - 7)
  
  // 绘制时间模式
  drawTimingPattern(matrix)
  
  // 填充数据
  fillData(matrix, data)
  
  // 应用掩码
  applyMask(matrix)
  
  return matrix
}

/**
 * 绘制定位图案
 */
function drawPositionPattern(matrix, row, col) {
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      if (i === 0 || i === 6 || j === 0 || j === 6) {
        matrix[row + i][col + j] = 1
      } else if (i >= 2 && i <= 4 && j >= 2 && j <= 4) {
        matrix[row + i][col + j] = 1
      } else {
        matrix[row + i][col + j] = 0
      }
    }
  }
}

/**
 * 绘制对准图案
 */
function drawAlignmentPattern(matrix, row, col) {
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (i === 0 || i === 4 || j === 0 || j === 4) {
        matrix[row + i][col + j] = 1
      } else if (i === 2 && j === 2) {
        matrix[row + i][col + j] = 1
      } else {
        matrix[row + i][col + j] = 0
      }
    }
  }
}

/**
 * 绘制时间模式
 */
function drawTimingPattern(matrix) {
  const size = QRCODE_SIZE
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0
    matrix[i][6] = i % 2 === 0 ? 1 : 0
  }
}

/**
 * 填充数据 (简化版本)
 */
function fillData(matrix, data) {
  const size = QRCODE_SIZE
  let dataIndex = 0
  
  // 简化: 随机填充数据
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--
    
    for (let row = 0; row < size; row++) {
      for (let c = 0; c < 2; c++) {
        const currentCol = col - c
        if (matrix[row][currentCol] === 0) {
          matrix[row][currentCol] = dataIndex < data.length * 8 
            ? ((data.charCodeAt(Math.floor(dataIndex / 8)) >> (7 - (dataIndex % 8))) & 1)
            : Math.random() > 0.5 ? 1 : 0
          dataIndex++
        }
      }
    }
  }
}

/**
 * 应用掩码
 */
function applyMask(matrix) {
  const size = QRCODE_SIZE
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (MASK_PATTERNS[row % 5][col % 5] === 1) {
        matrix[row][col] = matrix[row][col] === 1 ? 0 : 1
      }
    }
  }
}

/**
 * 在Canvas上绘制QR码
 */
export function drawQRCode(ctx, data, x = 0, y = 0, size = 200, options = {}) {
  const {
    backgroundColor = '#ffffff',
    foregroundColor = '#000000',
    moduleSize = 8
  } = options
  
  const matrix = generateQRMatrix(data)
  const actualSize = size
  const moduleActualSize = actualSize / QRCODE_SIZE
  
  // 绘制背景
  ctx.setFillStyle(backgroundColor)
  ctx.fillRect(x, y, actualSize, actualSize)
  
  // 绘制模块
  ctx.setFillStyle(foregroundColor)
  
  for (let row = 0; row < QRCODE_SIZE; row++) {
    for (let col = 0; col < QRCODE_SIZE; col++) {
      if (matrix[row][col] === 1) {
        ctx.fillRect(
          x + col * moduleActualSize,
          y + row * moduleActualSize,
          moduleActualSize,
          moduleActualSize
        )
      }
    }
  }
  
  ctx.draw()
}

/**
 * 生成分享卡片Canvas
 */
export function drawShareCard(ctx, data, width, height) {
  const {
    backgroundColor = '#1A1A2E',
    accentColor = '#FFD700',
    primaryColor = '#8B0000',
    textColor = '#FFFFFF',
    secondaryTextColor = '#B8B8D0'
  } = data
  
  // 背景
  ctx.setFillStyle(backgroundColor)
  ctx.fillRect(0, 0, width, height)
  
  // 顶部装饰线
  ctx.setFillStyle(accentColor)
  ctx.fillRect(0, 0, width, 6)
  
  // Logo
  ctx.setFillStyle(accentColor)
  ctx.setFontSize(28)
  ctx.setTextAlign('center')
  ctx.fillText('天命阁', width / 2, 45)
  
  // 标题
  ctx.setFillStyle(textColor)
  ctx.setFontSize(16)
  ctx.fillText(data.title || '命格分析报告', width / 2, 80)
  
  // 分隔线
  ctx.setStrokeStyle('rgba(255, 215, 0, 0.3)')
  ctx.beginPath()
  ctx.moveTo(30, 100)
  ctx.lineTo(width - 30, 100)
  ctx.stroke()
  
  // 类型标签
  ctx.setFillStyle(primaryColor)
  const typeText = data.type || '年运'
  ctx.fillRect(width / 2 - 35, 115, 70, 25)
  ctx.setFillStyle(textColor)
  ctx.setFontSize(12)
  ctx.fillText(typeText, width / 2, 132)
  
  // 分数
  ctx.setFillStyle(accentColor)
  ctx.setFontSize(72)
  ctx.fillText(data.score || 0, width / 2, 210)
  
  ctx.setFillStyle(secondaryTextColor)
  ctx.setFontSize(14)
  ctx.fillText('命格评分', width / 2, 235)
  
  // 等级
  const levelColors = ['#FFD700', '#90EE90', '#87CEEB', '#D3D3D3', '#B22222']
  const levelNames = ['', '大吉', '吉', '中', '平', '凶']
  const level = data.level || 1
  
  ctx.setFillStyle(levelColors[level - 1])
  ctx.beginPath()
  ctx.arc(width / 2, 280, 32, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.setFillStyle('#000')
  ctx.setFontSize(16)
  ctx.fillText(levelNames[level], width / 2, 286)
  
  // 五行分布
  ctx.setFillStyle(textColor)
  ctx.setFontSize(12)
  ctx.setTextAlign('left')
  ctx.fillText('五行分布', 30, 360)
  
  // 五行条
  const wuxingColors = { '金': '#FFD700', '木': '#4CAF50', '水': '#2196F3', '火': '#F44336', '土': '#8B4513' }
  const wuxingData = data.wuxing || [
    { name: '金', percent: 20, color: wuxingColors['金'] },
    { name: '木', percent: 20, color: wuxingColors['木'] },
    { name: '水', percent: 20, color: wuxingColors['水'] },
    { name: '火', percent: 20, color: wuxingColors['火'] },
    { name: '土', percent: 20, color: wuxingColors['土'] }
  ]
  
  let xPos = 30
  const barMaxWidth = width - 60
  const barHeight = 32
  const barY = 375
  
  wuxingData.forEach(item => {
    const barWidth = (item.percent / 100) * barMaxWidth
    ctx.setFillStyle(item.color || '#888')
    ctx.fillRect(xPos, barY, barWidth, barHeight)
    
    if (item.percent >= 15) {
      ctx.setFillStyle('#000')
      ctx.setFontSize(10)
      ctx.setTextAlign('center')
      ctx.fillText(item.name, xPos + barWidth / 2, barY + 22)
    }
    xPos += barWidth
  })
  
  // 用户昵称
  ctx.setFillStyle(secondaryTextColor)
  ctx.setFontSize(11)
  ctx.setTextAlign('center')
  ctx.fillText(`来自 ${data.nickname || '命运探索者'} 的分享`, width / 2, height - 70)
  
  // 底部提示
  ctx.setFillStyle('#6B6B80')
  ctx.setFontSize(10)
  ctx.fillText('长按识别查看命格', width / 2, height - 35)
  
  ctx.draw()
}

export default {
  drawQRCode,
  drawShareCard
}