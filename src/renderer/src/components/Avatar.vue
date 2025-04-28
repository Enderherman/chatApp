<template>
  <div>
    <AvatarBase
      v-if="userId === 'Urobot'"
      :user-id="userId"
      :width="width"
      :border-radius="borderRadius"
      :show-details="false"
    >
    </AvatarBase>
    <el-popover
      v-else
      :width="280"
      placement="right-start"
      :show-arrow="false"
      trigger="click"
      transition="none"
      :hide-after="0"
      ref="popoverRef"
      @show="getContactInfo"
    >
      <template #reference>
        <AvatarBase
          :user-id="userId"
          :width="width"
          :border-radius="borderRadius"
          :show-details="false"
        >
        </AvatarBase>
      </template>
      <template #default>
        <div class="popover=ser-panel">
          <UserBaseInfo :user-info="userInfo"></UserBaseInfo>
        </div>
        <div v-if="userId !== userInfoStore.getInfo().userId" class="op-btn">
          <el-button v-if="userInfo.contactStatus === 1" type="primary" @click="sendMessage"
            >发送信息
          </el-button>
          <el-button v-else type="primary" @click="addContact"> 加为好友</el-button>
        </div>
      </template>
    </el-popover>
    <SearchAdd ref="searchAddRef" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SearchAdd from '@/views/contact/SearchAdd.vue'
import AvatarBase from '@/components/AvatarBase.vue'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import Request from '@/utils/Request'
import Api from '@/utils/Api'

import { useRouter } from 'vue-router'

const router = useRouter()
const userInfoStore = useUserInfoStore()
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
  groupId: {
    type: String
  }
})

const userInfo = ref([])
const getContactInfo = async () => {
  userInfo.value.userId = props.userId
  if (userInfoStore.getInfo().userId === props.userId) {
    userInfo.value = userInfoStore.getInfo()
  } else {
    let result = await Request({
      url: Api.getContactInfo,
      params: {
        contactId: props.userId
      },
      showLoading: false
    })
    if (!result) {
      return
    }
    userInfo.value = Object.assign({}, result.data)
  }
}

//发送消息
const emit = defineEmits(['closeDrawer'])
const popoverRef = ref()
const sendMessage = () => {
  popoverRef.value.hide()
  emit('closeDrawer')
  router.push({
    path: '/chat',
    query: {
      chatId: props.userId,
      timestamp: new Date().getTime()
    }
  })
}

// 添加好友
const searchAddRef = ref()
const addContact = () => {
  popoverRef.value.hide()
  searchAddRef.value.show({
    contactId: props.userId,
    contactType: 'USER'
  })
  emit('closeDrawer')
}
</script>

<style scoped lang="less">
.op-btn {
  text-align: center;
  border-top: 1px solid #eaeaea;
  padding-top: 10px;
}
</style>
