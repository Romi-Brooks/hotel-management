import Mock from 'mockjs'

// 模拟房间数据
export const roomList = Mock.mock({
    'list|10-20': [
        {
            'id|+1': 1,
            'roomNumber|100-999': 1,
            'type|1': ['单人间', '双人间', '大床房', '套房'],
            'price|100-1000': 1,
            'status|1': ['空闲', '已预订', '维修中'],
            'floor|1-20': 1
        }
    ]
}).list

// 模拟预订数据
export const bookingList = Mock.mock({
    'list|10-20': [
        {
            'id|+1': 1,
            'bookingNo': '@guid',
            'username': '@cname',
            'roomNumber|100-999': 1,
            'checkInTime': '@date("yyyy-MM-dd")',
            'checkOutTime': '@date("yyyy-MM-dd")',
            'status|1': ['待入住', '已入住', '已退房', '已取消']
        }
    ]
}).list

// 模拟统计数据
export const dashboardData = {
    roomTotal: 120,
    roomFree: 45,
    bookingTotal: 89,
    bookingCheckIn: 32
}

// 模拟异步请求
export const request = (data, delay = 500) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ code: 200, data, msg: '请求成功' })
        }, delay)
    })
}