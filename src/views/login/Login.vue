<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">酒店管理后台</h2>
      <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-width="80px"
          class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" prefix-icon="User" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
              v-model="loginForm.password"
              prefix-icon="Lock"
              type="password"
              show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { loginApi } from '@/api/user' // 导入用户模块接口

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loginForm = ref({
  username: '',
  password: ''
})
const loginRules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

const handleLogin = async () => {
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 调用api层的登录接口
        const res = await loginApi(loginForm.value)
        if (res.data.error) {
          ElMessage.error(res.data.error)
          return
        }
        // 存储token和用户信息
        userStore.token = res.data.token
        userStore.userInfo = res.data.userInfo
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo))
        ElMessage.success('登录成功')
        router.push('/dashboard')
      } catch (error) {
        ElMessage.error('登录失败，请重试')
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-card {
  width: 400px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.login-title {
  text-align: center;
  margin-bottom: 20px;
  color: #1989fa;
}
.login-form {
  margin-top: 20px;
}
.login-btn {
  width: 100%;
}
</style>