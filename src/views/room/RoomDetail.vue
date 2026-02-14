<template>
  <div class="room-detail-container">
    <el-card v-loading="loading">
      <!-- 房间基础信息 -->
      <div class="room-base-info">
        <h3>房间详情</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="房间号">{{ roomDetail?.roomNumber || '-' }}</el-descriptions-item>
          <el-descriptions-item label="房间类型">{{ roomDetail?.typeName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusTagType(roomDetail?.currentStatus)">{{ roomDetail?.currentStatus || '-' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="价格（元/天）">{{ roomDetail?.price || 0 }}</el-descriptions-item>
          <el-descriptions-item label="所属酒店" :span="2">{{ roomDetail?.hotelName || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 使用人信息（已预约/使用中） -->
      <div class="user-info" v-if="roomDetail?.userInfo">
        <h3 style="margin-top: 20px;">
          <el-icon><User /></el-icon>
          {{ roomDetail.userInfo.bookingStatus === '已入住' ? '使用人信息' : '预约人信息' }}
        </h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ roomDetail.userInfo.customerName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ roomDetail.userInfo.customerPhone }}</el-descriptions-item>
          <el-descriptions-item label="身份证/护照">{{ roomDetail.userInfo.customerIdCard || '无' }}</el-descriptions-item>
          <el-descriptions-item label="预订编号">{{ roomDetail.userInfo.bookingNo }}</el-descriptions-item>
          <el-descriptions-item label="入住时间">{{ formatDate(roomDetail.userInfo.checkInTime) }}</el-descriptions-item>
          <el-descriptions-item label="退房时间">{{ formatDate(roomDetail.userInfo.checkOutTime) }}</el-descriptions-item>
          <el-descriptions-item label="预订状态" :span="2">
            <el-tag :type="getBookingTagType(roomDetail.userInfo.bookingStatus)">
              {{ roomDetail.userInfo.bookingStatus }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 无使用人信息 -->
      <div class="no-user-info" v-else>
        <el-empty description="暂无预约/使用人信息" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { getRoomDetailApi } from '@/api/room'
import { formatDate } from '@/utils/date' // 自定义日期格式化工具

const route = useRoute()
const loading = ref(false)
const roomDetail = ref(null) // 房间详情数据

// 页面挂载时获取详情
onMounted(async () => {
  const roomNumber = route.params.roomNumber // 从路由获取房间号
  if (!roomNumber) {
    ElMessage.error('房间号不能为空')
    return
  }
  await fetchRoomDetail(roomNumber)
})

// 获取房间详情
const fetchRoomDetail = async (roomNumber) => {
  loading.value = true
  try {
    const res = await getRoomDetailApi(roomNumber)
    if (res.code === 200) {
      roomDetail.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取房间详情失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 房间状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case '空闲': return 'success'
    case '已预订': return 'warning'
    case '已入住': return 'danger'
    default: return 'default'
  }
}

// 预订状态标签类型
const getBookingTagType = (status) => {
  switch (status) {
    case '待入住': return 'warning'
    case '已入住': return 'danger'
    default: return 'default'
  }
}
</script>

<style scoped>
.room-detail-container {
  padding: 20px;
}
.room-base-info h3, .user-info h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #303133;
}
.no-user-info {
  margin-top: 20px;
  text-align: center;
}
</style>