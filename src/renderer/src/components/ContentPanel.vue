<template>
  <div class="content-panel" :style="{ 'border-top': showTopBorder ? '1px solid #ddd' : 'none' }">
    <div class="content-inner">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  showTopBorder: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped lang="less">
.content-panel {
  overflow: auto;
  height: calc(100vh - 62px);

  .content-inner {
    /* 去掉原先的固定宽度 */ /* width: 400px; */ /* 让内部容器自动水平居中 */
    margin: 0 auto; /* 如果想让两侧都留 125px，可以在内部容器上限制最大宽度。 这样无论屏幕多宽，content-inner 只会占据除去 125*2 后的中间部分， 并自动居中 */
    max-width: calc(100% - 250px); /* “顶格”即不加额外的上边距 */
  }
}
</style>
