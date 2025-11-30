<template>
  <div class="room-container">
    <el-card>
      <div class="room-header">
        <h3>房间管理</h3>
        <el-button type="primary" icon="Plus" @click="openAddDialog">添加房间</el-button>
      </div>

      <el-table
          :data="roomList"
          border
          style="width: 100%; margin-top: 20px;"
          v-loading="loading"
      >
        <el-table-column prop="roomNumber" label="房间号" width="120" />
        <el-table-column prop="typeName" label="房间类型" width="150" />
        <el-table-column prop="bedType" label="床型" width="120" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope">
            {{ scope.row.price.toFixed(2) }} 元/晚
          </template>
        </el-table-column>
        <el-table-column prop="currentStatus" label="状态" width="120">
          <template #default="scope">
            <el-tag
                :type="scope.row.currentStatus === '空闲' ? 'success' :
                  scope.row.currentStatus === '已预订' ? 'warning' : 'danger'"
            >
              {{ scope.row.currentStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hotelName" label="所属酒店" width="180" />
        <el-table-column label="操作" width="240">
          <template #default="scope">
            <div style="display: flex; gap: 12px; align-items: center;">
              <el-button type="info" icon="InfoFilled" size="small" @click="openRoomDetail(scope.row)">
                详情
              </el-button>
              <el-button type="primary" icon="Edit" size="small" @click="openEditDialog(scope.row)">
                编辑
              </el-button>
              <el-button type="danger" icon="Delete" size="small" @click="deleteRoom(scope.row.roomNumber)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 房间详情弹窗 -->
    <el-dialog v-model="detailVisible" title="房间详情" width="600px">
      <el-form :model="currentRoom" label-width="120px" label-position="left">
        <el-form-item label="房间号">
          <span>{{ currentRoom.roomNumber }}</span>
        </el-form-item>
        <el-form-item label="房间类型">
          <span>{{ currentRoom.typeName }}</span>
        </el-form-item>
        <el-form-item label="床型">
          <span>{{ currentRoom.bedType }}</span>
        </el-form-item>
        <el-form-item label="价格">
          <span>{{ currentRoom.price ? currentRoom.price.toFixed(2) : 0 }} 元/晚</span>
        </el-form-item>
        <el-form-item label="房间状态">
          <el-tag
              :type="currentRoom.currentStatus === '空闲' ? 'success' :
              currentRoom.currentStatus === '已预订' ? 'warning' : 'danger'"
          >
            {{ currentRoom.currentStatus }}
          </el-tag>
        </el-form-item>
        <el-form-item label="所属酒店">
          <span>{{ currentRoom.hotelName }}</span>
        </el-form-item>
        <el-form-item label="酒店地址">
          <span>{{ currentRoom.hotelAddress || '暂无' }}</span>
        </el-form-item>
        <el-form-item label="联系电话">
          <span>{{ currentRoom.contactPhone || '暂无' }}</span>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 添加/编辑房间弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑房间' : '添加房间'" width="400px" destroy-on-close>
      <el-form ref="formRef" :model="roomForm" :rules="rules" label-width="100px">
        <el-form-item label="房间号" prop="roomNumber">
          <el-input v-model="roomForm.roomNumber" placeholder="请输入房间号" maxlength="8" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="房间类型" prop="roomTypeId">
          <el-select v-model="roomForm.roomTypeId" placeholder="请选择房间类型" clearable>
            <el-option
                v-for="item in roomTypeList"
                :key="item.roomTypeId"
                :label="`${item.typeName} (ID: ${item.roomTypeId})`"
                :value="item.roomTypeId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属酒店" prop="hotelId">
          <el-select v-model="roomForm.hotelId" placeholder="请选择所属酒店" clearable>
            <el-option
                v-for="item in hotelList"
                :key="item.hotelId"
                :label="`${item.hotelName} (ID: ${item.hotelId})`"
                :value="item.hotelId"
            />
          </el-select>
        </el-form-item>
        <!-- 修复：添加v-model.number强制转换为数字 -->
        <el-form-item label="价格" prop="price">
          <el-input v-model.number="roomForm.price" type="number" placeholder="请输入价格" min="0" step="0.01" />
        </el-form-item>
        <el-form-item label="房间状态">
          <el-select v-model="roomForm.currentStatus">
            <el-option label="空闲" value="空闲" />
            <el-option label="已预订" value="已预订" />
            <el-option label="维修中" value="维修中" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getRoomListApi, addRoomApi, editRoomApi, deleteRoomApi,
  getRoomTypeListApi, getHotelListApi
} from '@/api/room'

// 1. 详情弹窗相关
const detailVisible = ref(false)
const currentRoom = ref({})

// 2. 核心状态
const loading = ref(false)
const roomList = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false) // 新增：标记是否为编辑模式

// 3. 表单数据（初始值保持null/0）
const roomForm = ref({
  roomNumber: '',
  roomTypeId: null,
  hotelId: null,
  price: 0,
  currentStatus: '空闲'
})

