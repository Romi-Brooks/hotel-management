<template>
  <!-- 路由视图出口：所有路由匹配的页面都会在这里渲染 -->
  <router-view />
</template>

<script setup>
// 根组件无需额外逻辑，所有业务逻辑分散在各页面和组件中
</script>

<!-- 全局基础样式：去除默认边距、设置高度继承，保证布局占满全屏 -->
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}

/* 解决 Element Plus 部分组件的滚动条样式问题 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 4px;
}

::-webkit-scrollbar-track {
  background-color: #f5f5f5;
  border-radius: 4px;
}
</style>