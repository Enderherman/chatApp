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
</template>

<script setup>
import config from '../../../../../package.json'
//TODO 检查更新
const checkUpdate = () => {
  console.log('checkUpdate' + 'TODO 没写呢')
}
</script>

<style scoped lang="less"></style>
