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
        <UserBaseInfo
          :user-info="searchResult"
          :show-area="searchResult.contactType === 'USER'"
        ></UserBaseInfo>
      </div>
      <div v-if="searchResult.contactId !== userInfoStore.getInfo().userId" class="op-btn">
        <el-button
          type="primary"
          v-if="
            searchResult.status == null ||
            searchResult.status === 0 ||
            searchResult.status === 2 ||
            searchResult.status === 3 ||
            searchResult.status === 4
          "
          @click="applyContact"
        >
          {{ searchResult.contactType === 'USER' ? '添加联系人' : '申请加入群组' }}
        </el-button>
        <el-button v-if="searchResult.status === 1" type="primary" @click="sendMessage"
          >发送消息</el-button
        >
        <span v-if="searchResult.status === 5 || searchResult.status === 6">对方拉黑了你 </span>
      </div>
    </div>
    <div v-if="!searchResult" class="no-data">没有结果都</div>
  </ContentPanel>
  <SearchAdd ref="searchAddRef" @reload="resetFrom"></SearchAdd>
</template>

<script setup>
import { computed, ref } from 'vue'

import Api from '@/utils/Api'
import Request from '@/utils/Request'

import Message from '@/plugin/Message'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import UserBaseInfo from '@/components/UserBaseInfo.vue'
import SearchAdd from '@/views/contact/SearchAdd.vue'

const userInfoStore = useUserInfoStore()

const contactId = ref()
const contactTypeName = computed(() => {
  if (userInfoStore.getInfo().userId === searchResult.value.contactId) {
    return '自己'
  } else if (searchResult.value.contactType === 'USER') {
    return '用户'
  } else return '群组'
})

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

const searchAddRef = ref()
const applyContact = () => {
  searchAddRef.value.show(searchResult.value)
}

/**
 * 重置表单
 */
const resetFrom = () => {
  searchAddRef.value = {}
  contactId.value = undefined
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
