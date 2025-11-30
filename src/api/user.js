import request from './request'

// 登录接口
export const loginApi = (loginForm) => {
    return request({
        url: '/user/login',
        method: 'post',
        data: loginForm
    })
}

// 添加管理员接口
export const addAdminApi = (adminForm) => {
    return request({
        url: '/user/addAdmin',
        method: 'post',
        data: adminForm
    })
}

// 查询管理员列表接口
export const getAdminListApi = () => {
    return request({
        url: '/user/listAdmin',
        method: 'get'
    })
}

// 退出登录接口（前端仅清除本地存储，后端无需接口）
export const logoutApi = () => {
    return Promise.resolve({ success: true })
}