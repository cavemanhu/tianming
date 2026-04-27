/**
 * 邀请码生成工具
 * 8位数字字母混合，不含易混淆字符
 */

const CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

function generateInviteCode(length = 8) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return code;
}

function generateOrderNo() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TM${timestamp}${random}`;
}

function generateTaskId() {
  const { v4: uuidv4 } = require('uuid');
  return uuidv4().replace(/-/g, '');
}

module.exports = {
  generateInviteCode,
  generateOrderNo,
  generateTaskId
};
