import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'), // 配置@为src路径
            base: process.env.NODE_ENV === 'production' ? '/https://github.com/Romi-Brooks/hotel-management/' : '/' // 仓库名
        }
    }
})