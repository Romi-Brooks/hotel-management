import request from './request'

// 1. 获取预订列表
export const getBookingListApi = () => request({
    url: '/booking/list',
    method: 'get'
})

// 2. 更新预订状态
export const updateBookingStatusApi = (data) => request({
    url: '/booking/updateStatus',
    method: 'post',
    data: data
})

export const addBookingApi = (data) => request({
    url: 'booking/add', // 和后端路由路径完全一致
    method: 'post',
    data: data
})
