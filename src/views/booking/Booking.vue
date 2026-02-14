<template>
  <div class="booking-container">
    <el-card>
      <!-- 头部：标题+新增按钮 -->
      <div class="booking-header">
        <h3>预订管理</h3>
        <el-button type="primary" icon="Plus" @click="openAddDialog">新增预订</el-button>
      </div>

      <!-- 预订列表：显示客户姓名、电话 -->
      <el-table
          :data="bookingListRef"
          border
          style="width: 100%;"
          v-loading="loading"
          element-loading-text="加载中..."
      >
        <el-table-column prop="bookingId" label="ID" width="80" />
        <el-table-column prop="bookingNo" label="预订编号" min-width="180" />
        <el-table-column prop="customerName" label="预订人" width="120" />
        <el-table-column prop="customerPhone" label="客户电话" width="140" />
        <el-table-column prop="roomNumber" label="房间号" width="100" />
        <el-table-column prop="checkInTime" label="入住时间" width="140">
          <template #default="scope">
            {{ scope.row.checkInTime?.split('T')[0] || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="checkOutTime" label="退房时间" width="140">
          <template #default="scope">
            {{ scope.row.checkOutTime?.split('T')[0] || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row?.status || '')">
              {{ scope.row?.status || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ scope.row.createTime?.split('T')[0] + ' ' + scope.row.createTime?.split('T')[1]?.slice(0,5) || '未知' }}
          </template>
        </el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <template v-if="scope.row">
              <el-button
                  type="primary"
                  size="small"
                  icon="Check"
                  @click="handleUpdateStatus(scope.row, '已入住')"
                  v-if="scope.row.status === '待入住'"
                  class="op-btn"
              >
                确认入住
              </el-button>
              <el-button
                  type="success"
                  size="small"
                  icon="CircleCheck"
                  @click="handleUpdateStatus(scope.row, '已退房')"
                  v-if="scope.row.status === '已入住'"
                  class="op-btn"
              >
                确认退房
              </el-button>
              <el-button
                  type="danger"
                  size="small"
                  icon="Close"
                  @click="handleUpdateStatus(scope.row, '已取消')"
                  v-if="scope.row.status === '待入住'"
                  class="op-btn"
              >
                取消预订
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增预订弹窗（完整表单） -->
    <el-dialog v-model="addDialogVisible" title="新增预订" width="600px" destroy-on-close>
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="120px">
        <!-- 选择客户（下拉框） -->
        <el-form-item label="预订客户" prop="customerId">
          <el-select v-model="addForm.customerId" placeholder="请选择客户">
            <el-option
                v-for="customer in customerList"
                :key="customer.customerId"
                :label="`${customer.name} (ID: ${customer.customerId})`"
                :value="customer.customerId"
            />
          </el-select>
        </el-form-item>

        <!-- 选择房间（仅显示“空闲”状态的房间） -->
        <el-form-item label="预订房间" prop="roomNumber">
          <el-select v-model="addForm.roomNumber" placeholder="请选择空闲房间">
            <el-option
                v-for="room in freeRoomList"
                :key="room.roomNumber"
                :label="`${room.roomNumber} (${room.typeName})`"
                :value="room.roomNumber"
            />
          </el-select>
        </el-form-item>

        <!-- 入住时间 -->
        <el-form-item label="入住时间" prop="checkInTime">
          <el-date-picker v-model="addForm.checkInTime" type="date" placeholder="选择入住日期" />
        </el-form-item>

        <!-- 退房时间 -->
        <el-form-item label="退房时间" prop="checkOutTime">
          <el-date-picker v-model="addForm.checkOutTime" type="date" placeholder="选择退房日期" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddBooking">确认预订</el-button>
      </template>
    </el-dialog>
  </div>

</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBookingListApi, updateBookingStatusApi, addBookingApi } from '@/api/booking'
import { getCustomerListApi } from '@/api/customer' // 客户列表接口
import { getFreeRoomListApi } from '@/api/room'   // 空闲房间列表接口

// 预订列表数据
const bookingListRef = ref([])
// 加载状态
const loading = ref(false)
// 新增预订弹窗状态
const addDialogVisible = ref(false)
const addFormRef = ref(null)
// 新增预订表单数据
const addForm = ref({
  customerId: null,    // 客户ID（关联customer表）
  roomNumber: null,    // 房间号（关联room表）
  checkInTime: '',     // 入住时间
  checkOutTime: ''     // 退房时间
})
// 客户列表（下拉选项）
const customerList = ref([])
// 空闲房间列表（下拉选项）
const freeRoomList = ref([])

// 验证退房时间晚于入住时间
const validateCheckOutTime = (rule, value, callback) => {
  if (!addForm.value.checkInTime || !value) {
    callback()
    return
  }
  if (new Date(value) <= new Date(addForm.value.checkInTime)) {
    callback(new Error('退房时间必须晚于入住时间'))
  } else {
    callback()
  }
}

// 新增预订表单验证规则
const addFormRules = ref({
  customerId: [{ required: true, message: '请选择预订客户', trigger: 'change' }],
  roomNumber: [{ required: true, message: '请选择预订房间', trigger: 'change' }],
  checkInTime: [{ required: true, message: '请选择入住时间', trigger: 'change' }],
  checkOutTime: [
    { required: true, message: '请选择退房时间', trigger: 'change' },
    { validator: validateCheckOutTime, trigger: 'change' }
  ]
})

// 页面挂载时加载客户和空闲房间列表
onMounted(async () => {
  await fetchBookingList()
  await fetchCustomerList()
  await fetchFreeRoomList()
})

// 加载客户列表
const fetchCustomerList = async () => {
  try {
    const res = await getCustomerListApi()
    if (res.data?.list) customerList.value = res.data.list
  } catch (error) {
    ElMessage.error('加载客户列表失败')
  }
}

// 加载空闲房间列表
const fetchFreeRoomList = async () => {
  try {
    const res = await getFreeRoomListApi()
    if (res.data?.list) freeRoomList.value = res.data.list
  } catch (error) {
    ElMessage.error('加载空闲房间列表失败')
  }
}

// 提交新增预订
const submitAddBooking = async () => {
  try {
    await addFormRef.value.validate()
    // 调用后端新增预订接口
    const res = await addBookingApi(addForm.value)
    if (res.code === 200) {
      ElMessage.success('预订成功！')
      addDialogVisible.value = false
      // 同步刷新预订列表和房间列表
      await fetchBookingList()
      await fetchFreeRoomList() // 刷新空闲房间（刚预订的房间会从列表中移除）
    }
  } catch (error) {
    ElMessage.error(`预订失败：${error.message || '未知错误'}`)
  }
}
// 页面挂载时加载数据
onMounted(async () => {
  await fetchBookingList()
})

// 加载预订列表
const fetchBookingList = async () => {
  loading.value = true
  try {
    const res = await getBookingListApi()
    // 适配后端返回的 {list: [...]} 格式
    if (res && res.code === 200 && res.data?.list && Array.isArray(res.data.list)) {
      bookingListRef.value = res.data.list
    } else {
      ElMessage.warning('预订列表数据异常')
      bookingListRef.value = []
    }
  } catch (error) {
    ElMessage.error('加载预订列表失败：' + (error.message || '未知错误'))
    bookingListRef.value = []
  } finally {
    loading.value = false
  }
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case '待入住': return 'info'
    case '已入住': return 'warning'
    case '已退房': return 'success'
    case '已取消': return 'danger'
    default: return 'default'
  }
}

// 更新预订状态
const handleUpdateStatus = async (row, status) => {
  try {
    await ElMessageBox.confirm(
        `确定将预订【${row.bookingNo}】的状态更新为【${status}】吗？`,
        '确认修改',
        { type: 'info' }
    )
    // 调用后端接口（传预订ID和新状态）
    const res = await updateBookingStatusApi({
      id: row.bookingId, // 对应后端的booking_id
      status: status
    })
    if (res && res.code === 200) {
      row.status = status // 本地更新状态（无需重新请求）
      ElMessage.success(`状态已更新为${status}`)
    } else {
      ElMessage.warning('更新失败，请重试')
    }
  } catch (error) {
    // 过滤“取消弹窗”的错误
    if (error !== 'cancel') {
      ElMessage.error('操作失败：' + (error.message || '未知错误'))
    }
  }
}
// 补充：打开新增预订弹窗的函数
const openAddDialog = () => {
  addDialogVisible.value = true
  // 重置表单（后续添加表单后需补充）
  resetAddForm()
}

// 补充：重置新增预订表单（后续添加表单后实现）
const resetAddForm = () => {
  addForm.value = {
    customerId: null,
    roomNumber: null,
    checkInTime: '',
    checkOutTime: ''
  }
  addFormRef.value?.clearValidate()
}
</script>

<style scoped>
.booking-container {
  padding: 20px;
}
.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.booking-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.op-btn {
  margin-right: 8px;
}
</style>