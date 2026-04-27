/**
 * 用户控制器 - 完整实现
 */

const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');
const wechatService = require('../config/wechat');
const { success, error, CODE } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'tianming-secret';
const JWT_EXPIRES_IN = '7d';

/**
 * 生成JWT token
 */
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 微信登录/注册
 * POST /api/user/login
 */
async function login(req, res) {
  try {
    const { code, invite_code } = req.body;

    if (!code) {
      return res.status(400).json(error(CODE.BAD_REQUEST, '缺少code参数'));
    }

    // 调用微信接口获取openid
    let openid;
    try {
      const wxResult = await wechatService.getOpenidByCode(code);
      openid = wxResult.openid;
    } catch (err) {
      console.error('微信登录失败:', err.message);
      return res.status(400).json(error(CODE.BAD_REQUEST, '微信授权失败'));
    }

    // 查询用户是否已存在
    let user = await UserModel.findByOpenid(openid);
    let isNewUser = false;

    if (!user) {
      // 新用户注册
      const result = await UserModel.create({
        openid,
        invite_code: invite_code || null
      });
      isNewUser = true;
      user = await UserModel.findById(result.id);
    } else {
      // 更新最后登录时间
      await UserModel.updateLastLogin(user.id);
    }

    // 生成JWT
    const token = generateToken(user.id);

    res.json(success({
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        invite_code: user.invite_code,
        gems: user.gems,
        level: user.level
      },
      is_new_user: isNewUser
    }));
  } catch (err) {
    console.error('登录异常:', err);
    res.status(500).json(error(CODE.SERVER_ERROR, '登录失败'));
  }
}

/**
 * 获取当前用户信息
 * GET /api/user/info
 */
async function getInfo(req, res) {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json(error(CODE.USER_NOT_EXIST, '用户不存在'));
    }

    // 获取师傅信息
    let referrer = null;
    if (user.referrer_id) {
      referrer = await UserModel.findById(user.referrer_id);
    }

    res.json(success({
      id: user.id,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
      phone: user.phone,
      invite_code: user.invite_code,
      referrer: referrer ? { id: referrer.id, nickname: referrer.nickname } : null,
      gems: user.gems,
      level: user.level,
      status: user.status,
      last_login_at: user.last_login_at,
      created_at: user.created_at
    }));
  } catch (err) {
    console.error('获取用户信息失败:', err);
    res.status(500).json(error(CODE.SERVER_ERROR, '获取用户信息失败'));
  }
}

/**
 * 更新用户信息
 * PUT /api/user/info
 */
async function updateInfo(req, res) {
  try {
    const { nickname, avatar_url, phone } = req.body;

    // 参数校验
    if (nickname && (nickname.length < 2 || nickname.length > 32)) {
      return res.status(400).json(error(CODE.INVALID_PARAMETER, '昵称长度需在2-32字符之间'));
    }
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json(error(CODE.INVALID_PARAMETER, '手机号格式不正确'));
    }

    await UserModel.updateInfo(req.userId, { nickname, avatar_url, phone });

    const user = await UserModel.findById(req.userId);
    res.json(success({
      id: user.id,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
      phone: user.phone
    }));
  } catch (err) {
    console.error('更新用户信息失败:', err);
    res.status(500).json(error(CODE.SERVER_ERROR, '更新失败'));
  }
}

/**
 * 获取我的邀请码
 * GET /api/user/invite-code
 */
async function getInviteCode(req, res) {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json(error(CODE.USER_NOT_EXIST, '用户不存在'));
    }

    res.json(success({
      invite_code: user.invite_code,
      // 邀请链接（如果有域名）
      invite_url: process.env.DOMAIN ? `${process.env.DOMAIN}/?invite_code=${user.invite_code}` : null
    }));
  } catch (err) {
    console.error('获取邀请码失败:', err);
    res.status(500).json(error(CODE.SERVER_ERROR, '获取邀请码失败'));
  }
}

/**
 * 获取徒弟列表
 * GET /api/user/apprentices
 */
async function getApprentices(req, res) {
  try {
    const { page = 1, pageSize = 20 } = req.query;

    if (page < 1) page = 1;
    if (pageSize < 1 || pageSize > 100) pageSize = 20;

    const result = await UserModel.getApprentices(req.userId, { page: Number(page), pageSize: Number(pageSize) });

    res.json(success({
      list: result.list,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: result.total
      }
    }));
  } catch (err) {
    console.error('获取徒弟列表失败:', err);
    res.status(500).json(error(CODE.SERVER_ERROR, '获取徒弟列表失败'));
  }
}

/**
 * 验证邀请码是否有效
 * GET /api/user/check-invite-code
 */
async function checkInviteCode(req, res) {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json(error(CODE.BAD_REQUEST, '缺少邀请码'));
    }

    const referrer = await UserModel.findByInviteCode(code);
    if (!referrer) {
      return res.json(success({ valid: false, message: '邀请码无效' }));
    }

    // 不能用自己的邀请码
    if (referrer.id === req.userId) {
      return res.json(success({ valid: false, message: '不能使用自己的邀请码' }));
    }

    res.json(success({
      valid: true,
      referrer: { id: referrer.id, nickname: referrer.nickname }
    }));
  } catch (err) {
    console.error('验证邀请码失败:', err);
    res.status(500).json(error(CODE.SERVER_ERROR, '验证失败'));
  }
}

module.exports = {
  login,
  getInfo,
  updateInfo,
  getInviteCode,
  getApprentices,
  checkInviteCode
};
