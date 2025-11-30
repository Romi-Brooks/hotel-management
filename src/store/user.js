import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('token') || '',
        userInfo: JSON.parse(localStorage.getItem('userInfo')) || {} // 新增role字段：super_admin/admin
    }),
    actions: {
        // 登录：存储角色信息
        login(userData) {
            const token = 'mock-token-' + Date.now()
            this.token = token
            // 保留传入的role角色字段
            this.userInfo = { username: userData.username, role: userData.role }
            localStorage.setItem('token', token)
            localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        },
        // 退出登录
        logout() {
            this.token = ''
            this.userInfo = {}
            localStorage.clear()
        },
        // 新增：添加管理员（超级管理员专属）
        addAdmin(newAdmin) {
            // 模拟存储管理员列表（实际项目需对接后端接口）
            let adminList = JSON.parse(localStorage.getItem('adminList')) || []
            adminList.push({
                id: Date.now(),
                username: newAdmin.username,
                password: newAdmin.password, // 实际项目需加密存储
                role: 'admin',
                createTime: new Date().toLocaleString()
            })
            localStorage.setItem('adminList', JSON.stringify(adminList))
        }
    },
    getters: {
        // 判断是否为超级管理员
        isSuperAdmin: (state) => state.userInfo.role === 'super_admin'
    }
})