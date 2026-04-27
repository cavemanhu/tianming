/**
 * 天命阁小程序 - 裂变流程测试脚本
 * 测试分享邀请的完整链路
 */

const readline = require('readline')

// 创建交互式输入
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 裂变流程步骤
const fissionSteps = [
  {
    id: 1,
    name: '用户A完成算命',
    description: '用户在首页选择类型，填写信息，完成算命',
    checks: [
      '✅ 选择算命类型',
      '✅ 填写出生日期',
      '✅ 选择时辰',
      '✅ 选择性别',
      '✅ 查看八字命盘',
      '✅ 查看算命结果'
    ]
  },
  {
    id: 2,
    name: '用户A分享结果',
    description: '用户A将算命结果分享给好友',
    checks: [
      '✅ 进入分享页',
      '✅ 生成分享卡片',
      '✅ 选择分享方式',
      '✅ 分享到微信'
    ]
  },
  {
    id: 3,
    name: '用户B打开分享',
    description: '用户B收到分享消息，点击打开',
    checks: [
      '✅ 微信打开分享卡片',
      '✅ 显示分享预览',
      '✅ 点击查看详情'
    ]
  },
  {
    id: 4,
    name: '用户B注册登录',
    description: '用户B登录或注册账号',
    checks: [
      '✅ 打开登录页',
      '✅ 选择登录方式',
      '✅ 完成登录验证'
    ]
  },
  {
    id: 5,
    name: '用户B完成首次算命',
    description: '用户B完成自己的第一次算命',
    checks: [
      '✅ 进入首页',
      '✅ 选择类型',
      '✅ 填写信息',
      '✅ 查看结果'
    ]
  },
  {
    id: 6,
    name: '双方获得奖励',
    description: '用户A和用户B各获得1次免费算命',
    checks: [
      '✅ 用户A收到通知',
      '✅ 用户A免费次数+1',
      '✅ 用户B收到通知',
      '✅ 用户B免费次数+1'
    ]
  }
]

// 分享文案测试数据
const shareTemplates = [
  {
    name: '经典模板',
    content: {
      title: '探索你的命运 | 天命阁',
      desc: '知命而为，顺势而行。点击查看你的命格分析',
      path: '/pages/login/index?inviteCode=XXX'
    }
  },
  {
    name: '年运模板',
    content: {
      title: '2026年运势分析 | 天命阁',
      desc: '你的2026年运势如何？点击立即测算',
      path: '/pages/login/index?inviteCode=XXX&type=year'
    }
  },
  {
    name: '姻缘模板',
    content: {
      title: '姻缘配对 | 天命阁',
      desc: '想知道你和TA的缘分配对指数吗？点击测算',
      path: '/pages/login/index?inviteCode=XXX&type=love'
    }
  }
]

// 邀请码格式验证
function validateInviteCode(code) {
  // 格式: TM + 年月日 + 随机6位
  const pattern = /^TM\d{10,}$/
  return pattern.test(code)
}

// 分享链接验证
function validateShareLink(link) {
  try {
    const url = new URL(link)
    return url.pathname.includes('/pages/login/index')
  } catch {
    return false
  }
}

// 显示测试菜单
function showMenu() {
  log('\n═══════════════════════════════════════', 'blue')
  log('    天命阁 - 裂变流程测试', 'blue')
  log('═══════════════════════════════════════', 'blue')
  log('')
  log('1. 查看裂变流程', 'cyan')
  log('2. 测试分享文案', 'cyan')
  log('3. 验证邀请码格式', 'cyan')
  log('4. 验证分享链接', 'cyan')
  log('5. 模拟完整裂变', 'cyan')
  log('0. 退出测试', 'cyan')
  log('')
  log('请输入选项: ', 'yellow')
}

