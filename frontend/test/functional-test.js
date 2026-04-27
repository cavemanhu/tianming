/**
 * 天命阁小程序 - 功能测试脚本
 */

const fs = require('fs')
const path = require('path')

const testConfig = {
  projectRoot: path.join(__dirname, '../'),
  srcRoot: path.join(__dirname, '../src'),
  pages: ['login', 'index', 'input', 'fortune', 'history', 'profile', 'share', 'invite'],
  components: [
    'FortuneCard', 'LevelBadge', 'LoadingSpinner', 'WuxingChart', 'ShareCard',
    'DateTimePicker', 'TimePickerModal', 'BaziDisplay', 'BaziChart', 'LoveMatchCard'
  ]
}

const colors = { reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m' }

function log(msg, color = 'reset') { console.log(`${colors[color]}${msg}${colors.reset}`) }

const testResults = { passed: [], failed: [] }

function addPassed(test) { testResults.passed.push(test); log(`✅ PASS: ${test}`, 'green') }
function addFailed(test, reason) { testResults.failed.push({ test, reason }); log(`❌ FAIL: ${test} - ${reason}`, 'red') }

function testPageFilesExist() {
  log('\n📁 测试1: 页面文件存在性检查', 'blue')
  testConfig.pages.forEach(page => {
    const filePath = path.join(testConfig.srcRoot, 'pages', page, 'index.vue')
    if (fs.existsSync(filePath)) addPassed(`页面 ${page} 存在`)
    else addFailed(`页面 ${page}`, '文件不存在')
  })
}

function testComponentFilesExist() {
  log('\n📦 测试2: 组件文件存在性检查', 'blue')
  testConfig.components.forEach(component => {
    const filePath = path.join(testConfig.srcRoot, 'components', component, `${component}.vue`)
    if (fs.existsSync(filePath)) addPassed(`组件 ${component} 存在`)
    else addFailed(`组件 ${component}`, '文件不存在')
  })
}

function testConfigFiles() {
  log('\n⚙️ 测试3: 配置文件完整性', 'blue')
  const configFiles = ['pages.json', 'manifest.json', 'package.json', 'vite.config.js']
  configFiles.forEach(file => {
    const filePath = path.join(testConfig.projectRoot, file)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      if (content.trim().length === 0) addFailed(`配置文件 ${file}`, '文件为空')
      else addPassed(`配置文件 ${file} 存在`)
    } else addFailed(`配置文件 ${file}`, '文件不存在')
  })
}

function testStyleFiles() {
  log('\n🎨 测试4: 样式文件完整性', 'blue')
  const styleFiles = ['uni.scss', 'styles/variables.scss', 'styles/mixins.scss', 'styles/common.scss', 'styles/animations.scss']
  styleFiles.forEach(file => {
    const filePath = path.join(testConfig.srcRoot, file)
    if (fs.existsSync(filePath)) addPassed(`样式 ${file} 存在`)
    else addFailed(`样式 ${file}`, '文件不存在')
  })
}

function testPagesJson() {
  log('\n🔗 测试5: 页面路由配置检查', 'blue')
  const pagesJsonPath = path.join(testConfig.projectRoot, 'pages.json')
  if (!fs.existsSync(pagesJsonPath)) { addFailed('pages.json', '配置文件不存在'); return }
  try {
    const config = JSON.parse(fs.readFileSync(pagesJsonPath, 'utf-8'))
    if (config.pages && Array.isArray(config.pages)) {
      addPassed(`pages.json 包含 ${config.pages.length} 个页面配置`)
      const requiredPages = ['login', 'index', 'fortune']
      requiredPages.forEach(page => {
        const found = config.pages.find(p => p.path && p.path.includes(page))
        if (found) addPassed(`页面 ${page} 已配置路由`)
        else addFailed(`页面 ${page} 未配置路由`, '缺少必需页面')
      })
    } else addFailed('pages.json', 'pages字段格式错误')
  } catch (e) { addFailed('pages.json', `解析错误: ${e.message}`) }
}

