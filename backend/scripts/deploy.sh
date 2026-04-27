#!/bin/bash
#========================================
# 天命阁 - 一键自动化部署脚本
#========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 项目目录
PROJECT_DIR="/opt/tianming-dimis"
ENV_FILE="$PROJECT_DIR/.env"

#========================================
# 前置检查
#========================================
check_requirements() {
    log_info "检查系统依赖..."
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，正在安装..."
        curl -fsSL https://get.docker.com | sh
        systemctl start docker
        systemctl enable docker
    fi
    
    # 检查docker-compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "docker-compose 未安装"
        exit 1
    fi
    
    # 检查.env
    if [ ! -f "$ENV_FILE" ]; then
        log_warn ".env 文件不存在，创建模板..."
        cp .env.example $ENV_FILE
        log_warn "请编辑 $ENV_FILE 填写配置"
        exit 1
    fi
    
    log_info "前置检查完成 ✓"
}

#========================================
# 配置检查
#========================================
check_config() {
    log_info "检查配置文件..."
    
    source $ENV_FILE
    
    # 必填配置
    local missing=()
    
    [ -z "$DB_PASSWORD" ] && missing+=("DB_PASSWORD")
    [ -z "$MYSQL_ROOT_PASSWORD" ] && missing+=("MYSQL_ROOT_PASSWORD")
    [ -z "$WECHAT_APPID" ] && missing+=("WECHAT_APPID")
    [ -z "$WECHAT_SECRET" ] && missing+=("WECHAT_SECRET")
    
    if [ ${#missing[@]} -gt 0 ]; then
        log_error "缺少必填配置: ${missing[*]}"
        log_error "请编辑 $ENV_FILE 填写以上配置"
        exit 1
    fi
    
    log_info "配置检查完成 ✓"
}

#========================================
# 拉取/更新代码
#========================================
pull_code() {
    log_info "更新代码..."
    
    if [ -d "$PROJECT_DIR/.git" ]; then
        cd $PROJECT_DIR
        git pull origin main
    else
        log_warn "不是Git仓库，跳过代码更新"
    fi
    
    log_info "代码更新完成 ✓"
}

#========================================
# 构建镜像
#========================================
build_images() {
    log_info "构建Docker镜像..."
    
    cd $PROJECT_DIR
    docker-compose build --no-cache
    
    log_info "镜像构建完成 ✓"
}

#========================================
# 启动服务
#========================================
start_services() {
    log_info "启动服务..."
    
    cd $PROJECT_DIR
    docker-compose up -d
    
    log_info "服务启动完成 ✓"
}

#========================================
# 等待服务就绪
#========================================
wait_ready() {
    log_info "等待服务就绪..."
    
    local max_wait=60
    local count=0
    
    while [ $count -lt $max_wait ]; do
        if curl -sf http://localhost:3000/health &>/dev/null; then
            log_info "应用已就绪 ✓"
            return 0
        fi
        
        # 检查MySQL
        if docker-compose exec -T db mysql -u root -p$MYSQL_ROOT_PASSWORD -e "SELECT 1" &>/dev/null; then
            log_info "MySQL已就绪 ✓"
        fi
        
        sleep 2
        count=$((count + 2))
        echo -n "."
    done
    
    echo ""
    log_warn "服务启动超时，请检查日志"
    docker-compose logs
    return 1
}

#========================================
# 健康检查
#========================================
health_check() {
    log_info "执行健康检查..."
    
    local endpoints=(
        "http://localhost:3000/health"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -sf $endpoint &>/dev/null; then
            log_info "✓ $endpoint"
        else
            log_error "✗ $endpoint"
            return 1
        fi
    done
    
    log_info "健康检查通过 ✓"
}

#========================================
# 显示服务状态
#========================================
show_status() {
    log_info "服务状态:"
    docker-compose ps
    
    echo ""
    log_info "访问地址:"
    echo "  - API: http://localhost:3000"
    echo "  - Health: http://localhost:3000/health"
    
    echo ""
    log_info "常用命令:"
    echo "  - 查看日志: docker-compose logs -f"
    echo "  - 重启服务: docker-compose restart"
    echo "  - 停止服务: docker-compose down"
}

#========================================
# 主流程
#========================================
main() {
    echo "========================================"
    echo "   天命阁 - 自动化部署脚本"
    echo "========================================"
    echo ""
    
    check_requirements
    check_config
    
    if [ "$1" == "--skip-build" ]; then
        log_info "跳过构建步骤"
    else
        pull_code
        build_images
    fi
    
    start_services
    wait_ready
    health_check
    show_status
    
    echo ""
    log_info "部署完成！"
}

# 运行
main "$@"
