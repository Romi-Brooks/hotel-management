// src/api/dashboard.js
// 1. 去掉原来的 `generateMockData` 导入，只导入默认导出的 Axios 实例
import request from './request'

// 2. 替换为调用真实后端的仪表盘接口（后续需让后端补充 `/api/dashboard` 接口）
export const getDashboardDataApi = () => {
    // 调用后端的仪表盘数据接口（假设后端后续会实现该接口）
    return request({
        url: '/dashboard', // 后端仪表盘接口路径
        method: 'get'
    })
}