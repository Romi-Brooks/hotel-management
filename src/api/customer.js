import request from './request'

// 获取客户列表（用于新增预订的下拉选择）
export const getCustomerListApi = () => request({
    url: '/customer/list',
    method: 'get'
})