function testApiServices() {
  log('\n🌐 测试6: API服务层完整性', 'blue')
  const serviceFiles = ['services/index.js', 'services/user.js', 'services/fortune.js']
  serviceFiles.forEach(file => {
    const filePath = path.join(testConfig.srcRoot, file)
    if (fs.existsSync(filePath)) addPassed(`服务 ${file} 存在`)
    else addFailed(`服务 ${file}`, '文件不存在')
  })
}

function testUtils() {
  log('\n🛠️ 测试7: 工具函数完整性', 'blue')
  const utilFiles = ['utils/request.js', 'utils/auth.js', 'utils/storage.js']
  utilFiles.forEach(file => {
    const filePath = path.join(testConfig.srcRoot, file)
    if (fs.existsSync(filePath)) addPassed(`工具 ${file} 存在`)
    else addFailed(`工具 ${file}`, '文件不存在')
  })
}

function testStore() {
  log('\n📊 测试8: 状态管理完整性', 'blue')
  const storeFiles = ['store/index.js', 'store/user.js', 'store/fortune.js']
  storeFiles.forEach(file => {
    const filePath = path.join(testConfig.srcRoot, file)
    if (fs.existsSync(filePath)) addPassed(`Store ${file} 存在`)
    else addFailed(`Store ${file}`, '文件不存在')
  })
}

function testComponentImports() {
  log('\n📝 测试9: 组件导出检查', 'blue')
  const componentIndexPath = path.join(testConfig.srcRoot, 'components', 'index.js')
  if (fs.existsSync(componentIndexPath)) {
    const content = fs.readFileSync(componentIndexPath, 'utf-8')
    let missing = 0
    testConfig.components.forEach(component => {
      if (!content.includes(component)) { missing++; addFailed(`组件导出 ${component}`, '未导出') }
    })
    if (missing === 0) addPassed('所有组件已导出到index.js')
  } else addFailed('components/index.js', '文件不存在')
}

function testVueSyntax() {
  log('\n💻 测试10: Vue文件语法检查', 'blue')
  let checked = 0, hasIssues = 0
  const mainPages = ['index', 'login', 'fortune']
  mainPages.forEach(page => {
    const filePath = path.join(testConfig.srcRoot, 'pages', page, 'index.vue')
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      const templateMatch = content.includes('<template>')
      const scriptMatch = content.includes('<script>')
      if (!templateMatch) { addFailed(filePath, '缺少template'); hasIssues++ }
      if (!scriptMatch) { addFailed(filePath, '缺少script'); hasIssues++ }
      checked++
    }
  })
  if (checked > 0 && hasIssues === 0) addPassed(`Vue文件语法基本正确 (检查${checked}个文件)`)
}

function runTests() {
  log('\n═══════════════════════════════════════', 'blue')
  log('    天命阁小程序 - 功能测试', 'blue')
  log('═══════════════════════════════════════', 'blue')
  const startTime = Date.now()
  testPageFilesExist()
  testComponentFilesExist()
  testConfigFiles()
  testStyleFiles()
  testPagesJson()
  testApiServices()
  testUtils()
  testStore()
  testComponentImports()
  testVueSyntax()
  log('\n═══════════════════════════════════════', 'blue')
  log('    测试结果汇总', 'blue')
  log('═══════════════════════════════════════', 'blue')
  const totalTests = testResults.passed.length + testResults.failed.length
  const passRate = totalTests > 0 ? ((testResults.passed.length / totalTests) * 100).toFixed(1) : 0
  log(`\n✅ 通过: ${testResults.passed.length}`, 'green')
  log(`❌ 失败: ${testResults.failed.length}`, testResults.failed.length > 0 ? 'red' : 'reset')
  log(`📊 通过率: ${passRate}%`, passRate >= 80 ? 'green' : 'yellow')
  log(`⏱️ 耗时: ${Date.now() - startTime}ms`, 'reset')
  if (testResults.failed.length > 0) {
    log('\n失败详情:', 'red')
    testResults.failed.forEach(({ test, reason }) => { log(`  • ${test}: ${reason}`, 'red') })
  }
  log('\n═══════════════════════════════════════', 'blue')
  process.exit(testResults.failed.length > 0 ? 1 : 0)
}

runTests()