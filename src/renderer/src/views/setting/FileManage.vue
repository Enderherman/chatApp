<template>
  <ContentPanel v-loading="copying" element-loading-text="正在移动文件">
    <el-form
      ref="formDataRef"
      label-position="top"
      :model="formData"
      :rules="rules"
      label-width="80px"
      @submit.prevent
    >
      <el-form-item label="文件管理" prop="" class="file-manage">
        <div class="file-input" :title="formData.sysSetting">
          {{ formData.sysSetting === '' ? formData.sysSetting : 'TODO没写呢' }}
        </div>
        <div class="tips">文件的默认保存位置</div>
      </el-form-item>
      <el-form-item label="" prop="">
        <el-button type="primary" @click="changeFolder">保存更改</el-button>
        <el-button type="primary" @click="openLocalFolder">打开文件夹</el-button>
      </el-form-item>
    </el-form>
  </ContentPanel>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({})
const formDataRef = ref()
const rules = {}

const copying = ref(false)

//TODO 获取文件缓存路径

//保存更改目录
const changeFolder = () => {}

//打开文件夹
const openLocalFolder = () => {}
</script>

<style scoped lang="less">
.file-manage {
  :deep(.el-form-item__content) {
    display: block;
  }

  .file-input {
    background: #fff;
    padding: 0 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 16px;
  }

  .tips {
    color: #888888;
    font-size: 13px;
  }
}
</style>
