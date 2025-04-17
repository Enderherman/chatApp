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
            >发送信心
          </el-button>
          <el-button v-else type="primary" @click="addContact"> 加为好友</el-button>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AvatarBase from '@/components/AvatarBase.vue'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import Request from '@/utils/Request'
import Api from '@/utils/Api'

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

//TODO 发送消息 添加好友
const sendMessage = () => {}
const addContact = () => {}
</script>

<style scoped lang="less">
.op-btn {
  text-align: center;
  border-top: 1px solid #eaeaea;
  padding-top: 10px;
}
</style>
