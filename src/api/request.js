import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建Axios实例，指向后端服务地址
const service = axios.create({
    baseURL: 'http://127.0.0.1:8080/api', // 后端接口前缀
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器：添加JWT令牌（登录后存储的token）
service.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => {
        ElMessage.error('请求异常：' + error.message)
        return Promise.reject(error)
    }
)

// 响应拦截器：统一处理后端响应
service.interceptors.response.use(
    response => {
        const res = response.data
        // 后端统一返回 {code:200, data:..., msg:...}
        if (res.code !== 200) {
            ElMessage.error(res.msg || '请求失败')
            return Promise.reject(res)
        }
        return res
    },
    error => {
        ElMessage.error('网络错误：' + error.message)
        return Promise.reject(error)
    }
)

export default service