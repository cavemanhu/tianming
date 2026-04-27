-- 天命阁数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS tianming_dimis 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE tianming_dimis;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  openid        VARCHAR(64) NOT NULL UNIQUE COMMENT '微信openid',
  nickname      VARCHAR(32) DEFAULT '' COMMENT '昵称',
  avatar_url    VARCHAR(512) DEFAULT '' COMMENT '头像URL',
  phone         VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  invite_code   VARCHAR(8) NOT NULL UNIQUE COMMENT '个人邀请码',
  referrer_id   BIGINT UNSIGNED DEFAULT NULL COMMENT '师傅用户ID',
  referrer_code VARCHAR(8) DEFAULT NULL COMMENT '师傅邀请码(记录来源)',
  gems          INT UNSIGNED DEFAULT 0 COMMENT '天命币余额',
  level         TINYINT UNSIGNED DEFAULT 1 COMMENT '用户等级',
  status        TINYINT UNSIGNED DEFAULT 1 COMMENT '状态:0禁用1正常2封禁',
  last_login_at DATETIME DEFAULT NULL COMMENT '最后登录时间',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_openid (openid),
  INDEX idx_invite_code (invite_code),
  INDEX idx_referrer (referrer_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 算命记录表
CREATE TABLE IF NOT EXISTS fortune_records (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  fate_type     VARCHAR(32) NOT NULL COMMENT '命运类型:zodiac/bazi/mingpan',
  input_data    JSON NOT NULL COMMENT '输入数据',
  result_data   JSON NOT NULL COMMENT '推算结果',
  gems_cost     INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '消耗天命币',
  fate_level    VARCHAR(16) DEFAULT 'normal' COMMENT '命运等级:normal/good/great',
  status        TINYINT DEFAULT 1 COMMENT '状态:0失败1成功',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user (user_id),
  INDEX idx_fate_type (fate_type),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='算命记录表';

-- 3. 异步任务表
CREATE TABLE IF NOT EXISTS async_tasks (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  task_id       VARCHAR(64) NOT NULL UNIQUE COMMENT '任务唯一标识',
  user_id       BIGINT UNSIGNED NOT NULL,
  task_type     VARCHAR(32) NOT NULL COMMENT '任务类型:fortune/email/report',
  task_status   VARCHAR(16) DEFAULT 'pending' COMMENT 'pending/running/completed/failed',
  progress      TINYINT UNSIGNED DEFAULT 0 COMMENT '进度0-100',
  input_data    JSON DEFAULT NULL,
  result_data   JSON DEFAULT NULL,
  error_msg     TEXT DEFAULT NULL,
  started_at    DATETIME DEFAULT NULL,
  completed_at  DATETIME DEFAULT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_task_id (task_id),
  INDEX idx_user_task (user_id, task_type),
  INDEX idx_status (task_status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='异步任务表';

-- 4. 因缘记录表
CREATE TABLE IF NOT EXISTS yinyuan_records (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  yinyuan_type  VARCHAR(32) NOT NULL COMMENT '因缘类型:shengtong/jiemeng/cesuan',
  target_name   VARCHAR(64) DEFAULT '' COMMENT '对方称呼',
  target_gender TINYINT DEFAULT 0 COMMENT '对方性别:0未知1男2女',
  relation_desc VARCHAR(256) DEFAULT '' COMMENT '关系描述',
  question      VARCHAR(512) DEFAULT '' COMMENT '所问之事',
  answer_data   JSON DEFAULT NULL COMMENT '解答数据',
  gems_cost     INT UNSIGNED DEFAULT 0 COMMENT '消耗天命币',
  master_id     BIGINT UNSIGNED DEFAULT NULL COMMENT '大师ID(谁解答)',
  status        TINYINT DEFAULT 0 COMMENT '状态:0待解答1已解答',
  answered_at   DATETIME DEFAULT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user (user_id),
  INDEX idx_master (master_id),
  INDEX idx_status (status),
  INDEX idx_type (yinyuan_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='因缘记录表';

-- 5. 名号记录表
CREATE TABLE IF NOT EXISTS fatename_records (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  fatename_type VARCHAR(32) NOT NULL COMMENT '名号类型:name/fate_title/life_motto',
  base_name     VARCHAR(64) NOT NULL COMMENT '基础名/字',
  gender        TINYINT DEFAULT 0 COMMENT '性别:0未知1男2女',
  birth_time    VARCHAR(32) DEFAULT '' COMMENT '出生时辰',
  elements      JSON DEFAULT NULL COMMENT '五行分析',
  generated_data JSON DEFAULT NULL COMMENT '生成的名号结果',
  gems_cost     INT UNSIGNED DEFAULT 0 COMMENT '消耗天命币',
  status        TINYINT DEFAULT 1 COMMENT '状态',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user (user_id),
  INDEX idx_type (fatename_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='名号记录表';

-- 6. 订单表
CREATE TABLE IF NOT EXISTS orders (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_no      VARCHAR(32) NOT NULL UNIQUE COMMENT '订单号',
  user_id       BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  order_type    VARCHAR(32) NOT NULL COMMENT '订单类型:recharge/fortune/vip',
  product_id    VARCHAR(64) DEFAULT NULL COMMENT '商品ID',
  amount        DECIMAL(10,2) UNSIGNED NOT NULL COMMENT '金额(元)',
  gems_amount   INT UNSIGNED DEFAULT NULL COMMENT '充值天命币数量',
  pay_status    VARCHAR(16) DEFAULT 'pending' COMMENT 'pending/paid/refunded',
  pay_method    VARCHAR(16) DEFAULT NULL COMMENT '支付方式:wechat/alipay',
  pay_time      DATETIME DEFAULT NULL COMMENT '支付时间',
  notify_data   JSON DEFAULT NULL COMMENT '支付回调数据',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_order_no (order_no),
  INDEX idx_user (user_id),
  INDEX idx_pay_status (pay_status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 添加外键约束
ALTER TABLE users 
  ADD CONSTRAINT fk_users_referrer 
  FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE fortune_records 
  ADD CONSTRAINT fk_fortune_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 7. 分账记录表
CREATE TABLE IF NOT EXISTS commission_logs (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL COMMENT '获得分账的用户ID(师傅)',
  source_user_id BIGINT UNSIGNED NOT NULL COMMENT '触发分账的用户ID(徒弟)',
  amount        INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '分账金额(天命币)',
  level         TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '师徒层级(1/2/3)',
  biz_type      VARCHAR(32) NOT NULL COMMENT '业务类型:recharge/fortune/consume',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user (user_id),
  INDEX idx_source_user (source_user_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分账记录表';
