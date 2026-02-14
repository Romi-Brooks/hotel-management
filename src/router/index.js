import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'
import Layout from '../views/layout/Layout.vue'
import RoomDetail from '@/views/room/RoomDetail.vue'
const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/login/Login.vue'),
        meta: { title: '登录' }
    },
    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        children: [
            { path: 'dashboard', name: 'Dashboard', component: () => import('../views/dashboard/Dashboard.vue'), meta: { title: '仪表盘', requiresAuth: true } },
            { path: 'room', name: 'Room', component: () => import('../views/room/Room.vue'), meta: { title: '房间管理', requiresAuth: true } },
            { path: 'booking', name: 'Booking', component: () => import('../views/booking/Booking.vue'), meta: { title: '预订管理', requiresAuth: true } },
            // 新增：管理员管理路由（仅超级管理员可访问）
            { path: 'admin-manage', name: 'AdminManage', component: () => import('../views/admin/AdminManage.vue'), meta: { title: '管理员管理', requiresAuth: true, requiresSuperAdmin: true } }
        ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/login' },
    {
        path: '/room/detail/:roomNumber', // 动态路由参数：房间号
        name: 'RoomDetail',
        component: RoomDetail
    }
]

const router = createRouter({ history: createWebHistory(), routes })

// 路由守卫：添加角色权限控制
router.beforeEach((to, from, next) => {
    const userStore = useUserStore()
    const isSuperAdmin = userStore.isSuperAdmin

    // 未登录跳转到登录页
    if (to.meta.requiresAuth && !userStore.token) {
        next('/login')
    }
    // 要求超级管理员权限，但当前用户不是
    else if (to.meta.requiresSuperAdmin && !isSuperAdmin) {
        ElMessage.warning('无权限访问该页面')
        next('/dashboard')
    }
    else {
        document.title = to.meta.title || '酒店管理后台'
        next()
    }
})

export default router