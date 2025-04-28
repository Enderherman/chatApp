<template>
  <ContentPanel>
    <div class="user-info">
      <UserBaseInfo :user-info="userInfo"></UserBaseInfo>
      <div class="more-op">
        <el-dropdown placement="bottom-end" trigger="click">
          <span class="el-dropdown-link">
            <div class="iconfont icon-more"></div>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="updateRemark">TODO 设置备注</el-dropdown-item>
              <el-dropdown-item @click="delContact">删除联系人</el-dropdown-item>
              <el-dropdown-item @click="addContact2BlackList">加入黑名单</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="part-item">
      <div class="part-row">
        <div class="part-title">备注名</div>
        <div class="part-content">TODO 没拓展呢</div>
      </div>
      <div class="part-row">
        <div class="part-title">个性签名</div>
        <div class="part-content">{{ userInfo?.personalSignature || '...' }}</div>
      </div>
    </div>
    <div class="op-btn">
      <el-button type="primary" @click="sendMessage"
        >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;发消息&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      </el-button>
    </div>
  </ContentPanel>
</template>

<script setup>
import { watch, ref } from 'vue'
import Request from '@/utils/Request'
import Api from '@/utils/Api'
import { useRoute, useRouter } from 'vue-router'
import Confirm from '@/utils/Confirm'
import { useContactStateStore } from '@/stores/ContactStateStore'

const contactStoreState = useContactStateStore()
const route = useRoute()
const router = useRouter()
const userInfo = ref({})
//获取联系人信息
const loadUserDetail = async (contactId) => {
  let result = await Request({
    showLoading: false,
    url: Api.getContactUserInfo,
    params: {
      contactId: contactId
    }
  })
  if (!result) {
    return
  }
  userInfo.value = result.data
}
//加入黑名单
const addContact2BlackList = () => {
  Confirm({
    showLoading: false,
    message: '确定要将用户加入黑名单？不可撤销！',
    okfun: async () => {
      let result = await Request({
        url: Api.addContact2BlackList,
        params: {
          contactId: userInfo.value.userId
        }
      })
      if (!result) {
        return
      }
      delContactData()
    }
  })
}
//删除好友
const delContact = () => {
  Confirm({
    showLoading: false,
    message: '确认删除好友？',
    okfun: async () => {
      let result = await Request({
        url: Api.delContact,
        params: {
          contactId: userInfo.value.userId
        }
      })
      if (!result) {
        return
      }
      delContactData()
    }
  })
}
//删除好友数据
const delContactData = () => {
  contactStoreState.setContactReload(null) // 先清空
  setTimeout(() => {
    contactStoreState.setContactReload('REMOVE_USER') // 再重新赋值
  }, 0)
}

//发消息
const sendMessage = () => {
  router.push({
    path: '/chat',
    query: {
      chatId: userInfo.value.userId,
      timestamp: new Date().getTime()
    }
  })
}
//修改备注
const updateRemark = () => {}
watch(
  () => route.query.contactId,
  (newVal, oldVal) => {
    if (newVal) {
      loadUserDetail(newVal)
    }
  },
  { immediate: true, deep: true }
)
</script>

<style scoped lang="less">
.user-info {
  position: relative;

  .more-op {
    position: absolute;
    right: 0;
    top: 20px;

    .icon-more {
      color: #9e9e9e;

      &:hover {
        background: #dddddd;
      }
    }
  }
}

.part-item {
  display: flex;
  flex-direction: column; /* 让子项垂直排列 */
  border-top: 1px solid #eaeaea;
  border-bottom: 1px solid #eaeaea;
  padding: 10px 0;

  .part-row {
    display: flex;
    align-items: center; /* 让标题和内容对齐 */
    padding: 5px 0;
  }

  .part-title {
    width: 80px; /* 调整标题宽度 */
    color: #9e9e9e;
  }

  .part-content {
    flex: 1;
    margin-left: 15px;
    color: #161616;
  }
}

.op-btn {
  border-radius: 5px;
  margin-top: 10px;
  padding: 20px;
  text-align: center;
}
</style>
