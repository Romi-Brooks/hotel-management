<template>
  <div class="admin-manage">
    <el-card>
      <div class="header">
        <h3>管理员管理</h3>
        <el-button type="primary" icon="Plus" @click="openAddDialog">添加管理员</el-button>
      </div>

      <!-- 管理员列表：修复create_time的prop -->
      <el-table :data="adminList" border style="width: 100%; margin-top: 20px;" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="管理员账号" width="150" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.role === 'super_admin'" type="danger">超级管理员</el-tag>
            <el-tag v-else type="info">普通管理员</el-tag>
          </template>
        </el-table-column>
        <!-- 修复prop为createTime，匹配后端字段 -->
        <el-table-column prop="createTime" label="创建时间" min-width="200" />
      </el-table>
    </el-card>

    <!-- 添加管理员弹窗 -->
    <el-dialog v-model="dialogVisible" title="添加管理员" width="400px" destroy-on-close>
      <el-form ref="formRef" :model="adminForm" :rules="rules" label-width="100px">
        <el-form-item label="管理员账号" prop="username">
          <el-input v-model="adminForm.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="初始密码" prop="password">
          <el-input v-model="adminForm.password" type="password" placeholder="请输入初始密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAdd">确定添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'
// 补充导入addAdminApi
import { getAdminListApi, addAdminApi } from '@/api/user'

const userStore = useUserStore()
const loading = ref(false)
const adminList = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)

// 添加管理员表单
const adminForm = ref({
  username: '',
  password: ''
})

// 表单验证规则
const rules = ref({
  username: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入初始密码', trigger: 'blur' }]
})

const fetchAdminList = async () => {
  loading.value = true
  try {
    const res = await getAdminListApi()
    console.log('管理员列表接口返回：', res)

    // 兼容后端两种格式：data是数组 或 data包含list字段
    let adminData = []
    if (Array.isArray(res.data)) {
      adminData = res.data
    } else if (res.data && Array.isArray(res.data.list)) {
      adminData = res.data.list
    } else {
      console.log('管理员列表数据格式不匹配，res.data：', res.data)
      ElMessage.warning('管理员列表数据格式异常')
    }
    adminList.value = adminData
  } catch (error) {
    console.log('获取管理员列表失败：', error)
    ElMessage.error('获取管理员列表失败')
    adminList.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAdminList()
})

// 打开添加弹窗
const openAddDialog = () => {
  dialogVisible.value = true
  adminForm.value = { username: '', password: '' }
  formRef.value?.clearValidate()
}

// 提交添加管理员：修复为调用真实API
const submitAdd = () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        await addAdminApi(adminForm.value) // 调用后端API
        ElMessage.success('添加管理员成功')
        dialogVisible.value = false
        fetchAdminList() // 刷新列表
      } catch (error) {
        ElMessage.error('添加管理员失败：' + (error.msg || error.message))
      }
    }
  })
}
</script>

<style scoped>
.admin-manage {
  padding: 20px 0;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
</style>