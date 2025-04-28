<template>
  <div
    class="user-avatar"
    :style="{ width: width + 'px ', height: width + 'px', 'border-radius': borderRadius + 'px' }"
    @click="showDetailHandler"
  >
    <ShowLocalImage
      :width="width"
      :file-id="userId"
      part-type="avatar"
      :force-get="avatarInfoStore.getForceReload(userId)"
    >
    </ShowLocalImage>
  </div>
</template>

<script setup>
import { useAvatarInfoStore } from '@/stores/AvatarUploadStore'

const avatarInfoStore = useAvatarInfoStore()
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
  window.ipcRenderer.send('newWindow', {
    windowId: 'media',
    title: '图片查看',
    path: '/showMedia',
    data: {
      fileList: [
        {
          fileId: props.userId,
          fileType: 0,
          partType: 'avatar',
          status: 1,
          forceGet: true
        }
      ]
    }
  })
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
