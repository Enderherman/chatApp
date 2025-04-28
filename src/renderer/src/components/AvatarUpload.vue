<template>
  <div class="avatar-upload">
    <div class="avatar-show">
      <template v-if="modelValue">
        <el-image v-if="preview" :src="localFile" fit="scale-down"></el-image>
        <ShowLocalImage
          v-else
          :file-id="props.modelValue"
          part-type="avatar"
          :width="40"
        ></ShowLocalImage>
      </template>
      <template v-else>
        <el-upload
          name="file"
          :show-file-list="false"
          accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF ,. bmp, .BMP"
          :multiple="false"
          :http-request="uploadImage"
        >
          <span class="iconfont icon-add"></span>
        </el-upload>
      </template>
    </div>
    <div class="select-btn">
      <el-upload
        name="file"
        :show-file-list="false"
        accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF ,. bmp, .BMP"
        :multiple="false"
        :http-request="uploadImage"
      >
        <el-button type="primary" size="small">选择</el-button>
      </el-upload>
    </div>
  </div>
</template>

<script setup>
import ShowLocalImage from '@/components/ShowLocalImage.vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'

//TODO preview预览
const preview = computed(() => {
  return props.modelValue instanceof File
})

const props = defineProps({
  modelValue: {
    type: [Object, String],
    default: null
  }
})

/**
 * 头像上传
 */
const localFile = ref(null)
const emit = defineEmits(['coverFile'])
const uploadImage = async (file) => {
  file = file.file
  window.ipcRenderer.send('createCover', file.path)
}

onMounted(() => {
  window.ipcRenderer.on('createCoverCallback', (event, { avatarStream, coverStream }) => {
    const coverBlob = new Blob([coverStream], { type: 'image/jpeg' })
    const coverFile = new File([coverBlob], 'cover.jpg', { type: 'image/jpeg' })
    let img = new FileReader()
    img.readAsDataURL(coverFile)
    img.onload = (target) => {
      localFile.value = target.target.result
    }

    const avatarBlob = new Blob([avatarStream], { type: 'image/jpeg' })
    const avatarFile = new File([avatarBlob], 'avatar.jpg', { type: 'image/jpeg' })
    emit('coverFile', { avatarFile, coverFile })
  })
})

onUnmounted(() => {
  window.ipcRenderer.removeAllListeners('createCoverCallback')
})
</script>

<style scoped lang="less">
.avatar-upload {
  display: flex;
  justify-content: center;
  align-items: end;
  line-height: normal;

  .avatar-show {
    background: #ededed;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;

    .icon-add {
      font-size: 30px;
      color: #b9b9b9;
      width: 60px;
      height: 60px;
      text-align: center;
      line-height: 60px;
    }

    img {
      width: 100%;
      height: 100%;
    }

    .op {
      position: absolute;
      color: #0e8aef;
      top: 80px;
    }
  }

  .select-btn {
    vertical-align: bottom;
    margin-left: 5px;
  }
}
</style>