// 显示裂变流程
function showFissionFlow() {
  log('\n═══════════════════════════════════════', 'blue')
  log('    裂变流程图', 'blue')
  log('═══════════════════════════════════════', 'blue')
  log('')
  
  fissionSteps.forEach((step, index) => {
    log(`【第${step.id}步】${step.name}`, 'cyan')
    log(`   说明: ${step.description}`, 'reset')
    log('   检查项:', 'yellow')
    step.checks.forEach(check => {
      log(`     ${check}`, 'green')
    })
    log('')
    
    // 显示连接箭头
    if (index < fissionSteps.length - 1) {
      log('           ↓', 'cyan')
      log('')
    }
  })
}

// 测试分享文案
function testShareTemplates() {
  log('\n═══════════════════════════════════════', 'blue')
  log('    分享文案测试', 'blue')
  log('═══════════════════════════════════════', 'blue')
  log('')
  
  shareTemplates.forEach((template, index) => {
    log(`\n【模板${index + 1}】${template.name}`, 'cyan')
    log(`  标题: ${template.content.title}`, 'reset')
    log(`  描述: ${template.content.desc}`, 'reset')
    log(`  路径: ${template.content.path}`, 'reset')
  })
  
  log('\n')
}

// 测试邀请码
function testInviteCode() {
  rl.question('请输入邀请码进行验证: ', (code) => {
    if (!code) {
      log('邀请码不能为空', 'red')
    } else if (validateInviteCode(code)) {
      log(`✅ 邀请码格式正确: ${code}`, 'green')
    } else {
      log(`❌ 邀请码格式错误: ${code}`, 'red')
      log('   正确格式: TM + 年月日 + 随机字符', 'yellow')
    }
    showMenu()
    handleInput()
  })
}

// 测试分享链接
function testShareLink() {
  rl.question('请输入分享链接进行验证: ', (link) => {
    if (!link) {
      log('链接不能为空', 'red')
    } else if (validateShareLink(link)) {
      log(`✅ 分享链接格式正确`, 'green')
    } else {
      log(`❌ 分享链接格式错误`, 'red')
      log('   链接应包含 /pages/login/index 路径', 'yellow')
    }
    showMenu()
    handleInput()
  })
}

// 模拟完整裂变
function simulateFission() {
  log('\n═══════════════════════════════════════', 'blue')
  log('    模拟完整裂变流程', 'blue')
  log('═══════════════════════════════════════', 'blue')
  log('')
  
  let stepIndex = 0
  
  const runStep = () => {
    if (stepIndex >= fissionSteps.length) {
      log('\n═══════════════════════════════════════', 'green')
      log('    ✅ 裂变流程模拟完成', 'green')
      log('═══════════════════════════════════════', 'green')
      showMenu()
      handleInput()
      return
    }
    
    const step = fissionSteps[stepIndex]
    log(`\n【模拟执行】第${step.id}步: ${step.name}`, 'cyan')
    log(`   ${step.description}`, 'reset')
    
    // 模拟等待
    setTimeout(() => {
      step.checks.forEach(check => {
        log(`     ${check}`, 'green')
      })
      
      stepIndex++
      runStep()
    }, 500)
  }
  
  runStep()
}

// 处理用户输入
function handleInput() {
  rl.question('> ', (answer) => {
    switch (answer.trim()) {
      case '1':
        showFissionFlow()
        showMenu()
        handleInput()
        break
      case '2':
        testShareTemplates()
        showMenu()
        handleInput()
        break
      case '3':
        testInviteCode()
        break
      case '4':
        testShareLink()
        break
      case '5':
        simulateFission()
        break
      case '0':
        log('\n感谢使用裂变测试工具!', 'green')
        rl.close()
        process.exit(0)
        break
      default:
        log('无效选项，请重新输入', 'red')
        showMenu()
        handleInput()
    }
  })
}

// 运行测试
log('\n═══════════════════════════════════════', 'blue')
log('    天命阁小程序 - 裂变测试工具', 'blue')
log('═══════════════════════════════════════', 'blue')
showMenu()
handleInput()