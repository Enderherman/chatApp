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
      :force-get="avatarInfoStore.getForceReload(userId) || forceGet"
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
  },
  partType: {
    type: String,
    default: 'avatar'
  },
  forceGet: {
    type: Boolean,
    default: false
  }
})

const showDetailHandler = () => {
  if (!props.showDetail) {
    return
  }
  // 在点击时重置forceGet状态，触发头像更新
  if (props.userId) {
    // 假设avatarInfoStore是全局可用的
    avatarInfoStore.setForceReload(props.userId, true)

    // 设置一个短暂的延时，稍后将forceGet重置回false
    setTimeout(() => {
      avatarInfoStore.setForceReload(props.userId, false)
    }, 50)
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
