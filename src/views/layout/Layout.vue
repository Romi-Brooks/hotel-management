<template>
  <el-container style="height: 100vh;">
    <el-aside width="200px" style="background-color: #2e3b4e;">
      <div class="logo">无年 | 酒店管理系统</div>
      <el-menu
          default-active="1"
          class="el-menu-vertical-demo"
          background-color="#2e3b4e"
          text-color="#fff"
          active-text-color="#ffd04b"
          router
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        <el-menu-item index="/room">
          <el-icon><House /></el-icon>
          <template #title>房间管理</template>
        </el-menu-item>
        <el-menu-item index="/booking">
          <el-icon><Calendar /></el-icon>
          <template #title>预订管理</template>
        </el-menu-item>
        <!-- 仅超级管理员显示：管理员管理菜单 -->
        <el-menu-item index="/admin-manage" v-if="userStore.isSuperAdmin">
          <el-icon><UserFilled /></el-icon>
          <template #title>管理员管理</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header-container">
        <div class="user-info">
          <el-dropdown>
            <span class="user-dropdown">
              <el-icon class="user-icon"><User /></el-icon>
              {{ userStore.userInfo.username }}
              <span v-if="userStore.isSuperAdmin" style="color: #ffd04b; margin-left: 4px;">(超级管理员)</span>
              <span v-else style="color: #666; margin-left: 4px;">(管理员)</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
// 关键修复：删除多余的 Logout 导入，只保留实际用到的图标
import { Odometer, House, Calendar, User, UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { logoutApi } from '@/api/user'

const userStore = useUserStore()
const router = useRouter()

const handleLogout = async () => {
  await logoutApi()
  userStore.logout()
  ElMessage.success('退出成功')
  router.push('/login')
}


</script>

<style scoped>
.el-aside { color: #333; }
.logo {
  text-align: center; font-size: 18px; line-height: 60px;
  color: #fff; background-color: #1f2d3d; margin-bottom: 10px;
}
.header-container {
  background-color: #fff; color: #333; line-height: 60px;
  border-bottom: 1px solid #e6e6e6; padding: 0 20px;
  display: flex; justify-content: flex-end; align-items: center; height: 60px;
}
.user-info { margin-top: 2px; }
.user-dropdown {
  display: inline-flex; align-items: center; cursor: pointer;
  color: #333; font-size: 14px; padding: 8px 12px;
  border-radius: 4px; transition: background-color 0.2s;
}
.user-dropdown:hover { background-color: #f5f5f5; }
.user-icon { margin-right: 6px; font-size: 16px; }
</style>