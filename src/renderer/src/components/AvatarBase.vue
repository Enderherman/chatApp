<template>
  <div
    class="user-avatar"
    :style="{ width: width + 'px ', height: width + 'px', 'border-radius': borderRadius + 'px' }"
    @click="showDetailHandler"
  >
    <ShowLocalImage :width="width" :file-id="userId" part-type="avatar" :force-get="true">
    </ShowLocalImage>
  </div>
</template>

<script setup>
//事件类型
const props = defineProps({
  userId: {
    type: String
  },
  width: {
    type: Number,
    default: 40
  },
  borderRadius: {
    type: Number,
    default: 0
  },
  showDetail: {
    type: Boolean,
    default: false
  }
})

const showDetailHandler = () => {
  if (!props.showDetail) {
    return
  }
  //TODO 打开本地图 查看图片
}
</script>

<style scoped lang="less">
.user-avatar {
  background: #d3d3d3;
  display: flex;
  overflow: hidden;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}
</style>
