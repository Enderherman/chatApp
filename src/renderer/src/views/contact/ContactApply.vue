<template>
  <ContentPanel
    v-infinite-scroll="loadApply"
    :show-top-border="true"
    :infinite-scroll-immediate="false"
  >
    <div>
      <div v-for="item in applyList" class="apply-item">
        <div :class="['contact-type', item.contactType === 0 ? 'user-contact' : '']">
          {{ item.contactType === 0 ? '好友' : '群聊' }}
        </div>
        <Avatar :user-id="item.applyUserId" :width="50"></Avatar>
        <div class="contact-info">
          <div class="nick-name">{{ item.contactName }}</div>
          <div class="apply-info">{{ item.applyInfo }}</div>
        </div>
        <div class="op-btn">
          <div v-if="item.status === 0">
            <el-dropdown placement="bottom-end" trigger="click"
              ><span class="el-dropdown-link">
                <el-button type="primary" size="small">处理请求</el-button></span
              >
              <template #dropdown>
                <el-dropdown-item @click="dealWithApply(item.applyld, item.contactType, 1)"
                  >同意
                </el-dropdown-item>
                <el-dropdown-item @click="dealWithApply(item.applyId, item.contactType, 2)"
                  >拒绝
                </el-dropdown-item>
                <el-dropdown-item @click="dealWithApply(item.applyId, item.contactType, 4)"
                  >拉黑
                </el-dropdown-item>
              </template>
            </el-dropdown>
          </div>
          <div v-else class="result-name">{{ item.statusName }}</div>
        </div>
      </div>
    </div>
    <div v-if="applyList.length === 0" class="no-data">暂无好友请求</div>
  </ContentPanel>
</template>

<script setup>
import Confirm from '@/utils/Confirm'
import Request from '@/utils/Request'
import Api from '@/utils/Api'
import { onMounted, ref } from 'vue'
import { useContactStateStore } from '@/stores/ContactStateStore'

const contactStateStore = useContactStateStore()

//获取申请
let pageNo = 0
let pageTotal = 10
const applyList = ref([])
const loadApply = async () => {
  pageNo++
  if (pageNo > pageTotal) return
  let result = await Request({
    url: Api.loadApply,
    params: {}
  })
  if (!result) {
    return
  }
  pageTotal = result.data.pageTotal
  if (result.data.list.pageNo === 1) {
    applyList.value = []
  }
  applyList.value = applyList.value.concat(result.data.list)
  pageNo = result.data.pageNo
}

//处理申请
const dealWithApply = (applyId, contactType, status) => {
  contactStateStore.setContactReload(null)
  Confirm({
    message: '确认这样操作么？不可撤销',
    okfun: async () => {
      let result = await Request({
        url: Api.dealWithApply,
        params: {
          applyId: applyId,
          status: status
        }
      })
      if (!result) {
        return
      }
      pageNo = 0
      applyList.value = []
      await loadApply()
      if (contactType === 0 && status === 1) {
        contactStateStore.setContactReload('USER')
      } else if (contactType === 1 && status === 1) {
        contactStateStore.setContactReload('GROUP')
      }
    }
  })
}

//TODO 监听新朋友圈数量

onMounted(() => loadApply())
</script>

<style scoped lang="less">
.apply-item {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding: 10px 0;

  .contact-type {
    display: flex;
    justify-content: center;
    writing-mode: vertical-rl;
    vertical-align: middle;
    background: #2cb6fe;
    color: #fff;
    border-radius: 5px 0 0 5px;
    height: 50px;
  }

  .user-contact {
    background: #08bf61;
  }

  .contact-info {
    width: 260px;
    margin-left: 10px;

    .nick-name {
      color: #000000;
    }

    .apply-info {
      color: #999999;
      font-size: 12px;
      margin-top: 5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
