import request from './request'

// 获取房间列表接口（直接调用后端）
export const getRoomListApi = () => {
    return request({
        url: '/room/list',
        method: 'get'
    })
}

// 删除房间接口（参数校验+调用后端）
export const deleteRoomApi = (roomTypeId) => {
    if (!roomTypeId) {
        return Promise.reject(new Error('参数错误：缺少房间ID'))
    }
    return request({
        url: `/room/delete/${id}`,
        method: 'delete'
    })
}

// 新增房间接口（参数校验+调用后端）
export const addRoomApi = (roomForm) => {
    if (!roomForm.roomNumber || !roomForm.roomTypeId || !roomForm.price) {
        return Promise.reject(new Error('参数错误：房间号/类型/价格为必填项'))
    }
    return request({
        url: '/room/add',
        method: 'post',
        data: roomForm
    })
}

// 编辑房间接口（参数校验+调用后端）
export const editRoomApi = (roomForm) => {
    if (!roomForm.roomTypeId) {
        return Promise.reject(new Error('参数错误：缺少房间ID'))
    }
    return request({
        url: '/room/edit',
        method: 'put',
        data: roomForm
    })
}

// 5. 获取房间类型列表（必须导出，前端已导入）
export const getRoomTypeListApi = () => request({
    url: '/room/type/list', // 后端房间类型列表接口
    method: 'get'
})

// 6. 获取酒店列表（【关键】补充这个导出，解决报错）
export const getHotelListApi = () => request({
    url: '/hotel/list', // 后端酒店列表接口
    method: 'get'
})

export const getFreeRoomListApi = () => request({
    url: '/room/freeList', // 改为和后端路由一致的“freeList”（大写L）
    method: 'get'
})