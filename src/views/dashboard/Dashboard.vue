<template>
  <div class="dashboard-container">
    <!-- 头部：打招呼 + 日期 -->
    <div class="dashboard-header">
      <div class="greeting">
        <h1>{{ greetingText }}, 管理员</h1>
        <p class="current-date">{{ currentDate }}</p>
      </div>
    </div>

    <!-- 第一行统计卡片：核心指标 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card class="stat-card primary-card">
          <div class="stat-item">
            <span class="stat-label">总房间数</span>
            <span class="stat-value">{{ dashboardDataRef?.roomTotal || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card success-card">
          <div class="stat-item">
            <span class="stat-label">空闲房间数</span>
            <span class="stat-value">{{ dashboardDataRef?.roomFree || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card warning-card">
          <div class="stat-item">
            <span class="stat-label">已预订数</span>
            <span class="stat-value">{{ dashboardDataRef?.bookingTotal || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card info-card">
          <div class="stat-item">
            <span class="stat-label">今日入住数</span>
            <span class="stat-value">{{ dashboardDataRef?.checkInToday || 0 }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行统计卡片：收入 + 入住率 -->
    <el-row :gutter="20" class="stat-row" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card class="stat-card danger-card">
          <div class="stat-item">
            <span class="stat-label">今日收入 (元)</span>
            <span class="stat-value">¥{{ (dashboardDataRef?.revenueDay || 0).toFixed(2) }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="stat-card purple-card">
          <div class="stat-item">
            <span class="stat-label">当前入住率</span>
            <span class="stat-value">{{ ((dashboardDataRef?.occupancyRate || 0) * 100).toFixed(2) }}%</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 房间状态分布表格 -->
    <div class="table-section" style="margin-top: 30px;">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>房间状态分布详情</span>
          </div>
        </template>
        <el-table :data="roomStatusTableData" border style="width: 100%;">
          <el-table-column prop="status" label="房间状态" align="center" />
          <el-table-column prop="count" label="数量" align="center" />
          <el-table-column prop="proportion" label="占比" align="center">
            <template #default="scope">
              {{ scope.row.proportion }}%
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getDashboardDataApi } from '@/api/dashboard' // 导入仪表盘接口

// 仪表盘数据（初始化与后端字段一致）
const dashboardDataRef = ref({
  roomTotal: 0,
  roomFree: 0,
  bookingTotal: 0,
  checkInToday: 0,
  revenueDay: 0,
  occupancyRate: 0
})

// 计算当前时间的打招呼文案
const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return '早安'
  if (hour >= 12 && hour < 14) return '午安'
  if (hour >= 14 && hour < 18) return '下午好'
  if (hour >= 18 && hour < 22) return '晚上好'
  return '夜深了，注意休息'
})

// 计算当前日期
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 房间状态分布表格数据（从仪表盘数据计算）
const roomStatusTableData = computed(() => {
  const total = dashboardDataRef.value.roomTotal || 1 // 避免除零
  const free = dashboardDataRef.value.roomFree
  const booked = dashboardDataRef.value.bookingTotal
  const checkIn = dashboardDataRef.value.checkInToday

  return [
    {
      status: '空闲',
      count: free,
      proportion: ((free / total) * 100).toFixed(2)
    },
    {
      status: '已预订',
      count: booked,
      proportion: ((booked / total) * 100).toFixed(2)
    },
    {
      status: '已入住',
      count: checkIn,
      proportion: ((checkIn / total) * 100).toFixed(2)
    },
    {
      status: '其他（维修/停用）',
      count: total - free - booked - checkIn,
      proportion: (((total - free - booked - checkIn) / total) * 100).toFixed(2)
    }
  ]
})

// 加载仪表盘数据
onMounted(async () => {
  try {
    const res = await getDashboardDataApi()
    if (res && res.code === 200 && res.data) {
      dashboardDataRef.value = res.data
    } else {
      ElMessage.warning('仪表盘数据加载异常')
    }
  } catch (error) {
    ElMessage.error('仪表盘数据加载失败：' + (error.message || '未知错误'))
    console.error('Dashboard API Error:', error)
  }
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

/* 头部打招呼样式 */
.dashboard-header {
  margin-bottom: 20px;
}
.greeting h1 {
  margin: 0;
  font-size: 28px;
  color: #303133;
}
.current-date {
  margin: 8px 0 0 0;
  font-size: 16px;
  color: #909399;
}

/* 统计卡片行 */
.stat-row {
  margin-bottom: 10px;
}
.stat-card {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s ease;
}
.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
.stat-item {
  text-align: center;
  width: 100%;
}
.stat-label {
  font-size: 16px;
  display: block;
  margin-bottom: 10px;
  color: #666;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
}

/* 不同主题色卡片 */
.primary-card .stat-value { color: #1989fa; }
.success-card .stat-value { color: #52c41a; }
.warning-card .stat-value { color: #faad14; }
.info-card .stat-value { color: #13c2c2; }
.danger-card .stat-value { color: #f5222d; }
.purple-card .stat-value { color: #722ed1; }

/* 表格区域 */
.table-section {
  margin-top: 30px;
}
.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* 表格样式优化 */
:deep(.el-table) {
  --el-table-header-text-color: #666;
  --el-table-row-hover-bg-color: #f8f9fa;
}
</style>