// 4. 下拉列表
const roomTypeList = ref([])
const hotelList = ref([])

// 5. 修复：价格验证规则（自定义验证，避免类型冲突）
const validatePrice = (rule, value, callback) => {
  if (value === '' || value === null || value === undefined) {
    callback(new Error('请输入价格'))
  } else if (isNaN(Number(value)) || Number(value) < 0) {
    callback(new Error('请输入有效的非负数字'))
  } else {
    callback()
  }
}

// 表单验证规则
const rules = ref({
  roomNumber: [{ required: true, message: '请输入房间号', trigger: 'blur' }],
  roomTypeId: [{ required: true, message: '请选择房间类型', trigger: 'change' }],
  hotelId: [{ required: true, message: '请选择所属酒店', trigger: 'change' }],
  price: [{ validator: validatePrice, trigger: 'blur' }] // 改用自定义验证
})

// 6. 获取房间列表
const fetchRoomList = async () => {
  loading.value = true
  try {
    const res = await getRoomListApi()
    if (res.data?.list && Array.isArray(res.data.list)) {
      roomList.value = res.data.list
    } else {
      roomList.value = []
      ElMessage.warning('房间列表数据格式异常')
    }
  } catch (error) {
    ElMessage.error(`获取房间列表失败：${getErrorMsg(error)}`)
  } finally {
    loading.value = false
  }
}

// 7. 获取房间类型列表
const getRoomTypeList = async () => {
  try {
    const res = await getRoomTypeListApi()
    if (res.data?.list && Array.isArray(res.data.list)) {
      roomTypeList.value = res.data.list
    }
  } catch (error) {
    ElMessage.error(`获取房间类型失败：${getErrorMsg(error)}`)
  }
}

// 8. 获取酒店列表
const getHotelList = async () => {
  try {
    const res = await getHotelListApi()
    if (res.data?.list && Array.isArray(res.data.list)) {
      hotelList.value = res.data.list
    }
  } catch (error) {
    ElMessage.error(`获取酒店列表失败：${getErrorMsg(error)}`)
  }
}

// 9. 打开详情弹窗
const openRoomDetail = (row) => {
  currentRoom.value = row
  detailVisible.value = true
}

// 10. 打开添加房间弹窗（标记为非编辑模式）
const openAddDialog = () => {
  isEdit.value = false
  dialogVisible.value = true
  roomForm.value = {
    roomNumber: '',
    roomTypeId: null,
    hotelId: null,
    price: 0,
    currentStatus: '空闲'
  }
  getRoomTypeList()
  getHotelList()
  formRef.value?.clearValidate()
}

// 11. 打开编辑房间弹窗（标记为编辑模式）
const openEditDialog = (row) => {
  isEdit.value = true
  dialogVisible.value = true
  roomForm.value = { ...row }
  getRoomTypeList()
  getHotelList()
  formRef.value?.clearValidate()
}

// 12. 修复：提交表单（基于isEdit判断，而非roomNumber）
const submitForm = async () => {
  try {
    await formRef.value.validate()
    if (isEdit.value) {
      // 编辑模式：调用编辑接口
      await editRoomApi(roomForm.value)
      ElMessage.success('编辑房间成功')
    } else {
      // 添加模式：调用添加接口
      await addRoomApi(roomForm.value)
      ElMessage.success('添加房间成功')
    }
    dialogVisible.value = false
    fetchRoomList()
  } catch (error) {
    // 修复：显示统一的错误信息，避免undefined
    ElMessage.error(`操作失败：${getErrorMsg(error)}`)
  }
}

// 13. 删除房间
const deleteRoom = async (roomNumber) => {
  try {
    await ElMessageBox.confirm(
        '此操作将永久删除该房间，是否继续？',
        '删除确认',
        { type: 'warning', confirmButtonText: '确认', cancelButtonText: '取消' }
    )
    await deleteRoomApi(roomNumber)
    ElMessage.success('删除房间成功')
    fetchRoomList()
  } catch (error) {
    if (error !== 'cancel') { // 排除取消操作的错误
      ElMessage.error(`删除失败：${getErrorMsg(error)}`)
    } else {
      ElMessage.info('已取消删除')
    }
  }
}

// 工具函数：统一处理错误信息，避免undefined
const getErrorMsg = (error) => {
  if (error?.msg) return error.msg
  if (error?.message) return error.message
  if (typeof error === 'string') return error
  return '未知错误'
}

// 初始化
onMounted(() => {
  fetchRoomList()
  getRoomTypeList()
  getHotelList()
})
</script>

<style scoped>
.room-container {
  padding: 20px;
}
.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.room-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
:deep(.el-table__empty-text) {
  color: #999;
  font-size: 14px;
}
:deep(.el-input) {
  width: 100%;
}
:deep(.el-button--small) {
  min-width: 60px;
}
</style>