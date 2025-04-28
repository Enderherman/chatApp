<template>
  <ContentPanel>
    <el-form ref="formDataRef" label-width="80px" @submit.prevent></el-form>
    <el-form-item label="版本信息">
      <div class="version-info">
        <div>WeTalk {{ config.version }}</div>
        <div>
          <el-button type="primary" @click="checkUpdate">检查更新</el-button>
        </div>
      </div>
    </el-form-item>
  </ContentPanel>
  <Update ref="updateRef" :auto-update="false"></Update>
</template>

<script setup>
import config from '../../../../../package.json'
import Update from '@/views/Update.vue'
import { ref } from 'vue'

/**
 * 检查更新
 */
const updateRef = ref()
const checkUpdate = () => {
  updateRef.value.checkUpdate()
}
</script>

<style scoped lang="less"></style>
