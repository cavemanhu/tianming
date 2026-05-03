/**
 * 导出控制器 - PDF/图片导出
 */

const exportService = require('../services/exportService');
const FortuneRecordModel = require('../models/FortuneRecord');
const { success, error, CODE } = require('../utils/response');

/**
 * 导出算命报告为PDF
 * GET /api/fortune/export/:id
 */
async function exportPDF(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId || 1;

    // 获取记录
    const record = await FortuneRecordModel.findById(id, userId);
    if (!record) {
      return res.status(404).json(error(CODE.NOT_FOUND, '记录不存在'));
    }

    // 生成PDF
    const pdfBuffer = await exportService.generateFortunePDF(record);

    // 设置响应头
    const filename = `天命阁_${record.fate_type}_${id}_${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (err) {
    console.error('exportPDF error:', err);
    res.status(500).json(error(CODE.SERVER_ERROR, '导出失败'));
  }
}

module.exports = {
  exportPDF
};
