<template>
  <ContentPanel>
    <div class="search-form">
      <el-input
        v-model="contactId"
        clearable
        placeholder="请输入用户ID或者群组ID"
        size="large"
        @keydown.enter="search"
      ></el-input>
      <div class="search-btn iconfont icon-search" @click="search"></div>
    </div>
    <div v-if="searchResult && Object.keys(searchResult).length > 0" class="search-result-panel">
      <div class="search-result">
        <span class="contact-type">{{ contactTypeName }}</span>
        <!--TODO P15 23:03-->
      </div>
    </div>
    <div v-if="!searchResult" class="no-data">没有结果都</div>
  </ContentPanel>
</template>

<script setup>
import { ref } from 'vue'

import Api from '@/utils/Api'
import Request from '@/utils/Request'

import Message from '@/plugin/Message'

const contactId = ref()

//搜索
const searchResult = ref([])
const search = async () => {
  if (!contactId.value) {
    Message.warning('请输入用户ID或者群组ID')
  }
  let result = await Request({
    url: Api.search,
    params: {
      contactId: contactId.value
    }
  })
  if (!result) {
    return
  }
  searchResult.value = result.data
}
</script>

<style scoped lang="less">
.search-form {
  padding-top: 50px;
  display: flex;
  align-items: center;

  :deep(.el-input__wrapper) {
    border-radius: 4px 0 0 4px;
    border-right: none;
  }

  .search-btn {
    background: #07c160;
    color: #fff;
    line-height: 40px;
    width: 80px;
    text-align: center;
    border-radius: 0 5px 5px 0;
    cursor: pointer;

    &:hover {
      background: #0dd36c;
    }
  }
}

.no-data {
  padding: 30px 0;
}

.search-result-panel {
  .search-result {
    padding: 30px 20px 20px 20px;
    background: #fff;
    border-radius: 5px;
    margin-top: 10px;
    position: relative;

    .contact-type {
      position: absolute;
      left: 0;
      top: 0;
      background: #2cb6fe;
      padding: 2px 5px;
      color: #fff;
      border-radius: 5px 0 0 0;
      font-size: 12px;
    }
  }

  .op-btn {
    border-radius: 5px;
    margin-top: 10px;
    padding: 10px;
    background: #fff;
    text-align: center;
  }
}
</style>
