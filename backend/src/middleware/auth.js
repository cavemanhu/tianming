/**
 * 鉴权中间件
 */

const jwt = require('jsonwebtoken');
const { CODE } = require('../utils/response');

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({
      code: CODE.UNAUTHORIZED,
      message: '未授权访问'
    });
  }

  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tianming-secret');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({
      code: CODE.UNAUTHORIZED,
      message: 'Token无效或已过期'
    });
  }
};
